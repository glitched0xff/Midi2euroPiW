#################################################################################################################
# UDP server EuroPi
# v 0.1
# 02-14-24
# Author: glitched0xff
# glitched0xff@tracciabi.li
# License: AGPL-3
#
# The europi (based on raspberry PI Pico W) server receive message and route message to assigned cv.
# The server receive message in this format {"topic":"/europi/CVOUT","message":"VALUE"} where CVOUT
# can be cv1..cv6 and VALUE is the value prepocessed by sender in v.
#
# UDP server Europi is ready only for receive message from wifi
# Next update is stream data from input of EuroPi
#
# Europi is an eurorack module based on raspberry Pi Pico, is a project from Allen-Synthesis
# take a look : https://github.com/Allen-Synthesis/EuroPi
#
################################################################################################################

import network
import socket
import select
import json
import time
import wificonfig
import time
from europi import *
from parseMsg import parseMessage

# Essid will be the name of network
network="wwww4"
# Password of Europi network
pwd="123456789"

ap=network.WLAN(network.AP_IF)
ap.config(essid=network,password=pwd)
ap.active(True)

apConfig=ap.ifconfig()

print("Access point activated")
print(apConfig)
print(apConfig[0])
ip=apConfig[0]
oled.centre_text(f'ip:{ip}')

def checkMessage():
    time.sleep(0.01)
    data, addr=s.recvfrom(1024)
    ##print(addr)
    ipToSend=addr[0]
    portToSend=addr[1]
    data=data.decode().replace("'", '"')
    #print(data)
    data = json.loads(data)
    print(data)
    for d in data:
        topic=d["topic"]
        msg=d["message"]
        parseMessage(topic,msg)
    
addr_info = socket.getaddrinfo(ip, 50222)
print(addr_info)
addr = addr_info[0][-1]
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(addr)

while True:
    checkMessage()