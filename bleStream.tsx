import {decode as atob, encode as btoa} from 'base-64'

const size = 400;

const uuid2int = (uuid) => {
    const segments = uuid.split('-');
    return segments.map((segment) => parseInt(segment, 16));
};

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

const incrementUUID = (uuid, value) => {
    let numbers = uuid2int(uuid);
    numbers[0] += value;
    return int2uuid(numbers);
};

const int2nbo = (i) => {
    const hexRaw = i.toString(16);
    const hexPadded = hexRaw.padStart(8, '0');
    const hexSplit = hexPadded.match(/.{1,2}/g);
    const hexOrder = hexSplit.reverse(); 
    const hexBytes = hexOrder.map(x => parseInt(x, 16));
    const hexStr = String.fromCharCode(...hexBytes);
    return hexStr;
};

const nbo2int = (byteStr) => {
    const byteArr = byteStr.split('');
    const hexArr = byteArr.map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).reverse();
    const hexStr = hexArr.join('');
    const num = parseInt(hexStr, 16);
    return num;
};

const str2nbo = (str) => {
    const charArr = str.split('');
    const hexArr = charArr.map(c => c.charCodeAt(0).toString(16));
    const hexOrder = hexArr.reverse();
    const hexBytes = hexOrder.map(x => parseInt(x, 16));
    const hexStr = String.fromCharCode(...hexBytes);
    return hexStr;
};

const json2payload = (json) => ({
        type: json["type"],
        total: json["total"],
        index: json["index"],
        size: json["size"],
        data: json["data"],
});        

const str2payload = (str) => {
    return json2payload(JSON.parse(str));
};

const writeIdx = (manager, deviceID, serviceUUID, index) => {
    const data = btoa(int2nbo(index));
    const charUUID = incrementUUID(serviceUUID, 2);
    return manager.writeCharacteristicWithResponseForDevice(deviceID, serviceUUID, charUUID, data);
};

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

const writePayload = (manager, deviceID, serviceUUID, payload) => { 
    const data = btoa(JSON.stringify(payload));
    const charUUID = incrementUUID(serviceUUID, 1);
    return manager.writeCharacteristicWithResponseForDevice(deviceID, serviceUUID, charUUID, data);
};

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

const promiseWhile = (condition, action) => {
    const nextIter = () => {
        if (!condition()) return; 
        return action().then(() => nextIter());
    }; 
    return nextIter();
};


const notifyHandlerFactory = (manager, deviceID, serviceUUID) => {
    let indicator = 0;
    const notifyHandler = () => {
        writeIdx(manager, deviceID, serviceUUID, 0).then(()=> {indicator = 1;});
    };
    return { callback: notifyHandler, readIndicator: (() => indicator) };
};

const notifyInit = (manager, deviceID, serviceUUID) => {
    return new Promise ((resolve, reject) => {
        const charUUID = incrementUUID(serviceUUID, 3);
        const notifyHandler = notifyHandlerFactory(manager, deviceID, serviceUUID);
        const subscription = manager.monitorCharacteristicForDevice(deviceID, serviceUUID, charUUID, notifyHandler.callback);
        resolve({subscription: subscription, readIndicator: notifyHandler.readIndicator});
    });
};

const writeInit = (manager, deviceID, serviceUUID, numSegments, readIndicator) => {
    let payload = { type: 1, total: numSegments, index: 0, size: size, data:"" }; 
    return writePayload(manager, deviceID, serviceUUID, payload)
    .then(() => promiseWhile(
        () => (readIndicator) == 0),
        () => new Promise(resolve => setTimeout(resolve, 500))
    );
};

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
