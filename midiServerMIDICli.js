const midi = require('midi');
const {sendUdpMessage}=require('./modules/sendUdpMessage')
const { mapRange }=require('./modules/utility')
const { writeFileSync } = require('fs');
const inquirer=require("inquirer")
// Set up a new input.
const input = new midi.Input();

// Count the available input ports.
let numInputs=input.getPortCount();

// setUp CLI
const config=require('./cfg/srvMIDIUdpConf.json')
let tempConfig={}
let devices=[]
for (let i = 0; i < numInputs; i++) {
    devices.push({port:i,name:input.getPortName(i)})
}
// CLI interface
async function interface(){
  let useConfig=false
  if (config.cfg.length>0){
    useConfig=await inquirer.prompt([
      {
        type: 'confirm',
        name: 'config',
        message: 'Do you want to use existing configuration?',
        default: true,
      }
    ])
    .then(async (answers) => {
      return answers
    });

  if (useConfig.config==true){
    let opt=[]
      config.cfg.forEach(el => {
          opt.push(`${el.idCfg}:${el.device}:${el.description}`)
      });
      opt.push(new inquirer.Separator())
      opt.push(`X:Delete configuration`)
    await inquirer.prompt([{
      type: 'list',
      name: 'devConfig',
      message: 'Select device configuration',
      choices:opt
    }]).then(async (answers) => {

      let a=answers.devConfig.split(':')
      if (a[0]=="X"){
        opt=opt.slice(0,-1)
        opt.push(new inquirer.Separator())
        opt.push(`A:Abort operation`) 
        console.log(opt)
        await inquirer.prompt([{
          type: 'checkbox',
          message: 'Select toppings',
          name: 'selectCfg',
          choices:opt
        }]).then(async (answers) => {
          let ab=false
          answers.selectCfg.forEach(el => {
              console.log(el.split(':')[0])
                  if(el.split(':')[0]=="A"){
                    ab= true
                  }
                });
          if (ab==true){
            console.log("abortion")
            process.exit(0)
          } else{
            let cfgTemp=[]
            for(i=0; i<answers.selectCfg.length; i++){
              conf=answers.selectCfg[i].split(':')
              arr = config.cfg.filter(function(item) {
                  return item.idCfg != conf[0]
              })
              // for (y=0; i<config.cfg.length;y++){
              //   if (conf[0]!=config.cfg[y].idCfg){
              //     delete config.cfg[y]
              //   }
              // }
            }
            config.cfg=arr
            console.log(config)
            const path = './cfg/srvMIDIUdpConf.json';
            try {
              writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
              await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'end',
                  message: 'The preset is deleted, restart server for reload',
                  default: true,
                }
              ])
              .then(async (answers) => {
                console.log("File Ok")
                process.exit(0)
              });
            } catch (error) {
              console.log('An error has occurred ', error);
            }
          }
        })
      }
      else{
        config.cfg.forEach(e=>{
          if (e.idCfg==parseInt(a[0])){
            tempConfig=e
          }
        })
      }
    })
  } else {
    // select device
    let opt=[]
    for (let i = 0; i < numInputs; i++) {
      opt.push(`${i}:${input.getPortName(i)}`)
    }
    await inquirer.prompt([{
      type: 'list',
      name: 'device',
      message: 'Select device',
      choices:opt
    }]).then(async (answers) => {
      let a=answers.device.split(':')
      tempConfig.midiPort=parseInt(a[0])
      tempConfig.device=a[1]
    })
    // select type config
    let configType= await inquirer.prompt([{
      type: 'list',
      name: 'device',
      message: 'Select device',
      choices:["0:NoteOn/noteOff mode use 2 cv for pitch and gate","1:FreeCvs mode let you config cv for pot and fader control"]
    }]).then(async (answers) => {
      let a=answers.device.split(':')
      return a[0]
    })
    // Config noteOnOff
    if (configType=="0"){
      let stillConf=false
      tempConfig.mode="noteOnOff"
      await inquirer.prompt([{
        type: 'input',
        name: 'noteOnMidiMessage',
        message: "Insert noteOn MIDI message cv1=pitch cv2=gate",
        default:146,
      },{
        type: 'input',
        name: 'noteOffMidiMessage',
        message: "Insert noteOff MIDI message cv2=gate",
        default:130,
      },{
        type: 'confirm',
        name: 'continue',
        message: "Do you want insert more control like modwheel pot or fader?",
        default: true,
      },]).then(async (answers) => {
        //console.log(answers)
        stillConf=answers.continue
        tempConfig.noteOnMidiMessage=parseInt(answers.noteOnMidiMessage)
        tempConfig.noteOffMidiMessage=parseInt(answers.noteOffMidiMessage)
      })
      // cv3
      if (stillConf==true){
        await inquirer.prompt([{
          type: 'input',
          name: 'com1MIDIMessage',
          message: "Insert control1 MIDI message -> Cv3",
          default:225,
        },
        {
          type: 'input',
          name: 'com1MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want insert more control like modwheel pot or fader?",
          default: false,
        },]).then(async (answers) => {
          //console.log(answers)
          stillConf=answers.continue
          tempConfig.com1Midi=parseInt(answers.com1MIDIMessage)
          tempConfig.com1ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com1ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com1CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com1CvRangeMin=parseInt(answers.cvRange.split('-')[0])
          tempConfig.com1MidiMsPs=parseInt(answers.com1MidiMsPs)
        })
        }
      if (stillConf==true){
        await inquirer.prompt([{
          type: 'input',
          name: 'com2MIDIMessage',
          message: "Insert control2 MIDI message -> Cv4",
          default:225,
        },{
          type: 'input',
          name: 'com2MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want insert more control like modwheel pot or fader?",
          default: false,
        },]).then(async (answers) => {
          //console.log(answers)
          stillConf=answers.continue
          tempConfig.com2Midi=parseInt(answers.com2MIDIMessage)
          tempConfig.com2ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com2ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com2CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com2CvRangeMin=parseInt(answers.cvRange.split('-')[0])
          tempConfig.com2MidiMsPs=parseInt(answers.com2MidiMsPs)
        })
        }
      if (stillConf==true){
        await inquirer.prompt([{
          type: 'input',
          name: 'com3MIDIMessage',
          message: "Insert control3  MIDI message -> Cv5",
          default:225,
        },{
          type: 'input',
          name: 'com3MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want insert more control like modwheel pot or fader?",
          default: false,
        },]).then(async (answers) => {
          //console.log(answers)
          stillConf=answers.continue
          tempConfig.com3Midi=parseInt(answers.com3MIDIMessage)
          tempConfig.com3ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com3ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com3CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com3CvRangeMin=parseInt(answers.cvRange.split('-')[0])
          tempConfig.com3MidiMsPs=parseInt(answers.com3MidiMsPs)
        })
        }
      if (stillConf==true){
        await inquirer.prompt([{
          type: 'input',
          name: 'com4MIDIMessage',
          message: "Insert control4  MIDI message -> Cv6",
          default:225,
        },{
          type: 'input',
          name: 'com4MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want insert more control like modwheel pot or fader?",
          default: false,
        },]).then(async (answers) => {
          //console.log(answers)
          stillConf=answers.continue
          tempConfig.com4Midi=parseInt(answers.com4MIDIMessage)
          tempConfig.com4ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com4ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com4CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com4CvRangeMin=parseInt(answers.cvRange.split('-')[0])
          tempConfig.com4Cv=answers.com4Cv
          tempConfig.com4MidiMsPs=parseInt(answers.com4MidiMsPs)
        })
        }
    }
    // Config FreeCvs
    else{
      tempConfig.mode="freeCvs"
      let jumpConf=false
      // Cv1
      await inquirer.prompt([{
        type: 'input',
        name: 'cv1MidiMessage',
        message: "Insert Cv1 MIDI message",
        default:225,
      },{
          type: 'input',
          name: 'com1MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
        type: 'input',
        name: 'controlRange',
        message: "Insert control range physical control ex. 0-127",
        default:"0-127",
      },{
        type: 'input',
        name: 'cvRange',
        message: "Insert current range (0v..10v) to map physical control ex. 0-8",
        default:"0-8",
      },{
        type: 'confirm',
        name: 'continue',
        message: "Do you want end configuration?",
        default: true,
      },]).then(async (answers) => {
        //console.log(answers)
        jumpConf=answers.continue
        tempConfig.com1Midi=parseInt(answers.cv1MidiMessage)
        tempConfig.com1ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
        tempConfig.com1ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
        tempConfig.com1CvRangeMax=parseInt(answers.cvRange.split('-')[1])
        tempConfig.com1CvRangeMin=parseInt(answers.cvRange.split('-')[0])
        tempConfig.com1MidiMsPs=parseInt(answers.com1MidiMsPs)
      })
      // cv2
      if (jumpConf==false){
      await inquirer.prompt([{
        type: 'input',
        name: 'cv2MidiMessage',
        message: "Insert Cv2 MIDI message",
        default:225,
      },{
          type: 'input',
          name: 'com2MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
        type: 'input',
        name: 'controlRange',
        message: "Insert control range physical control ex. 0-127",
        default:"0-127",
      },{
        type: 'input',
        name: 'cvRange',
        message: "Insert current range (0v..10v) to map physical control ex. 0-8",
        default:"0-8",
      },{
        type: 'confirm',
        name: 'continue',
        message: "Do you want end configuration?",
        default: true,
      },]).then(async (answers) => {
        //console.log(answers)
        jumpConf=answers.continue
        tempConfig.com2Midi=parseInt(answers.cv2MidiMessage)
        tempConfig.com2ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
        tempConfig.com2ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
        tempConfig.com2CvRangeMax=parseInt(answers.cvRange.split('-')[1])
        tempConfig.com2CvRangeMin=parseInt(answers.cvRange.split('-')[0])
        tempConfig.com2MidiMsPs=parseInt(answers.com2MidiMsPs)
      })
      }
      // cv3
      if (jumpConf==false){
        
        await inquirer.prompt([{
          type: 'input',
          name: 'cv3MidiMessage',
          message: "Insert Cv3 MIDI message",
          default:225,
        },{
          type: 'input',
          name: 'com3MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want end configuration?",
          default: true,
        }]).then(async (answers) => {
          //console.log(answers)
          jumpConf=answers.continue
          tempConfig.com3Midi=parseInt(answers.cv3MidiMessage)
          tempConfig.com3ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com3ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com3CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com3CvRangeMin=parseInt(answers.cvRange.split('-')[0])
        tempConfig.com3MidiMsPs=parseInt(answers.com3MidiMsPs)
        })
      }
      // cv4
      if (jumpConf==false){
        
        await inquirer.prompt([{
          type: 'input',
          name: 'cv4MidiMessage',
          message: "Insert Cv4 MIDI message",
          default:225,
        },{
          type: 'input',
          name: 'com4MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want end configuration?",
          default: true,
        },]).then(async (answers) => {
          //console.log(answers)
          jumpConf=answers.continue
          tempConfig.com4Midi=parseInt(answers.cv4MidiMessage)
          tempConfig.com4ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com4ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com4CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com4CvRangeMin=parseInt(answers.cvRange.split('-')[0])
        tempConfig.com4MidiMsPs=parseInt(answers.com4MidiMsPs)
        })
      }
      // cv5
      if (jumpConf==false){
        
        await inquirer.prompt([{
          type: 'input',
          name: 'cv5MidiMessage',
          message: "Insert Cv5 MIDI message",
          default:225,
        },{
          type: 'input',
          name: 'com1MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want end configuration?",
          default: true,
        },]).then(async (answers) => {
          //console.log(answers)
          jumpConf=answers.continue
          tempConfig.com5Midi=parseInt(answers.cv5MidiMessage)
          tempConfig.com5ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com5ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com5CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com5CvRangeMin=parseInt(answers.cvRange.split('-')[0])
          tempConfig.com5MidiMsPs=parseInt(answers.com5MidiMsPs)
        })
      }
      // cv6
      if (jumpConf==false){
        
        await inquirer.prompt([{
          type: 'input',
          name: 'cv6MidiMessage',
          message: "Insert Cv6 MIDI message",
          default:225,
        },{
          type: 'input',
          name: 'com6MidiMsPs',
          message: "Insert the position in MIDI array ex. MIDI msg=224,0,64 my message is 224 the position is 0",
          default:1,
        },{
          type: 'input',
          name: 'controlRange',
          message: "Insert control range physical control ex. 0-127",
          default:"0-127",
        },{
          type: 'input',
          name: 'cvRange',
          message: "Insert current range (0v..10v) to map physical control ex. 0-8",
          default:"0-8",
        },{
          type: 'confirm',
          name: 'continue',
          message: "Do you want end configuration?",
          default: true,
        },]).then(async (answers) => {
          //console.log(answers)
          jumpConf=answers.continue
          tempConfig.com6Midi=parseInt(answers.cv6MidiMessage)
          tempConfig.com6ControllerRangeMax=parseInt(answers.controlRange.split('-')[1])
          tempConfig.com6ControllerRangeMin=parseInt(answers.controlRange.split('-')[0])
          tempConfig.com6CvRangeMax=parseInt(answers.cvRange.split('-')[1])
          tempConfig.com6CvRangeMin=parseInt(answers.cvRange.split('-')[0])
          tempConfig.com6MidiMsPs=parseInt(answers.com6MidiMsPs)
        })
      }  
  }
  // saveConf
  let saveConf=await inquirer.prompt([
    {
      type: 'confirm',
      name: 'saveConf',
      message: "Do you want save configuration?",
      default: true,
      }]).then(async (answers) => {  
        return answers.saveConf
    })
  if (saveConf==true){
    await inquirer.prompt([{
      type:'input',
      name:'description',
      message: "Insert short description:",
      default: new Date().toString().substring(4,21)
    }]).then(async (answers)=>{
        tempConfig.idCfg=config.cfg[config.cfg.length-1].idCfg+1
        tempConfig.date=new Date();
        tempConfig.description=answers.description
        config.cfg.push(tempConfig)
        console.log(config)
        const path = './cfg/srvMIDIUdpConf.json';
        try {
          writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
          console.log('Data successfully saved to disk');
        } catch (error) {
          console.log('An error has occurred ', error);
        }
      })
  }
}
    console.log(tempConfig)
    // Open the  Midi port.
    for (let i = 0; i < numInputs; i++) {
      if (input.getPortName(i).trim()==tempConfig.device.trim()){
        tempConfig.midiPort=i
      }
      else{
        console.log('diversa')
      }
    }

    if (tempConfig.midiPort!=null){
      input.openPort(tempConfig.midiPort);
    }
    else{
      console.log("Device MIDI not found, retry to configure")
      process.exit(0)
    }
}
}


input.on('message',async (deltaTime, message) => {
  // debug
  let msg=""
  let lastCom1,lastCom2,lastCom3,lastCom4,lastCom5,lastCom6=""
  if (message!=248){
    console.log(`m: ${message} `);
  }
  if (tempConfig.mode=="freeCvs"){
    if ((typeof tempConfig.com1Midi!="undefined")&&(message[tempConfig.com1MidiMsPs]==tempConfig.com1Midi)) { // arturia 176 sh1 178
      let v=mapRange(message[2],tempConfig.com1ControllerRangeMin,tempConfig.com1ControllerRangeMax,tempConfig.com1CvRangeMax,tempConfig.com1CvRangeMin)  
      if(v!=lastCom1){
              msg=`[{"topic":"/europi/cv1","message":"${v}"}]`
            sendUdpMessage(msg,true)
        }
        lastCom1=v
      }
    if ((typeof tempConfig.com2Midi!="undefined")&&(message[tempConfig.com2MidiMsPs]==tempConfig.com2Midi)) { // arturia 176 sh1 178
      let v=mapRange(message[2],tempConfig.com2ControllerRangeMin,tempConfig.com2ControllerRangeMax,tempConfig.com2CvRangeMax,tempConfig.com2CvRangeMin)  
      if(v!=lastCom2){
              msg=`[{"topic":"/europi/cv2","message":"${v}"}]`
            sendUdpMessage(msg,true)
        }
        lastCom2=v
      }
    if ((typeof tempConfig.com3Midi!="undefined")&&(message[tempConfig.com3MidiMsPs]==tempConfig.com3Midi)) { // arturia 176 sh1 178
      let v=mapRange(message[2],tempConfig.com3ControllerRangeMin,tempConfig.com3ControllerRangeMax,tempConfig.com3CvRangeMax,tempConfig.com3CvRangeMin)  
      if(v!=lastCom3){
              msg=`[{"topic":"/europi/cv3","message":"${v}"}]`
            sendUdpMessage(msg,true)
        }
        lastCom3=v
      }
    if ((typeof tempConfig.com4Midi!="undefined")&&(message[tempConfig.com4MidiMsPs]==tempConfig.com4Midi)) { // arturia 176 sh1 178
      let v=mapRange(message[2],tempConfig.com4ControllerRangeMin,tempConfig.com4ControllerRangeMax,tempConfig.com4CvRangeMax,tempConfig.com4CvRangeMin)  
      if(v!=lastCom4){
              msg=`[{"topic":"/europi/cv4","message":"${v}"}]`
            sendUdpMessage(msg,true)
        }
        lastCom4=v
      }
    if ((typeof tempConfig.com5Midi!="undefined")&&(message[tempConfig.com5MidiMsPs]==tempConfig.com5Midi)) { // arturia 176 sh1 178
      let v=mapRange(message[2],tempConfig.com5ControllerRangeMin,tempConfig.com5ControllerRangeMax,tempConfig.com5CvRangeMax,tempConfig.com5CvRangeMin)  
      if(v!=lastCom5){
              msg=`[{"topic":"/europi/cv5","message":"${v}"}]`
            sendUdpMessage(msg,true)
        }
        lastCom5=v
      }
    if ((typeof tempConfig.com6Midi!="undefined")&&(message[tempConfig.com6MidiMsPs]==tempConfig.com6Midi)) { // arturia 176 sh1 178
      let v=mapRange(message[2],tempConfig.com6ControllerRangeMin,tempConfig.com6ControllerRangeMax,tempConfig.com6CvRangeMax,tempConfig.com6CvRangeMin)  
      if(v!=lastCom6){
              msg=`[{"topic":"/europi/cv6","message":"${v}"}]`
            sendUdpMessage(msg,true)
        }
        lastCom6=v
      }
    
  }
  else{
      if (message[0]==tempConfig.noteOnMidiMessage){
        let v=(message[1]-47)*(1/12) //arturia 12
         msg=`[{"topic":"/europi/cv2}","message":"true"},{"topic":"/europi/cv1","message":"${v}"}]`
        sendUdpMessage(msg,true)
      
    } else if (message[0]==tempConfig.noteOffMidiMessage) { // arturia 128 sh1 130
         msg=`[{"topic":"/europi/cv2","message":"false"}]`
        sendUdpMessage(msg,true)
    } else if ((typeof tempConfig.com1Midi!="undefined")&&(message[tempConfig.com1MidiMsPs]==tempConfig.com1Midi)) { // arturia 176 sh1 178
      let v=mapRange(message[2],tempConfig.com1ControllerRangeMin,tempConfig.com1ControllerRangeMax,tempConfig.com1CvRangeMax,tempConfig.com1CvRangeMin)  
      if(v!=lastCom1){
             msg=`[{"topic":"/europi/cv3","message":"${v}"}]`
            sendUdpMessage(msg,true)
        }
        lastCom1=v
    } else if ((typeof tempConfig.com2Midi!="undefined")&&(message[tempConfig.com2MidiMsPs]==tempConfig.com2Midi)) { // Arturia 224
      let v=mapRange(message[2],tempConfig.com2ControllerRangeMin,tempConfig.com2ControllerRangeMax,tempConfig.com2CvRangeMax,tempConfig.com2CvRangeMin)
      if(v!=lastCom2){
        let msg=`[{"topic":"/europi/cv4","message":"${v}"}]`
        sendUdpMessage(msg,true)
      }
      lastCom2=v
    } else if ((typeof tempConfig.com3Midi!="undefined")&&(message[tempConfig.com3MidiMsPs]==tempConfig.com3Midi)) { // Arturia 224
      let v=mapRange(message[2],tempConfig.com3ControllerRangeMin,tempConfig.com3ControllerRangeMax,tempConfig.com3CvRangeMax,tempConfig.com3CvRangeMin)
      if(v!=lastCom3){
        let msg=`[{"topic":"/europi/cv5","message":"${v}"}]`
        sendUdpMessage(msg,true)
      }
      lastCom3=v
    } else if ((typeof tempConfig.com4Midi!="undefined")&&(message[tempConfig.com4MidiMsPs]==tempConfig.com4Midi)) { // Arturia 224
      let v=mapRange(message[2],tempConfig.com4ControllerRangeMin,tempConfig.com4ControllerRangeMax,tempConfig.com4CvRangeMax,tempConfig.com4CvRangeMin)
      if(v!=lastCom4){
        let msg=`[{"topic":"/europi/cv6","message":"${v}"}]`
        sendUdpMessage(msg,true)
      }
      lastCom4=v
    }}
});

async function main(){
  if (numInputs>0){
    let askConfig=await interface()
    console.log(askConfig)
  } else {
    console.log('No MIDI devices connected')
    process.exit()
  }
}

main()