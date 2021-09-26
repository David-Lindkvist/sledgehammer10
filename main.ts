//  Written by David A. Lindkvist 2021-07-26
//  -- Tuneable variables --
let delay = 20
//  Millisecond delay for main loop. Signal read frequency = (1000/delay) Hz
let input_pin = AnalogPin.P2
//  MicroBit pin where sensor is connected
let noise_threshold = 4
//  Threshold for noise filter. Must be bigger then signal noise.
let total_goal = 100
//  Hold the goal for the total. When reached the game starts over.
//  -- Other global variables --
let signal_base = 0
//  Hold the signal value from base pressure.
let total = 0
//  Stores accumulated signal impulses.
let last_value = 0
//  Hold the previous signal value. Used to calculate signal change over time.
let recording = false
//  Used to pause main loop
let start_time = 0
//  Holds the time when last game started
let bluetooth_connected = false
//  Holds wether a device is connected via bluetooth or not
let debug = true
//  Turns on debug prints on bluetooth
//  Run this on startup
bluetooth.startUartService()
restart()
function restart() {
    
    
    
    
    
    recording = false
    signal_base = pins.analogReadPin(input_pin)
    total = 0
    last_value = signal_base
    let elapsed_time = input.runningTime()
    recording = true
}

basic.forever(function on_forever() {
    let recording: boolean;
    
    if (recording) {
        basic.pause(delay)
        handle_input()
    }
    
    if (total > total_goal) {
        recording = false
        display_goal_screen()
        restart()
    }
    
})
//  Main loop
function handle_input() {
    
    
    
    
    
    
    let signal = pins.analogReadPin(input_pin)
    let area = (signal + last_value) / 2 - (signal_base + noise_threshold)
    if (!(area < 0)) {
        total += area
        if (debug) {
            bluetooth.uartWriteValue("- area", Math.round(area))
            bluetooth.uartWriteValue("signal", signal)
        }
        
    }
    
    display_total()
}

function display_total() {
    
    
    let lit_leds = Math.round(Math.map(total, 0, total_goal, 0, 25))
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (5 * y + x <= lit_leds) {
                led.plot(x, y)
            }
            
        }
    }
}

function display_goal_screen() {
    for (let i = 0; i < 6; i++) {
        basic.showLeds(`
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            `)
        basic.clearScreen()
        basic.pause(25)
    }
}

bluetooth.onBluetoothConnected(function on_bluetooth_connected() {
    
    bluetooth_connected = true
})
bluetooth.onBluetoothDisconnected(function on_bluetooth_disconnected() {
    
    bluetooth_connected = false
})
