
import time

def get_local_ip() -> str:
    # Source: https://stackoverflow.com/a/166589
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ret = s.getsockname()[0]
    s.close()
    return ret

def time_ms() -> int:
    return time.time_ns() // 1_000_000

def get_output(cmd) -> str:
    """
    Get the STDOUT of a shell command as a string, suppressing STDERR.
    If there is only an error (including command not found), the return will be an empty string.
    """
    import subprocess
    proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    return proc.communicate()[0].decode("utf-8")
