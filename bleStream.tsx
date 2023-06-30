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
    console.log(byteStr.length);
    const byteArr = byteStr.split('');
    const hexArr = byteArr.map(c => c.charCodeAt(0).toString(16)).reverse();
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

const writeIdx = (manager, device, serviceUUID, index) => {
    const data = btoa(int2nbo(index));
    const charUUID = incrementUUID(serviceUUID, 2);
    return manager.writeCharacteristicWithResponseForDevice(device.id, serviceUUID, charUUID, data);
};

const readIdx = (manager, device, serviceUUID) => {
    const charUUID = incrementUUID(serviceUUID, 2);
    return manager.readCharacteristicForDevice(device.id, serviceUUID, charUUID)
    .then((characteristic) => {
        const value = characteristic.value;
        if (value == null) {
            return(null);
        } else {
            console.log(value);
            return(parseInt(nbo2int(atob(value)), 10));
        }

        
    });
};

const writePayload = (manager, device, serviceUUID, payload) => { 
    const data = btoa(JSON.stringify(payload));
    const charUUID = incrementUUID(serviceUUID, 1);
    return manager.writeCharacteristicWithResponseForDevice(device.id, serviceUUID, charUUID, data);
};

const readPayload = (manager, device, serviceUUID, index) => {
    const charUUID = incrementUUID(serviceUUID, 1);
    return manager.readCharacteristicForDevice(device.id, serviceUUID, charUUID) 
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

const streamRead = (manager, device, serviceUUID) => {
    let data: string[] = new Array(1);
    let idx : number = 0;
    let total: number = -1;
    let resendFlag: boolean = false;
    return new Promise((resolve, reject) => {    
        promiseWhile(
                ()=>(idx != total), 
                () => new Promise((resolve, reject) => {
                    writeIdx(manager, device, serviceUUID, idx)
                    .then((characteristic) => {
                       return readPayload(manager, device, serviceUUID);
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
                    resolve(decodedData);
                })
                .catch((error) => {
                    reject(error);
                });
            });
};

const notifyHandlerFactory = (manager, device, serviceUUID) => {
    let indicator = 0;
    const notifyHandler = () => {
        writeIdx(manager, device, serviceUUID, 0).then(()=> {indicator = 1;});
    };
    return { callback: notifyHandler, readIndicator: (() => indicator) };
};

const notifyInit = (manager, device, serviceUUID) => {
    return new Promise ((resolve, reject) => {
        const charUUID = incrementUUID(serviceUUID, 3);
        const notifyHandler = notifyHandlerFactory(manager, device, serviceUUID);
        const subscription = manager.monitorCharacteristicForDevice(device.id, serviceUUID, charUUID, notifyHandler.callback);
        resolve({subscription: subscription, readIndicator: notifyHandler.readIndicator});
    });
};

const writeInit = (manager, device, serviceUUID, numSegments, readIndicator) => {
    let payload = { type: 1, total: numSegments, index: 0, size: size, data:"" }; 
    return writePayload(manager, device, serviceUUID, payload)
    .then(() => promiseWhile(
        () => (readIndicator) == 0),
        () => new Promise(resolve => setTimeout(resolve, 500))
    );
};

const streamWrite = (manager, device, serviceUUID, data) => {
    const encodedData = btoa(data);
    const numSegments = Math.ceil(encodedData.length/size);
    let index = 0;
    let subscriptionRef = null;
    return notifyInit(manager, device, serviceUUID)
        .then(({subscription, readIndicator}) => { 
            subscriptionRef = subscription;
            return writeInit(manager, device, serviceUUID, numSegments, readIndicator);
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
                    writePayload(manager, device, serviceUUID, payload)
                    .then(() => {
                        return readIdx(manager, device, serviceUUID); 
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
        .catch((error) => console.log("error: " + error));
            
};

export default BLEStream = {
    streamRead,
    streamWrite
};
