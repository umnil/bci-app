import {decode as atob, encode as btoa} from 'base-64'

const size = 400;

/* 
converts a string UUID in the form of DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD
to a list of integers. each dash-delimeted string of Ds 
is interpreted as a hexadecimal
integer, and the output is decimal.
*/
const uuid2int = (uuid) => {
    const segments = uuid.split('-');
    return segments.map((segment) => parseInt(segment, 16));
};

/* 
converts a list of ints into a string UUID
*/
const int2uuid = (numbers) => {
    let segments: string[] = [
        (numbers[0] % 0xFFFFFFFF).toString(16).padStart(8, "0"),
        (numbers[1] & 0xFFFF).toString(16).padStart(4, "0"),
        (numbers[2] & 0xFFFF).toString(16).padStart(4, "0"),
        (numbers[3] & 0xFFFF).toString(16).padStart(4, "0"),
        (numbers[4] % 0xFFFFFFFFFFFF).toString(16).padStart(12, "0")
    ];
    let uuid: string = segments.join("-");
    return uuid;
};

/* 
increments a UUID, which means taking the first hex int in
the dash-delim string and incrementing it.
Ex: 
Input:  0000000f-0000-0000-0000-000000000000
Output: 00000010-0000-0000-0000-000000000000
*/
const incrementUUID = (uuid, value) => {
    let numbers = uuid2int(uuid);
    numbers[0] += value;
    return int2uuid(numbers);
};

/* 
takes in an integer i and returns a 4 byte string representation
in network-byte order(nbo). This is also known as big-endian form
EX:
Input: 0xF0000000

   IDX:    0     1     2     3 
Output: { 0xF0, 0x00, 0x00, 0x00 } 
*/
const int2nbo = (i) => {
    const hexRaw = i.toString(16);
    const hexPadded = hexRaw.padStart(8, '0');
    const hexSplit = hexPadded.match(/.{1,2}/g);
    const hexOrder = hexSplit.reverse(); 
    const hexBytes = hexOrder.map(x => parseInt(x, 16));
    const hexStr = String.fromCharCode(...hexBytes);
    return hexStr;
};

/* 
takes in a network byte order (nbo, otherwise known as big-endian) 4 byte
string and converts to an int
EX:
   IDX:    0     1     2     3 
Input: { 0xF0, 0x00, 0x00, 0x00 } 

Output: 0xF0000000
*/
const nbo2int = (byteStr) => {
    const byteArr = byteStr.split('');
    const hexArr = byteArr.map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).reverse();
    const hexStr = hexArr.join('');
    const num = parseInt(hexStr, 16);
    return num;
};

/* 
takes in a string and converts to a network byte 
order (nbo, otherwise known as big-endian) string 
EX:
Input: "abc" 

                 IDX:  0    1    2
ASCII Representation: 0x97 0x98 0x99

   IDX:    0     1     2   
Output: { 0x99  0x98  0x97 }
*/
const str2nbo = (str) => {
    const charArr = str.split('');
    const hexArr = charArr.map(c => c.charCodeAt(0).toString(16));
    const hexOrder = hexArr.reverse();
    const hexBytes = hexOrder.map(x => parseInt(x, 16));
    const hexStr = String.fromCharCode(...hexBytes);
    return hexStr;
};

/* 
converts a json type to a payload.
*/
const json2payload = (json) => ({
        type: json["type"],
        total: json["total"],
        index: json["index"],
        size: json["size"],
        data: json["data"],
});        

/* 
converts a string representation of a json payload into a payload object
*/
const str2payload = (str) => {
    return json2payload(JSON.parse(str));
};

/* 
takes a manager object, deviceID(to send to) and serviceUUID(the service to which
we are streaming) and the index(# of the packet to send) and writes the index to
the remote device. this essentially tells the remote device which packet we
intend to send.
*/
const writeIdx = (manager, deviceID, serviceUUID, index) => {
    const data = btoa(int2nbo(index));
    const charUUID = incrementUUID(serviceUUID, 2);
    return manager.writeCharacteristicWithResponseForDevice(deviceID, serviceUUID, charUUID, data);
};

/* 
takes a manager object, deviceID(to send to) and serviceUUID(the service to and from which
we are ble streaming) and receives an index. This indicates which packet we are getting
*/
const readIdx = (manager, deviceID, serviceUUID) => {
    const charUUID = incrementUUID(serviceUUID, 2);
    return manager.readCharacteristicForDevice(deviceID, serviceUUID, charUUID)
    .then((characteristic) => {
        const value = characteristic.value;
        if (value == null) {
            return(null);
        } else {
            return(parseInt(nbo2int(atob(value)), 10));
        }

        
    });
};

/* 
takes a manager object, deviceID(to send to), serviceUUID(the service to and from which
we are ble streaming), and payload,  and writes a byte
representation of the payload to the device at the service. 
*/
const writePayload = (manager, deviceID, serviceUUID, payload) => { 
    const data = btoa(JSON.stringify(payload));
    const charUUID = incrementUUID(serviceUUID, 1);
    return manager.writeCharacteristicWithResponseForDevice(deviceID, serviceUUID, charUUID, data);
};

/* 
takes a manager object, deviceID(to send to), serviceUUID(the service to and from which
we are ble streaming), and payload, and reads a byte
representation of the payload from the device at the service. 
*/
const readPayload = (manager, deviceID, serviceUUID, index) => {
    const charUUID = incrementUUID(serviceUUID, 1);
    return manager.readCharacteristicForDevice(deviceID, serviceUUID, charUUID) 
    .then((characteristic) => {
        const value = characteristic.value;
        if (value == null) {
            return(null);
        } else {
         return(atob(value)); 
        }
    })
};

/* 
takes a boolean function condition and a promise action and 
sequences the action based off of the truth of the condition. For
example, suppose we had a global state of a = 0, condition = () => {a != 5} and 
action sleeps for 10 seconds and increments a by 1. We have
promiseWhile(condition, action) will check if a is not 5, sleep for 10 seconds,
increment a five times.
*/
const promiseWhile = (condition, action) => {
    const nextIter = () => {
        if (!condition()) return; 
        return action().then(() => nextIter());
    }; 
    return nextIter();
};

/* 
this function takes in a manager, deviceID, and serviceUUID, and
creates a notifyHandler which writes a 0 index and on success sets 
an indicator variable to 1. This indicator variable can be read in the readIndicator
function. The purpose of this combination is to provide a callback 
for the characteristic monitoring function of the BleManager and also providing
a way to see if a notification has occured.

For example, if after we have started the monitor service, we are in
a promiseWhile loop conditioned on readIndicator == 1, then once 
we receive a notification, the monitor service will call the notification
handler, which will write Index 0 and then set the indicator state to 1,
which is shared between the handler and thre readIndicator function, thus
breaking the while loop
*/
const notifyHandlerFactory = (manager, deviceID, serviceUUID) => {
    let indicator = 0;
    const notifyHandler = () => {
        writeIdx(manager, deviceID, serviceUUID, 0).then(()=> {indicator = 1;});
    };
    return { callback: notifyHandler, readIndicator: (() => indicator) };
};

/* 
create an instantly resolving promise which instantiates the 
notify service on the serviceUUID pointing at the deviceID
*/
const notifyInit = (manager, deviceID, serviceUUID) => {
    return new Promise ((resolve, reject) => {
        const charUUID = incrementUUID(serviceUUID, 3);
        const notifyHandler = notifyHandlerFactory(manager, deviceID, serviceUUID);
        const subscription = manager.monitorCharacteristicForDevice(deviceID, serviceUUID, charUUID, notifyHandler.callback);
        resolve({subscription: subscription, readIndicator: notifyHandler.readIndicator});
    });
};

/* 
writes the initial payload to the serviceUUID on the device at deviceID, which
indicates the number of segments that are going to come. Then waits
in a promiseWhile for a notify to show up through the readIndicator function,
sleeping for 500 ms in between successive checks
*/
const writeInit = (manager, deviceID, serviceUUID, numSegments, readIndicator) => {
    let payload = { type: 1, total: numSegments, index: 0, size: size, data:"" }; 
    return writePayload(manager, deviceID, serviceUUID, payload)
    .then(() => promiseWhile(
        () => (readIndicator) == 0),
        () => new Promise(resolve => setTimeout(resolve, 500))
    );
};

/* 
streamWrite and streamRead functions. These functions
send and receive data from a service at serviceUUID on the device
with deviceID. 
*/
const [streamWrite, streamRead] = (() => {
    let devqueues = [];
    return [
        (manager, deviceID, serviceUUID, data) => {
            const encodedData = btoa(data);
            const numSegments = Math.ceil(encodedData.length/size);
            let index = 0;
            let subscriptionRef = null;
            const match = devqueues.filter((item) => item.deviceID == deviceID); 
            if (match.length == 0) {
                devqueues.push({deviceID: deviceID, chain: (new Promise((resolve) => resolve()))});
            } 
            let selected = devqueues.filter((item) => item.deviceID == deviceID)[0].chain;
            
            selected = selected.then(() => notifyInit(manager, deviceID, serviceUUID)
                .then(({subscription, readIndicator}) => { 
                    subscriptionRef = subscription;
                    return writeInit(manager, deviceID, serviceUUID, numSegments, readIndicator);
                })
                .then(() => {
                    return promiseWhile(
                        () => {return (index != numSegments)},
                        () => new Promise((resolve, reject) => {
                            const start = index * size;    
                            const end = start + size;    
                            const dataSegment = encodedData.slice(start, end);
                            const payload = {
                                type: 0,
                                total: numSegments,
                                index: index,
                                size: dataSegment.length,
                                data: dataSegment,
                            };
                            writePayload(manager, deviceID, serviceUUID, payload)
                            .then(() => {
                                return readIdx(manager, deviceID, serviceUUID); 
                            })
                            .then((readValue) => {
                                if (readValue == null) {
                                    reject();
                                }
                                index = readValue;
                                resolve();
                            }); 
                            
                        })
                    );
                })
                .then(() => subscriptionRef.remove())
           )
           .catch((error) => {
               devqueues = devqueues.map((item) => item.deviceID == deviceID ? 
                                        { deviceID: deviceID, chain: new Promise((resolve) => resolve())} : item);
        
               throw error;
           }); 
 
            devqueues = devqueues.map((item) => item.deviceID == deviceID ? 
                                                    { deviceID: deviceID, chain: selected} : item);
            return selected;
        },
        (manager, deviceID, serviceUUID) => {
            const match = devqueues.filter((item) => item.deviceID == deviceID); 
            if (match.length == 0) {
                devqueues.push({deviceID: deviceID, chain: (new Promise((resolve) => resolve()))});
            } 
            let selected = devqueues.filter((item) => item.deviceID == deviceID)[0].chain;

            let data: string[] = new Array(1);
            let idx : number = 0;
            let total: number = -1;
            let resendFlag: boolean = false;

                 
            selected = selected.then(() => promiseWhile(
                        ()=>(idx != total), 
                        () => new Promise((resolve, reject) => {
                            writeIdx(manager, deviceID, serviceUUID, idx)
                            .then((characteristic) => {
                               return readPayload(manager, deviceID, serviceUUID);
                            })  
                            .then((resStr) => {
                                 if(resStr == null) {
                                    resendFlag = true;        
                                 } else {

                                 const payload = str2payload(resStr); 
                                  
                                 resendFlag = payload.index != idx;
                                 if (idx == 0) {
                                    total = payload.total;
                                    data = new Array(total);
                                 }
                                 if (payload.size != payload.data.length) {
                                    reject()
                                 }
                                 data[idx] = payload.data;
                                 idx++;
                                }
                                resolve();
                            })
                            .catch((error) => {
                                    reject(error);
                            });
                        }))
                        .then(() => {
                            const encodedData = data.join(''); 
                            const decodedData = atob(encodedData); 
                            return(decodedData);
                        })
                )
                .catch((error) => {
                    devqueues = devqueues.map((item) => item.deviceID == deviceID ? 
                                                    { deviceID: deviceID, chain: new Promise((resolve) => resolve())} : item);
                    throw error;
        
                }); 
                devqueues = devqueues.map((item) => item.deviceID == deviceID ? 
                                                    { deviceID: deviceID, chain: selected} : item);
                return selected;
                
            },

        ];

})();

export default BLEStream = {
    streamRead,
    streamWrite
};
