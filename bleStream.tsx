import {decode as atob, encode as btoa} from 'base-64'

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
    const hexRawPadded = hexRaw.padStart(8, '0'); 
    const hexSplit = hexRawPadded.match(/.{1,2}/g);
    const hexOrder = hexSplit.reverse(); 
    const hexBytes = hexOrder.map(x => parseInt(x, 16));
    const hexStr = String.fromCharCode(...hexBytes);
    return hexStr;
};

const writeIdx = (manager, device, serviceUUID, index) => {
    return new Promise((resolve, reject) => {        
       const charUUID = incrementUUID(serviceUUID, 2);
       manager.writeCharacteristicWithResponseForDevice(device.id, serviceUUID, charUUID, btoa(index))
       .then((characteristic) => resolve(characteristic)) 
       .catch((error) => reject(error)); 
    });
};

const readPayload = (manager, device, serviceUUID, index) => {
    return new Promise((resolve, reject) => {
        const charUUID = incrementUUID(serviceUUID, 1);
        manager.readCharacteristicForDevice(device.id, serviceUUID, charUUID) 
        .then((characteristic) => {
            const value = characteristic.value;
            if (value == null) {
                resolve(null);
            } else {
             resolve(atob(value)); 
            }
        })
        .catch((error) => reject(error));
    });    
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
                    writeIdx(manager, device, serviceUUID, int2nbo(idx))
                    .then((characteristic) => {
                       return readPayload(manager, device, serviceUUID);
                    })  
                    .then((value) => {
                         if(value == null) {
                            resendFlag = true;        
                         } else {
                         const jsonValue = JSON.parse(value);
                         resendFlag = jsonValue['index'] != idx;
                         if (idx == 0) {
                            total = jsonValue["total"];
                            data = new Array(total);
                         }
                         if (jsonValue['size'] != jsonValue['data'].length) {
                            reject()
                         }
                         data[idx] = jsonValue['data'];
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

const streamWrite = (manager, device, serviceUUID, data) => {
    return new Promise((resolve, reject) => {
        
        
    });    
};

export default BLEStream = {
    streamRead,
    streamWrite
};
