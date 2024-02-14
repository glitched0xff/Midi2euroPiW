#################################################################################################################
# UDP server EuroPi
# Parsing received message from UDPserver
# v 0.1
# 02-14-24
# Author: glitched0xff
# glitched0xff@tracciabi.li
# License: AGPL-3
#
# Parsing received message from UDPserver
#################################################################################################################


from europi import *

## State machine function
def parseMessage(topic,msg):
    topics=topic.split("/")
   ## topics=str(topic.decode('ASCII')).split("/")
   ## msg=msg.decode('ASCII')
    #print (topics)
    #print (msg)
    if len(topics)>2 and topics[1]=='europi':
        #print("pass")
        if topics[2]!="btn1" and topics[2]!="btn2" and topics[2]!="pot1" and topics[2]!="pot2":
            if topics[2]=="cv1":
                cv1Fnc(msg)
            elif topics[2]=="cv2":
                cv2Fnc(msg)
            elif topics[2]=="cv3":
                cv3Fnc(msg)
            elif topics[2]=="cv4":
                cv4Fnc(msg)
            elif topics[2]=="cv5":
                cv5Fnc(msg)
            elif topics[2]=="cv6":
                cv6Fnc(msg)
            else:
                print("Messaggio generico: %s / %s - %s",[str(topics[1]),str(topics[2]),str(msg)])
            

## Cv1 message rule
def cv1Fnc(msg):
    #print("CV1 msg: %s",msg)
    if msg=="true":
        cv1.on()
    elif msg=="false":
        cv1.off()
    else:
        val=float(msg)
        cv1.voltage(val)
    #print("CV1:"+msg)
    oled.centre_text("CV1:"+msg[0:6])

## Cv2 message rule
def cv2Fnc(msg):
    # print("CV2 msg: %s",msg)
    if msg=="true":
        cv2.on()
    elif msg=="false":
        cv2.off()
    else:
        val=float(msg)
        cv2.voltage(val)
    #print("CV2:"+msg)
    oled.centre_text("CV2:"+msg[0:6])
## Cv3 message rule
def cv3Fnc(msg):
    # print("CV3 msg: %s",msg)
    if msg=="true":
        cv3.on()
    elif msg=="false":
        cv3.off()
    else:
        val=float(msg)
        cv3.voltage(val)
    #print("CV3:"+msg)
    oled.centre_text("CV3:"+msg[0:6])
    
## Cv4 message rule
def cv4Fnc(msg):
    # print("CV4 msg: %s",msg)
    if msg=="true":
        cv4.on()
    elif msg=="false":
        cv4.off()
    else:
        val=float(msg)
        cv4.voltage(val)
    #print("CV4:"+msg)
    oled.centre_text("CV4:"+msg[0:6])

## Cv5 message rule
def cv5Fnc(msg):
    # print("CV5 msg: %s",msg)
    if msg=="true":
        cv5.on()
    elif msg=="false":
        cv5.off()
    else:
        val=float(msg)
        cv5.voltage(val)
    oled.centre_text("CV5:"+msg[0:6])
    #print("CV5:"+msg)

## Cv6 message rule
def cv6Fnc(msg):
    #print("CV6 msg: %s",msg)
    if msg=="true":
        cv6.on()
    elif msg=="false":
        cv6.off()
    else:
        val=float(msg)
        cv6.voltage(val)
    oled.centre_text("CV6:"+msg[0:6])
    #print("CV6:"+msg)
