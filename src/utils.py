
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
    return int(time.time_ns() // 1_000_000)

def get_output(cmd) -> str:
    """
    Get the STDOUT of a shell command as a string, suppressing STDERR.
    If there is only an error (including command not found), the return will be an empty string.
    """
    import subprocess
    proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    return proc.communicate()[0].decode("utf-8")

def exec_expr_with_locals(expr: str, **locals) -> object:
    """
    Executes a Python expression string in a context that has some local variables and returns the value
    """
    # https://stackoverflow.com/a/54190189
    def exec_expr(code):
        exec('global _cursed_global; _cursed_global = ' + code)
        global _cursed_global
        return _cursed_global
    # https://stackoverflow.com/a/58722083
    def with_context(**kw):
        def deco(fn):
            g = fn.__globals__
            g.update(kw)
            return fn
        return deco
    return with_context(**locals)(exec_expr)(expr)
