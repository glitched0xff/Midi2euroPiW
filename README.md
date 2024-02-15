# Midi2euroPiW
 Send MIDI to Cvs from wifi

# What is Europi
Europi is an reprogrammable Eurorack module from Allen-Synthesis [link](https://allensynthesis.co.uk/modules/europi.html). 

This module is based on raspberry pico pi and can be reprogrammed as you prefer using micropython. 

Here some link
- [YouTube presentation video](https://youtu.be/s4_gSMO9Mic?si=yGztF5QoFj23q2ck)
- [GitHub project](https://github.com/Allen-Synthesis/EuroPi) with a lot of information

# What is europiW
Is a little spice in europi, i have upgrade raspberry Pico to raspberry Pico W that mount wifi/bluetooth module.
You can use Midi2euroPiW for drive 6 cv out by wifi.
The Js script create a bridge between MIDI stream and send formatted message to EuroPiW by Udp protocol

The europi original function still work.

# CLI configurator
You can create and save configuration about cv routing in CLI.
The configuration are store in `./cfg/srvMIDIUdpConf.json`.

# Installation

## Prepare your raspberry PI pico W
1. Be carefull and replaced the pi Pico of EuroPi with fresh Pico W
2. Flash Pico W with newest official firmware download from here (https://micropython.org/download/RPI_PICO_W/)
3. Follow the basic installation of Europi instruction from step 10 (https://github.com/Allen-Synthesis/EuroPi/blob/main/software/programming_instructions.md) 
4. Upload /EuroPi-micropython/lib/parseMsg.py in ./lib on Pico W
5. Upload /EuroPi-micropython/udpServer.py on Pico W and configure the name of network and password

## Configure and launch script
1. Clone repository (https://github.com/glitched0xff/Midi2euroPiW.git)
2. cd Midi2euroPiW
3. install the dependecy npm i
4. You can sniff the Midi message with midiMonitor `$ node midiMonitor.js`
5. open an other termina and execute `$ node midiServerMIDICLI.js`

## Configurtion by cli
1. This is the first strike and you need to configure the controller for route MIDI message to Cvout
you can configure by hand in `./cfg/srvMIDIUdpConf.json` and select the configuration by list or you can create new one by CLI
2. Connect your midi device
3. Start new configuration, there is 2 option NoteOnOff and FreeCvs 
- NoteOnOff is for keyboard pitch is set on cv1 and trigger on cv2, you can add more 4 control like wheel, pot or fader mapping the physical value to the cvout range (0-10)
- FreeCvs is for the control that not have noteOn/noteOff message ex, pot, fader, arduino input and il organized from cv1 and cv6. You can map physical value to cvout range (0-10)
4. Follow the instruction, the `midiMonitor.js` on other terminal can sniff the midi message and value.
5. Save configuration

## Let's play
1. connect your pc to euroPiW network
2. start server
3. patch your EuroPi
4. PLAY!!!

# Configuration mode
There is two kind of configuratione mode noteOnOff and FreeCvs

## noteOnOff
Is use with keyboard and can accept the noteOn and noteOff message and until 4 other controller ex. pitch Wheel, mod Weel, and other pot

Default cv mapping:
| control |cvout|
|---------|-----|
| cvPitch | cv1 |
| cvTrig  | cv2 |
| com1    | cv3 |
| com2    | cv4 |
| com3    | cv5 |
| com4    | cv6 |

## FreeCvs
This mode is use for mapping pot, fader, sensor that not use noteOn noteOff and assign every staff to different cv ot from cv1 to cv6

Default cv mapping:
| control |cvout|
|---------|-----|
| com1    | cv1 |
| com2    | cv2 |
| com3    | cv3 |
| com4    | cv4 |
| com5    | cv5 |
| com6    | cv6 |


# Config file

The configuration `./cfg/srvMIDIUdpConf.json`
Prefix comX refer to different controller

```
      "midiPort": 0,
      "device": "UMX 250",
      "mode": "noteOnOff",
      "noteOnMidiMessage": 144,
      "noteOffMidiMessage": 128,
      "comxMidi": 1,
      "comxControllerRangeMax": 127,
      "comxControllerRangeMin": 0,
      "comxCvRangeMax": 8,
      "comxCvRangeMin": 0,
      "comxMidiMsPs": 1,
```

| Value  | Type | Description|
| ---------------------- | ------ | ---------------------------------------------------- |
| midiPort               | int    | self assigned by script during configuratione |
| device                 | string | device name retrive by script configuration |
| mode                   | string | noteOnOff or FreeCvs is the kind of configuration|
| noteOnMidiMessage      | int    | MIDI message noteOn trig cvTrig (cv2) and send pitch value to cvPitch (cv1)|
| noteOffMidiMessage     | int    | MIDI message noteOff trig cvTrig (cv2)|
| comxMidi               | int    | MIDI message othe control pot/fader/sensor |
| comxControllerRangeMax | int    | max value of physical MIDI controller ex. 127 |
| comxControllerRangeMin | int    | max value of physical MIDI controller ex. 0 |
| comxCvRangeMax         | int    | max value of cvout in volt, range max 10v |
| comxCvRangeMin         | int    | min value of cvout in volt, range min 0v |
| comxMidiMsPs           | int    | The position of midi message in MIDI array, MIDI array is [x,y,z] and the messagecould be in pos 0 or 1 |


# EsterEgg
Send data from Touchdesigner to Europi W on Wifi
You can download and use touchDesignerUDPSender.toe for send everything from TD.
Be carefull that cvOut range is 0-10 and can't have negative value
Follow the installation step for update EuroPi with UDP script and launch `./touchDesignerUDPSender/touchDesignerUDPSender.toe`

![Screenshot 2024-02-15 alle 21 35 57](https://github.com/glitched0xff/Midi2euroPiW/assets/28891042/75b65eee-9e55-4768-b70f-d1c149fb6904)
