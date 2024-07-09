const robot = require("@hurdlegroup/robotjs");
const { SerialPort } = require('serialport')
const WebSocket = require('ws');

async function serialButtons() {
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

async function wsButtons() {
    const reconnectInterval = 2 * 1000; // 2secs
    let ws

    const connect = () => {
        ws = new WebSocket('ws://marcelbuttons.local/ws');
        ws.on('open', function () {
            console.log('Connected to Marcel');
        });
        ws.on('error', function () {
            console.log('socket error');
        });
        ws.on('close', function () {
            console.log('socket close');
            setTimeout(connect, reconnectInterval);
        });
        ws.on('message', function message(data) {
            console.log('received: %s', data);
            if (data.length === 1) {
                robot.typeString(data.toString())
            }
        });
    };

    connect()
}

module.exports = () => wsButtons()
