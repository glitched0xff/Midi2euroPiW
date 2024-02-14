const UDP = require('dgram');
const { log } = require('console');
const UDPclient = UDP.createSocket('udp4')
let port = 50222 // porta Server udp PIcoW
let hostname = '192.168.4.1' // IP Pico W 192.168.4.1

const sendUdpMessage = async (message,debug=false)=>{
    if(debug==true){
        console.log(message)
    }
    const packet = Buffer.from(message)
    UDPclient.send(packet, port, hostname, (err) => {
    if (err) {
         console.log(err)
          console.error('Failed to send packet !!')
      } 
      // else {
      //   console.error('spedito')
      // }
      })
  }

  module.exports = { sendUdpMessage }