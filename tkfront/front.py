from tkinter import *
import asyncio

window = Tk()

# Buttons
on = PhotoImage(file ="on-2.png")
off = PhotoImage(file="off-2.png")

window.columnconfigure(0, minsize=250)
window.rowconfigure([0, 1], minsize=100)

# Primary frames

safetyFrm = Frame(master=window, width=640, height=720*0.2, bg="grey")
safetyFrm.grid(row=0, column=0, padx=5, pady=5)
safetyFrm.pack_propagate(False)
safetyFrm.grid_propagate(False)

# Arming frames
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

sequenceFrm = Frame(master=window, width=640, height=720*0.2, bg="grey")
sequenceFrm.grid(row=0, column=1, padx=5, pady=5)

graphFrm = Frame(master=window, width=640, height=720*0.8, bg="lightblue")
graphFrm.grid(row=1, column=1, padx=5, pady=5)

def updateUI(data):
    """
    Updates the UI at every pass of the while loop. This includes:
    - buttons
    - data viewing
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