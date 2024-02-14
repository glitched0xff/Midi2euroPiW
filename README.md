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
The configuration are store in '''./cfg/srvMIDIUdpConf.json'''.

# Installation

## Prepare your raspberry PI pico W
1 Be carefull and replaced the pi Pico of EuroPi with fresh Pico W
2 Flash Pico W with newest official firmware download from here (https://micropython.org/download/RPI_PICO_W/)
3 Follow the basic installation of Europi instruction from step 10 (https://github.com/Allen-Synthesis/EuroPi/blob/main/software/programming_instructions.md) 
4 Upload /EuroPi-micropython/lib/parseMsg.py in ./lib on Pico W
4 Upload /EuroPi-micropython/udpServer.py on Pico W and configure the name of network and password

## Configure and launch script
1 Clone repository (https://github.com/glitched0xff/Midi2euroPiW.git)
2 cd Midi2euroPiW
3 install the dependecy npm i
3 You can sniff the Midi message with midiMonitor node midiMonitor.js
4 open an other termina and execute note midiServerMIDICLI.js

## Configurtion by cli
1 This is the first strike and you need to configure the controller for route MIDI message to Cvout
you can configure by hand in ./cfg/srvMIDIUdpConf.json and select the configuration by list or you can create new one by CLI
2 Connect your midi device
2 Start new configuration, there is 2 option NoteOnOff and FreeCvs 
- NoteOnOff is for keyboard pitch is set on cv1 and trigger on cv2, you can add more 4 control like wheel, pot or fader mapping the physical value to the cvout range (0-10)
- FreeCvs is for the control that not have noteOn/noteOff message ex, pot, fader, arduino input and il organized from cv1 and cv6. You can map physical value to cvout range (0-10)
3 Follow the instruction, the midiMonitor.js on other terminal can sniff the midi message and value.
4 Save configuration

## Let's play
1 connect your pc to euroPiW network
2 start server
3 patch your EuroPi
4 PLAY!!!


If there is just some configuration you can select from your list
