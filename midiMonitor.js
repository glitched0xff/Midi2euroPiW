const midi = require('midi');

// Come map di P5js
  function mapRange (value, a, b, c, d) {
    // first map value from (a..b) to (0..1)
    value = (value - a) / (b - a);
    // then map it from (0..1) to (c..d) and return it
    return c + value * (d - c);
}

// Set up a new input.
const input = new midi.Input();

let last
// Count the available input ports.
let inputs=input.getPortCount();
console.log(inputs)
// Get the name of a specified input port.
input.getPortName(0);
for (let i = 0; i < inputs; i++) {
    let name=input.getPortName(i);
    console.log(name)
}

// Configure a callback.
const banMessage=["248"]
input.on('message',async (deltaTime, message) => {
  if (message!=banMessage[0]){
    console.log(`m: ${message} d: ${deltaTime}`);
    last=message
  }
   
});

input.openPort(0);
input.ignoreTypes(false, false, false);
