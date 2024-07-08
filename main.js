const robot = require("@hurdlegroup/robotjs");
const { SerialPort } = require('serialport')

async function initSerialToKey() {
    const ports = await SerialPort.list()
    const portInfo = ports.find(p => {
        return !p.path.includes('Bluetooth-Incoming-Port')
    })
    if (!portInfo) {
        console.error('No serial detected')
        return 1
    }
    const port = new SerialPort({ path: portInfo.path, baudRate: 19200 }, function (err) {
        if (err) {
            return console.log('Error: ', err.message)
        }
    })
    port.on('data', function (data) {
        robot.typeString(data.toString())
    })
}

initSerialToKey()