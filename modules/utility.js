// Midi to Frequency
const midiToFreq = (m) =>{
    return Math.pow(2, (m - 69) / 12) * 440;
  }

// Map value on range ex: mapRange(wheel,0,127,3,8) map the value 0-127 on a range 3-8 v
const mapRange = (value, a, b, c, d) => {
    value = (value - a) / (b - a);
    return c + value * (d - c);
}

module.exports = { midiToFreq,mapRange }