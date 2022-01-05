import time
import csv
import os
import pathlib

class Datalog():
    def __init__(self, path):
        self.path = path
        pathlib.Path(self.path).mkdir(parents=True, exist_ok=True)
        self.begin_time = time.time()
        self.file_name = time.strftime("%Y%m%d-%H%M%S") + ".csv"
        full_path = os.path.join(path, self.file_name)
        print("Datalogging to " + full_path)
        self.file_stream = open(full_path, "w")
        self.writer = csv.writer(self.file_stream)
        self.header = ["TIME", "CODE", "DATA"]
        self.writer.writerow(self.header)
        self.file_stream.flush()

    def log_data(self, data, code="MISC"):
        data = [(time.time()-self.begin_time),
                code, str(data).replace('\n', '')]
        self.writer.writerow(data)
        self.file_stream.flush()
