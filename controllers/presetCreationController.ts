import { manager } from '../bleManager';
import BLEStream from '../bleStream';
import { useEffect, useState } from 'react';

const scanAndAcc = (arr, setArr, isScan) => {
    if(!isScan) {
        manager.stopDeviceScan();
        return; 
    }
    manager.startDeviceScan(null, null, (error, device) =>
    {
        if (error) {
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id == device.id) {
                return;
            }
        }
        setArr([...arr, device]);
    });
};

const deviceToItems = (devices) => {
    const named = [];
    const nnamed = [];
    for(let i = 0; i < devices.length; i++) {
        if (devices[i].name) {
            named.push({label: devices[i].name, sublabel: devices[i].id , value: devices[i], key: devices[i].id}); 
        } else {
            nnamed.push({label: "Unknown", sublabel: devices[i].id , value: devices[i], key: devices[i].id}); 
        }
    } 
    const items = named.concat(nnamed);
    return items;
};

export const useBLEScanAndAcc = (isServerScan, devices, setDevices) => {
    useEffect(() => {
      const subscription = manager.onStateChange((state) => {
          if (state === 'PoweredOn') {
              subscription.remove();
              scanAndAcc(devices, setDevices, isServerScan);
          }
      }, true);
      return () => { subscription.remove(); manager.stopDeviceScan();}
    }, [manager, isServerScan, devices]);
};

export default Controller = {
    useBLEScanAndAcc,
};




