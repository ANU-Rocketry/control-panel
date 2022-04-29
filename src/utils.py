
import os

class Path:
    "Example: Path(__file__).dir.up.join('sibling_folder').join('file.txt')"
    def __init__(self, path, isfile=None):
        self.path = path
        self.isfile = isfile if isfile is not None else os.path.isfile(self.path)

    @property
    def dir(self):
        "Get the directory containing a file"
        if self.isfile:
            return Path(os.path.dirname(self.path), isfile=False)
        else:
            return self # it's already a directory
    @property
    def up(self):
        "Get the parent directory"
        return Path(os.path.dirname(self.dir.path), isfile=False)

    def join(self, path):
        return Path(os.path.join(self.path, path))

    # `.dir.join` but it returns a string
    def file(self, name):
        return self.dir.join(name).path
    def folder(self, name):
        return self.dir.join(name).path

    def __str__(self) -> str:
        return self.path
    def __repr__(self) -> str:
        return self.path

def get_local_ip():
    # Source: https://stackoverflow.com/a/166589
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ret = s.getsockname()[0]
    s.close()
    return ret
