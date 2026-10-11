"""
Checks that LabJack I/O no longer blocks the server, using the fake LabJack.
Run from the src folder:  python3 test_labjack_worker.py

These tests simulate a hung or failing USB call by patching the fake. They cannot
show how a real U3 behaves when its USB link is disturbed - that needs a bench test.
"""
import sys
if '--dev' not in sys.argv: sys.argv.append('--dev')

import asyncio
import threading
import time

import server as server_module
from server import ControlPanelServer, SequenceStatus
from commands import ValveCommandError
from labjack import LabJackFake, LabJackWorker
from stands import LOX, ETH


def wait_until(predicate, timeout=3.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate(): return True
        time.sleep(0.005)
    return False


class Stall:
    """Patches a fake LabJack so its voltage reads hang until release() is called."""
    def __init__(self, worker):
        self.worker = worker
        self.gate = threading.Event()
        self.original = worker.lj.get_voltage
        def hung_read(pin):
            self.gate.wait()
            return self.original(pin)
        worker.lj.get_voltage = hung_read
    def release(self):
        self.worker.lj.get_voltage = self.original
        self.gate.set()


def test_snapshot_matches_direct_read():
    fake = LabJackFake(LOX)
    worker = LabJackWorker(fake)
    assert worker.wait_ready(2)
    state = worker.get_state()
    assert set(fake.get_state()) | {'stale', 'age_ms', 'error'} == set(state)
    assert state['stale'] is False and state['error'] is None
    assert set(state['digital']) == set(LOX.Valves) and set(state['analog']) == set(LOX.Sensors)


def test_valve_write_shows_in_snapshot():
    worker = LabJackWorker(LabJackFake(ETH)); assert worker.wait_ready(2)
    worker.set_valve(ETH.Main[1], True).result(timeout=1)
    assert wait_until(lambda: worker.get_state()['digital'][ETH.Main[1]] is True)


def test_command_does_not_wait_for_a_whole_poll():
    fake = LabJackFake(LOX)
    slow = fake.get_valve_state
    def slow_read(pin):
        time.sleep(0.03)   # 7 valves -> a poll takes over 200ms
        return slow(pin)
    fake.get_valve_state = slow_read
    worker = LabJackWorker(fake); assert worker.wait_ready(3)
    worst = 0
    for _ in range(10):
        time.sleep(0.037)
        started = time.monotonic()
        worker.set_valve(LOX.Main[1], True).result(timeout=1)
        worst = max(worst, time.monotonic() - started)
    assert worst < 0.1, f"command waited {worst*1000:.0f}ms"


def test_hung_read_flags_stale_and_get_state_never_blocks():
    worker = LabJackWorker(LabJackFake(LOX)); assert worker.wait_ready(2)
    stall = Stall(worker)
    try:
        assert wait_until(lambda: worker.get_state()['stale'], timeout=2)
        started = time.monotonic()
        state = worker.get_state()
        assert time.monotonic() - started < 0.01
        assert state['digital'], "last known values are still reported"
        assert worker.voltage(LOX.LOXSensor[1]) is None
    finally:
        stall.release()
    assert wait_until(lambda: not worker.get_state()['stale'])


def test_read_error_warns_once_then_recovers():
    warnings = []
    fake = LabJackFake(LOX)
    worker = LabJackWorker(fake, on_warning=warnings.append); assert worker.wait_ready(2)
    original = fake.get_voltage
    def broken(pin): raise IOError("simulated USB error")
    fake.get_voltage = broken
    assert wait_until(lambda: worker.get_state()['stale'], timeout=2)
    assert 'simulated USB error' in worker.get_state()['error']
    time.sleep(0.6)
    assert len(warnings) == 1 and 'read failed' in warnings[0], warnings
    # valve writes still go through while reads are failing
    worker.set_valve(LOX.Main[1], True).result(timeout=1)
    fake.get_voltage = original
    assert wait_until(lambda: not worker.get_state()['stale'])
    assert len(warnings) == 2 and 'responding again' in warnings[1], warnings
    assert worker.get_state()['digital'][LOX.Main[1]] is True


async def loop_lag_monitor(result):
    last = time.monotonic()
    while True:
        await asyncio.sleep(0.01)
        now = time.monotonic()
        result['worst'] = max(result.get('worst', 0), now - last)
        last = now


async def server_tests():
    server_module.VALVE_COMMAND_TIMEOUT = 0.5   # keep the test quick
    server = ControlPanelServer('127.0.0.1', 0)
    server.loop = asyncio.get_running_loop()
    sync_task = asyncio.ensure_future(server.sync_state())
    lag = {}
    lag_task = asyncio.ensure_future(loop_lag_monitor(lag))
    cmd = lambda header, data=None: server.handle_command(None, header, data, 0)
    lox, eth = server.labjacks['LOX'], server.labjacks['ETH']

    await cmd('ARMINGSWITCH', True); await cmd('MANUALSWITCH', True)
    await cmd('OPEN', {'name': 'LOX', 'pin': LOX.Main[1]})
    await asyncio.sleep(0.15)
    assert server.state.labjacks['LOX']['digital'][LOX.Main[1]] is True
    await cmd('CLOSE', {'name': 'LOX', 'pin': LOX.Main[1]})

    # --- LOX LabJack hangs ---
    stall = Stall(lox)
    await asyncio.sleep(0.7)
    assert server.state.labjacks['LOX']['stale'] is True
    assert server.state.labjacks['ETH']['stale'] is False
    assert 'LOX LabJack is not responding' in server.state.latest_warning[1]

    # the other stand's valves respond immediately
    started = time.monotonic()
    await cmd('OPEN', {'name': 'ETH', 'pin': ETH.Main[1]})
    assert time.monotonic() - started < 0.1
    await asyncio.sleep(0.15)
    assert server.state.labjacks['ETH']['digital'][ETH.Main[1]] is True

    # an OPEN on the hung stand is reported and dropped
    try:
        await cmd('OPEN', {'name': 'LOX', 'pin': LOX.Fill[1]})
        raise AssertionError("expected ValveCommandError")
    except ValveCommandError as e:
        assert 'NOT sent' in str(e), str(e)
    # a CLOSE on the hung stand is reported but stays queued
    lox.lj.state['digital'][LOX.Drain[1]] = True
    try:
        await cmd('CLOSE', {'name': 'LOX', 'pin': LOX.Drain[1]})
        raise AssertionError("expected ValveCommandError")
    except ValveCommandError as e:
        assert 'stays queued' in str(e), str(e)

    stall.release()
    await asyncio.sleep(0.3)
    assert server.state.labjacks['LOX']['stale'] is False
    assert server.state.labjacks['LOX']['digital'][LOX.Fill[1]] is False, "dropped OPEN must not take effect late"
    assert server.state.labjacks['LOX']['digital'][LOX.Drain[1]] is False, "queued CLOSE is applied on recovery"
    assert lag['worst'] < 0.1, f"event loop stalled for {lag['worst']*1000:.0f}ms"

    # --- a valve write fails mid-sequence: the abort sequence runs, status returns to IDLE ---
    await cmd('CLOSE', {'name': 'ETH', 'pin': ETH.Main[1]})
    await cmd('ARMINGSWITCH', True)
    await cmd('SETSEQUENCE', 'operation')
    original = eth.lj.set_valve_state
    calls = []
    def fail_once(pin, open):
        calls.append((pin, open))
        if len(calls) == 1: raise IOError("simulated write error")
        return original(pin, open)
    eth.lj.set_valve_state = fail_once
    await cmd('BEGINSEQUENCE')
    await asyncio.sleep(0.2)
    assert server.state.current_sequence_name == 'abort'
    assert server.state.arming_switch is False
    for _ in range(60):
        if server.state.status == SequenceStatus.IDLE: break
        await asyncio.sleep(0.1)
    assert server.state.status == SequenceStatus.IDLE
    assert (ETH.Igniter[1], False) in calls and (ETH.Pressure[1], False) in calls, "abort commands reached the LabJack"
    eth.lj.set_valve_state = original

    sync_task.cancel(); lag_task.cancel()
    return lag['worst']


if __name__ == '__main__':
    for test in (test_snapshot_matches_direct_read, test_valve_write_shows_in_snapshot,
                 test_command_does_not_wait_for_a_whole_poll,
                 test_hung_read_flags_stale_and_get_state_never_blocks,
                 test_read_error_warns_once_then_recovers):
        test(); print('ok  ', test.__name__)
    worst = asyncio.run(server_tests())
    print(f'ok   server_tests (worst event-loop gap {worst*1000:.0f}ms)')
    print('All passed')
