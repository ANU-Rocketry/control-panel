from tkinter import *
from tkinter import filedialog as fd
from tkinter import messagebox
import asyncio
from PIL import Image, ImageTk

window = Tk()

# Button photos
on = PhotoImage(file="on-2.png")
off = PhotoImage(file="off-2.png")

onRes = Image.open("on-2.png")
offRes = Image.open("off-2.png")

onSmall = ImageTk.PhotoImage(onRes.resize((40,20)))
offSmall = ImageTk.PhotoImage(onRes.resize((40,20)))

# Engine photo

engRes = Image.open("raptor.png")

engSmall = ImageTk.PhotoImage(engRes.resize((70,40)))

window.columnconfigure(0, minsize=250)
window.rowconfigure([0, 1], minsize=100)

# Safety frame
safetyFrm = Frame(master=window, width=640, height=720*0.2, bg="grey")
safetyFrm.grid(row=0, column=0, padx=5, pady=5)
safetyFrm.pack_propagate(False)
safetyFrm.grid_propagate(False)

# Arming frame
armingFrm = Frame(master=safetyFrm, width=100, height=100, bg="grey")
armingFrm.pack()

armingLbl = Label(master=armingFrm,
        text="Arming switch off",
        bg="grey",
        fg = "red",
        font = ("Helvetica",16))

armingLbl.pack()

armingBtn = Button(master=armingFrm, image=off)
armingBtn.pack()

manualFrm = Frame(master=window, width=640, height=720*0.8, bg="lightblue")
manualFrm.grid(row=1, column=0, padx=5, pady=5)

# Manual valve buttons

# Creating lines

canvas = Canvas(manualFrm, width=640, height=720*0.8, bg="lightblue")

canvas.create_line(120, 60, 545, 60, fill="black", width=3)
canvas.create_line(255,60,255,530, fill="black", width=3)
canvas.create_line(320,150,440,150, fill="black", width=3)
canvas.create_line(375,150,375,530, fill="black", width=3)
canvas.create_line(465,130,465,200, fill="black", width=3)
canvas.create_line(545, 60, 545, 140, fill="black", width=3)
canvas.create_line(545, 160, 545, 200, fill="black", width=3)
canvas.create_line(255, 380-10, 50, 380-10, fill="black", width=3)
canvas.create_line(375, 380-10, 545, 380-10, fill="black", width=3)
canvas.create_line(255, 490, 150, 490, fill="black", width=3)
canvas.create_line(375, 490, 460, 490, fill="black", width=3)

canvas.create_image(320, 520, image=engSmall)

canvas.pack(fill=BOTH, expand=1)

# Creating tanks

# ethanol tank frame

ethTankFrm = Frame(master = manualFrm, width=50, height=80, bg="white")
ethTankFrm.place(x=230,y=200)

ethTankLabel = Label(master=ethTankFrm,
        text="100 bar",
        bg = "lightblue")

# LOX tank frame

loxTankFrm = Frame(master = manualFrm, width=50, height=80, bg="white")
loxTankFrm.place(x=350,y=200)

loxTankLabel = Label(master=loxTankFrm,
        text="100 bar",
        bg = "lightblue")

# N2 ethanol tank frame

n2EthTankFrm = Frame(master = manualFrm, width=70, height=50, bg="white")
n2EthTankFrm.place(x=430,y=200)

n2EthTankLabel = Label(master=n2EthTankFrm,
        text="100 bar",
        bg = "lightblue")

# N2 lox tank fram

n2LoxTankFrm = Frame(master = manualFrm, width=70, height=50, bg="white")
n2LoxTankFrm.place(x=510,y=200)

n2LoxTankLabel = Label(master=n2LoxTankFrm,
        text="100 bar",
        bg = "lightblue")

# Button frames

# nleV3 Frame

nleV3Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
nleV3Frame.place(x=80,y=30)

nleV3Label = Label(master=nleV3Frame,
        text = "N.L.E.V3",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

nleV3Label.pack()
nleV3Btn = Button(master=nleV3Frame, image=offSmall)
nleV3Btn.pack()

# nlOV3

nloV3Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
nloV3Frame.place(x=290,y=120)

nloV3Label = Label(master=nloV3Frame,
        text = "N.L.O.V3",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

nloV3Label.pack()
nloV3Btn = Button(master=nloV3Frame, image=offSmall)
nloV3Btn.pack()

# nlOV2

nloV2Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
nloV2Frame.place(x=440,y=120)

nloV2Label = Label(master=nloV2Frame,
        text = "N.L.O.V2",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

nloV2Label.pack()
nloV2Btn = Button(master=nloV2Frame, image=offSmall)
nloV2Btn.pack()

# nleV2

nleV2Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
nleV2Frame.place(x=520,y=120)

nleV2Label = Label(master=nleV2Frame,
        text = "N.L.E.V2",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

nleV2Label.pack()
nleV2Btn = Button(master=nleV2Frame, image=offSmall)
nleV2Btn.pack()

# edfV2

edfV2Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
edfV2Frame.place(x=80-50,y=380-40)

edfV2Label = Label(master=edfV2Frame,
        text = "E.D.F.V2",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

edfV2Label.pack()
edfV2Btn = Button(master=edfV2Frame, image=offSmall)
edfV2Btn.pack()

# edfV1

edfV1Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
edfV1Frame.place(x=190-50,y=380-40)

edfV1Label = Label(master=edfV1Frame,
        text = "E.D.F.V1",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

edfV1Label.pack()
edfV1Btn = Button(master=edfV1Frame, image=offSmall)
edfV1Btn.pack()

# odfV1

odfV1Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
odfV1Frame.place(x=380+50,y=380-40)

odfV1Label = Label(master=odfV1Frame,
        text = "O.D.F.V1",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

odfV1Label.pack()
odfV1Btn = Button(master=odfV1Frame, image=offSmall)
odfV1Btn.pack()

# odfV2

odfV2Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
odfV2Frame.place(x=470+50,y=380-40)

odfV2Label = Label(master=odfV2Frame,
        text = "O.D.F.V1",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

odfV2Label.pack()
odfV2Btn = Button(master=odfV2Frame, image=offSmall)
odfV2Btn.pack()

# elv1

elV1Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
elV1Frame.place(x=230,y=420)

elV1Label = Label(master=elV1Frame,
        text = "E.L.V1",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

elV1Label.pack()
elV1Btn = Button(master=elV1Frame, image=offSmall)
elV1Btn.pack()

# olv1

odfV1Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
odfV1Frame.place(x=355,y=420)

odfV1Label = Label(master=odfV1Frame,
        text = "O.L.V1",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

odfV1Label.pack()
odfV1Btn = Button(master=odfV1Frame, image=offSmall)
odfV1Btn.pack()

# elv2

elV2Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
elV2Frame.place(x=190-50,y=460)

elV2Label = Label(master=elV2Frame,
        text = "E.L.V2",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

elV2Label.pack()
elV2Btn = Button(master=elV2Frame, image=offSmall)
elV2Btn.pack()

# olv2

olV2Frame = Frame(master = manualFrm, width=30, height=30, bg="lightblue")
olV2Frame.place(x=380+50,y=460)

olV2Label = Label(master=olV2Frame,
        text = "O.L.V2",
        bg = "lightblue",
        fg = "white",
        font = ("Helvetica", 10))

olV2Label.pack()
olV2Btn = Button(master=olV2Frame, image=offSmall)
olV2Btn.pack()

sequenceFrm = Frame(master=window, width=640, height=720*0.2, bg="grey")
sequenceFrm.grid(row=0, column=1, padx=5, pady=5)

# Create file importing, needs to improve to only take in 
# csv files.

def select_file():
    global csv_file

    filename = fd.askopenfilename(
        title='Open a file',
        initialdir='/')

    messagebox.showinfo(
        title='Selected File',
        message=filename
    )

    try:
        with open(filename, 'r') as UseFile:
            csv_file = UseFile.read()
            print(csv_file)
    
    except:
        print("No file exists")

importFrm = Frame(master=sequenceFrm, width=200, height=100, bg='lightblue')
importFrm.pack()

importLabel = Label(master=importFrm,
        text = "Importing labels",
        bg = "grey",
        fg = "white",
        font = ("Helvetica", 14))

importLabel.pack()

importBtn = Button(master=importFrm, text="Import button", 
        command=select_file)
importBtn.pack()

graphFrm = Frame(master=window, width=640, height=720*0.8, bg="lightblue")
graphFrm.grid(row=1, column=1, padx=5, pady=5)

def updateUI(data):
    """
    Updates the UI at every pass of the while loop. This includes:
    - buttons
    - data viewing
    """

def handleValveClick(button, data):
    """
    Send some command to the client to change the state...
    """



def updateValveButton(button,state):
    if state == 'ON':
        button.config(image = on)
    elif (state == 'OFF'):
        button.config(image = off)

def updateArmingSwitch(state):
    if state == 'ON':
        armingBtn.config(image = on)
        armingLbl.config(text = "Arming switch on",
                        fg = "green")
    elif (state == 'OFF'):
        armingBtn.config(image = off)
        armingLbl.config(text = "Arming switch off",
                        fg = "red")

#Keep Running the window
async def get_data(socket):
    return await socket.recv()
async def mainloop():
    #socket = websockets.something()
    while True:
        #data = await get_new_data(socket)
        window.update_idletasks()
        window.update()

asyncio.run(mainloop())