from lib.LJCommands import Command, CommandString
from tkinter import *
import asyncio
from PIL import Image, ImageTk
from LJClientWebSockets import LJClientWebSockets

window = Tk()

appLoop = asyncio.new_event_loop()
socketClient = LJClientWebSockets('127.0.0.1', 8888, appLoop)
socketClient.start_client()

# Buttons
on = PhotoImage(file="bin/images/on-2.png")
off = PhotoImage(file="bin/images/off-2.png")

onRes = Image.open("bin/images/on-2.png")
offRes = Image.open("bin/images/off-2.png")

onSmall = ImageTk.PhotoImage(onRes.resize((40, 20)))
offSmall = ImageTk.PhotoImage(onRes.resize((40, 20)))

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
                  fg="red",
                  font=("Helvetica", 16))

pingLbl = Label(master=armingFrm,
    text = )

armingLbl.pack()


def armBtn():
    appLoop.create_task(socketClient.sendCommand(
        Command(CommandString.ARMINGSWITCH)))


armingBtn = Button(master=armingFrm, image=off, command=armBtn)
armingBtn.pack()

manualFrm = Frame(master=window, width=640, height=720*0.8, bg="lightblue")
manualFrm.grid(row=1, column=0, padx=5, pady=5)

# Manual valve buttons

# nleV3 Frame

nleV3Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
nleV3Frame.place(x=80, y=30)

nleV3Label = Label(master=nleV3Frame,
                   text="N.L.E.V3",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

nleV3Label.pack()
nleV3Btn = Button(master=nleV3Frame, image=offSmall)
nleV3Btn.pack()

# nlOV3

nloV3Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
nloV3Frame.place(x=300, y=120)

nloV3Label = Label(master=nloV3Frame,
                   text="N.L.O.V3",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

nloV3Label.pack()
nloV3Btn = Button(master=nloV3Frame, image=offSmall)
nloV3Btn.pack()

# nlOV2

nloV2Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
nloV2Frame.place(x=440, y=240)

nloV2Label = Label(master=nloV2Frame,
                   text="N.L.O.V2",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

nloV2Label.pack()
nloV2Btn = Button(master=nloV2Frame, image=offSmall)
nloV2Btn.pack()

# nleV2

nleV2Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
nleV2Frame.place(x=510, y=240)

nleV2Label = Label(master=nleV2Frame,
                   text="N.L.E.V2",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

nleV2Label.pack()
nleV2Btn = Button(master=nleV2Frame, image=offSmall)
nleV2Btn.pack()

# edfV2

edfV2Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
edfV2Frame.place(x=80, y=380)

edfV2Label = Label(master=edfV2Frame,
                   text="E.D.F.V2",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

edfV2Label.pack()
edfV2Btn = Button(master=edfV2Frame, image=offSmall)
edfV2Btn.pack()

# edfV1

edfV1Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
edfV1Frame.place(x=190, y=380)

edfV1Label = Label(master=edfV1Frame,
                   text="E.D.F.V1",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

edfV1Label.pack()
edfV1Btn = Button(master=edfV1Frame, image=offSmall)
edfV1Btn.pack()

# odfV1

odfV1Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
odfV1Frame.place(x=380, y=380)

odfV1Label = Label(master=odfV1Frame,
                   text="O.D.F.V1",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

odfV1Label.pack()
odfV1Btn = Button(master=odfV1Frame, image=offSmall)
odfV1Btn.pack()

# odfV2

odfV2Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
odfV2Frame.place(x=470, y=380)

odfV2Label = Label(master=odfV2Frame,
                   text="O.D.F.V1",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

odfV2Label.pack()
odfV2Btn = Button(master=odfV2Frame, image=offSmall)
odfV2Btn.pack()

# olv1

odfV1Frame = Frame(master=manualFrm, width=30, height=30, bg="lightblue")
odfV1Frame.place(x=290, y=420)

odfV1Label = Label(master=odfV1Frame,
                   text="O.L.V1",
                   bg="lightblue",
                   fg="white",
                   font=("Helvetica", 10))

odfV1Label.pack()
odfV1Btn = Button(master=odfV1Frame, image=offSmall)
odfV1Btn.pack()

sequenceFrm = Frame(master=window, width=640, height=720*0.2, bg="grey")
sequenceFrm.grid(row=0, column=1, padx=5, pady=5)

graphFrm = Frame(master=window, width=640, height=720*0.8, bg="lightblue")
graphFrm.grid(row=1, column=1, padx=5, pady=5)


def updateValveButton(button, state):
    if state == 'ON':
        button.config(image=on)
    elif (state == 'OFF'):
        button.config(image=off)


def updateArmingSwitch():
    if socketClient.state['arming_switch']:
        armingBtn.config(image=on)
        armingLbl.config(text="Arming switch on",
                         fg="green")
    else:
        armingBtn.config(image=off)
        armingLbl.config(text="Arming switch off",
                         fg="red")

# Keep Running the window


async def updateGUI():
    while True:
        if socketClient.state:
            updateArmingSwitch()
        window.update_idletasks()
        window.update()
        await asyncio.sleep(1/60)

appLoop.create_Ttask(updateGUI())
window.update_idletasks()
window.update()
appLoop.run_forever()
