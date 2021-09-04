from datetime import date
import time


class Datalog():
    def __init__(self, path):
        self.path = path
        self.begin_time = time.time()
        self.file_name = date.today().strftime('%b-%d-%Y') + ".csv"
        self.file_stream = open(self.file_name, "w")
        self.file_stream.write(f"TIME; CODE; DATA\n")
        self.file_stream.flush()

    def log_data(self, data, code="MISC"):
        data = ((time.time-self.begin_time)
                + ";" + code + ";" + (data.replace('\n', '')))
        self.file_stream.write()
        self.file_stream.flush()

    def __del__(self):
        self.file_stream.close()
