import * as ActionCreators from '../actionCreators'; 
import { manager } from '../bleManager';
import BLEStream from '../bleStream';
import { useEffect, useState } from 'react';

/*
 *
 * BLE Interface Methods 
 *
 */

/*
 * Name: scanAndAcc
 * Handles the accumulation of device scans. This function should be used within
 * a react-native effect, so that when isScan is set to false, the manager can
 * stop scanning, and when arr changes, the scan Callback can be updated.
 * @param {arr} arr - getter for array to hold devices.
 * @param {setArr} setArr - setter for array to hold devices.
 * @param {isScan} isScan - indicates if scanning should continue.
 */
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

/*
 * Name: useBLEScanAndAccEffect
 * useBLEScanAndAccEffect is a react-native effect which manages access to the bluetooth
 * device scanner. The effect will synchronize scanning with the bluetooth manager
 * state, isServerScan, and deposits the scanned devices in devices
 * @param {isServerScan} isServerScan - A boolean which determines when to start or stop scanning.
 * @param {devices} devices - The state array where devices are accumulated.
 * @param {setDevices} setDevices - A setter for the devices state array.
 */
export const useBLEScanAndAccEffect = (isServerScan, devices, setDevices) => {
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

/*
 * Name: readDeviceSettings
 * Returns a promise with the device settings from the device with
 * deviceID
 * @param {deviceID} deviceID - the uuid of the device hosting the server 
 * @returns {Promise<obj>} - json settings object within a promise
 */
export const readDeviceSettings = (deviceID) => {
    const settingsUUID = '51ff12bb-3ed8-46e5-b4f9-d64e2fec021b';
    return manager.connectToDevice(deviceID) 
        .then((device) => {
            return device.discoverAllServicesAndCharacteristics();
        })
        .then((services) => {
            return BLEStream.streamRead(manager, deviceID, settingsUUID);

        })
        .then((resStr) => {
              let obj : any;
              try {
                return JSON.parse(resStr);
              }
              catch {
                console.log("Not a valid JSON: " + resStr);
                throw new Error(resStr);  
              }
        })

 };

/*
 * Name: WriteDeviceSettings
 * returns a promise that resolves once given settings object gets written
 * @param {deviceID} deviceID - the uuid of the device hosting the server 
 * @param {obj} - json settings object to send
 * @returns {Promise<null>} - promise that resolves once write succeeds.
 */
export const writeDeviceSettings = (deviceID, obj) => {
    const settingsUUID = '51ff12bb-3ed8-46e5-b4f9-d64e2fec021b';
    return manager.connectToDevice(deviceID) 
        .then((device) => {
            return device.discoverAllServicesAndCharacteristics();
        })
        .then((services) => {
            try {
                return JSON.stringify(obj);            
            }
            catch {
                console.log("Could not stringify: "  + obj);
                throw new Error(obj);
            }            
        })
        .then((dataStr) => BLEStream.streamWrite(manager, deviceID, settingsUUID, dataStr));
};


/*
 *
 * Device Settings Object Methods
 *
 */
export const name2settings = (deviceName, deviceList) => {
    const filteredSettings = deviceList.devices.filter((item) => (item.device_name == deviceName));    
    return filteredSettings[0].device_settings; 
};

export const getSelectedDeviceNameFromList = (list) => {
    return list.selected_device;    
};

export const setSelectedDeviceNameForList = (list, deviceName) => {
    return { ...list, selected_device: deviceName };    
};

export const setSelectedDeviceValueForList = (list, fieldName, value) => {
    return { ...list, devices: list.devices.map((dev) => {
        if (dev.device_name == list.selected_device) {
            return { 
                    ...dev, 
                    device_settings: dev.device_settings.map((setting) => {
                        if (setting.name == fieldName) {
                            return {...setting, value: value};    
                        }
                        return setting;
                    }) 
            };
        }    
        return dev;
        }),
    };
};

export const getSelectedInputSettings = (obj) => {
    return name2settings(getSelectedInputName(obj), obj.inputdevices);
};

export const getSelectedOutputSettings = (obj) => {
    return name2settings(getSelectedOutputName(obj), obj.outputdevices);
};

export const getSelectedInputName = (obj) => {
    return obj.inputdevices.selected_device; 
};

export const getSelectedOutputName = (obj) => {
    return obj.outputdevices.selected_device; 
};

export const setSelectedInputName = (obj, deviceName) => {
    return {...obj, inputdevices: { ...obj.inputdevices, selected_device: deviceName } }; 
};

export const setSelectedOutputName = (obj, deviceName) => {
    return {...obj, outputdevices: { ...obj.outputdevices, selected_device: deviceName } }; 
};

export const setSelectedInputValue = (obj, fieldName, value) => {
    const selectName = obj.inputdevices.selected_device;
    const selectDev = obj.inputdevices.devices.filter((item) => item.device_name == selectName)[0];
    const selectSetting = selectDev.device_settings.filter((item) => item.name == fieldName)[0];
    const modifiedSetting = {...selectSetting, value: value};
    const modifiedSettingList = selectDev.device_settings.map((item) => item.name == fieldName ? modifiedSetting : item); 
    const modifiedDev = {...selectDev, device_settings: modifiedSettingList};
    const modifiedDevList = obj.inputdevices.devices.map((item) => item.device_name == selectName ? modifiedDev : item); 
    return {...obj, inputdevices: { ...obj.inputdevices, devices: modifiedDevList} }; 
};

export const setSelectedOutputValue = (obj, fieldName, value) => {
    const selectName = obj.outputdevices.selected_device;
    const selectDev = obj.outputdevices.devices.filter((item) => item.device_name == selectName)[0];
    const selectSetting = selectDev.device_settings.filter((item) => item.name == fieldName)[0];
    const modifiedSetting = {...selectSetting, value: value};
    const modifiedSettingList = selectDev.device_settings.map((item) => item.name == fieldName ? modifiedSetting : item); 
    const modifiedDev = {...selectDev, device_settings: modifiedSettingList};
    const modifiedDevList = obj.outputdevices.devices.map((item) => item.device_name == selectName ? modifiedDev : item); 
    return {...obj, outputdevices: { ...obj.outputdevices, devices: modifiedDevList} }; 
};


export const setCalibrationTrue = (obj) => {
    return setSelectedInputValue(obj, "calibrating", true);    
};

export const verifySettingsObj = (obj) => {
    return obj.hasOwnProperty("inputdevices") && obj.hasOwnProperty("outputdevices");
};

export const getEmptySettings = () => {
    return {
        inputdevices: {
            selected_device: "",
            devices: [{device_name: "", device_settings:[]}]
        },
        outputdevices: {
            selected_device: "",
            devices: [{device_name: "", device_settings:[]}]
        },
    };
  
};

export const getInputDeviceList = (obj) => {
    return obj.inputdevices;
};

export const getOutputDeviceList = (obj) => {
    return obj.outputdevices;
};


/*
 *
 * Persistent Storage Methods
 *
 */

export const addPreset = (preset) => {
    return ActionCreators.addPreset(preset);        
};

export const deletePreset = (preset) => {
    return ActionCreators.deletePreset(preset.id);        
};


export default Controller = {
    useBLEScanAndAccEffect,
    readDeviceSettings,
    writeDeviceSettings,
    name2settings,
    getSelectedInputName,
    getSelectedOutputName,
    getInputDeviceList,
    getOutputDeviceList,
    setSelectedInputName,
    setSelectedOutputName,
    getSelectedInputSettings,
    getSelectedOutputSettings,
    getSelectedDeviceNameFromList,
    setSelectedDeviceNameForList,
    setSelectedDeviceValueForList,
    setSelectedInputValue,       
    setSelectedOutputValue,       
    setCalibrationTrue,
    verifySettingsObj,
    getEmptySettings,
    addPreset,
    deletePreset,
};




