import fs from 'fs';
import path, { resolve } from 'path';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline'
import { Dbc, Can } from 'candied';


async function can() {

    const dbc = new Dbc();
    const content = fs.readFileSync(resolve('./data/pers.dbc'), { encoding: 'ascii' });
    const dbcData = dbc.load(content)

    // Can() class allows for creation of CAN frames as well as message decoding
    const can = new Can();
    can.database = dbcData;

    // Serial setup
    const ports = await SerialPort.list()
    const portInfo = ports.find(p => {
        return !p.path.includes('Bluetooth-Incoming-Port')
    })
    if (!portInfo) {
        console.error('No serial detected')
        return 1
    }
    const port = new SerialPort({
        path: portInfo.path,
        baudRate: 115200
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', data => {
        // console.log('Raw CAN Data:', data);
        const [idHex, ...dataBytesHex] = data.split(' ');
        const id = parseInt(idHex, 16);
        const dataBytes = dataBytesHex.map(byte => parseInt(byte, 16));

        const canFrame = can.createFrame(id, dataBytes);
        // decode takes in type Frame. Returns a bound message type
        /*
            name: string;
            id: number;
            signals: Map<string, BoundSignal>;
        */
        let boundMsg = can.decode(canFrame);
        if (boundMsg?.name === 'Display_Riding_Info') {
            console.clear()
            console.log(boundMsg.boundSignals.get('displayVehicleSpeed').physValue)
        }
        /* Bound signals contain: 
            **Physical value** - Conditioned value that has any units applied, as well as any scaling, factors, and min/max values
            if any enumerations are attached the signal, the enumeration member will automatically be returned
            **Value** - Conditioned value that has scaling, factor, and min/max values applied
            **Raw Value** - Raw value as extracted according to the DBC file
        */
        // console.log(boundSignals);
    });

}

export default can