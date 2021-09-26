# Written by David A. Lindkvist 2021-07-26

# -- Tuneable variables --
delay = 20                  # Millisecond delay for main loop. Signal read frequency = (1000/delay) Hz
bar = 4         # Threshold for noise filter. Must be bigger then signal noise.
goal = 100            # Hold the goal for the total. When reached the game starts over.

# -- Other global variables --
base=0               # Hold the signal value from base pressure.
tot=0                     # Stores accumulated signal impulses.
last=0        	    # Hold the previous signal value. Used to calculate signal change over time.
recording=False             # Used to pause main loop
bluetooth_connected=False   # Holds wether a device is connected via bluetooth or not

# Run this on startup
bluetooth.start_uart_service()
setup()
def setup():
    global signal_base
    global total
    global last_value
    global recording
    global debug
    
    recording = False
    signal_base = pins.analog_read_pin(input_pin)
    total = 0
    last_value = signal_base
    elapsed_time = input.running_time()
    recording = True

basic.forever(on_forever)
# Main loop
def on_forever():
    global delay
    if recording:
        basic.pause(delay)
        handle_input()

    if tot > goal:
        recording = False
        display_goal_screen()
        restart()

def handle_input():
    global input_pin
    global noise_threshold
    global signal_base
    global total
    global last_value
    global recording

    signal = pins.analog_read_pin(input_pin)
    area = ((signal + last_value )/2 - (signal_base + noise_threshold))
    if not area < 0:
        total += area
        if debug:
            bluetooth.uart_write_value("- area", Math.round(area))
            bluetooth.uart_write_value("signal", signal)
    display_total()


def display_total():
    global total
    global total_goal
    lit_leds = Math.round(Math.map(total, 0, total_goal, 0, 25))
    for y in range(5):
        for x in range(5):
            if (5*y+x <= lit_leds):
                led.plot(x, y)

def display_goal_screen():
    for i in range(6):
        basic.show_leds("""
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            """)
        basic.clear_screen()
        basic.pause(25)

def on_bluetooth_connected():
    global bluetooth_connected
    bluetooth_connected = True
bluetooth.on_bluetooth_connected(on_bluetooth_connected)

def on_bluetooth_disconnected():
    global bluetooth_connected
    bluetooth_connected = False
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)