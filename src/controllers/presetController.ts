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

    const json = {
        "inputdevices": {
            "selected_devices": ["Nexus Test Device"],
            "devices":[
                {
                    "device_name":"Test Device",
                    "device_settings":[
                        {
                            "type":"discrete",
                            "name":"_selected_max_value_index",
                            "display_name":"Maximum Value",
                            "items":[1,2,3,4,5,6,7,8,9,10],
                            "value":3,
                            "dependencies":[]
                        }
                    ]
                },
                {
                    "device_name":"Nexus Test Device",
                    "device_settings":[
                        {
                            "type":"discrete",
                            "name":"selected_decoder_index",
                            "display_name":"Decoder",
                            "items":["Move Rest Decoder","Left Right Decoder","Sensory Decoder","Arm Decoder"],
                            "value":0,
                            "dependencies":[
                                {
                                    "type": "discrete",
                                    "name":"selected_training_state_index",
                                    "display_name":"Training State",
                                    "items_directory":[
                                        {
                                            "parent_value": 3,
                                            "items": ["Ordered","Random"],
                                            "value": 0,
                                            "dependencies":[],
                                        }
                                    ],
                                },
                            ]
                        },
                        {
                            "type":"continuous",
                            "name":"threshold",
                            "display_name":"Threshold",
                            "lowerBound":"0",
                            "upperBound":"1",
                            "value":0.6896782478794892,
                            "dependencies":[],
                        },
                    ]
                },
            ],        
        },
        "outputdevices":{
            "selected_devices":["Test Output Device1", "Test Output Device2"],
            "devices":[
                {
                    "device_name":"Test Output Device1",
                    "device_settings":[]
                },
                {
                    "device_name":"Test Output Device2",
                    "device_settings":[]
                }
            ]
        }
    };

    return new Promise((resolve, reject) => resolve(json));
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

export const cancelDeviceOperation = (deviceID) => {
    return manager.cancelDeviceConnection(deviceID);
}

/*
 *
 * Device Settings Object Methods
 *
 */
export const name2settings = (deviceName, deviceList) => {
    const filteredSettings = deviceList.devices.filter((item) => (item.device_name == deviceName));    
    return filteredSettings[0].device_settings; 
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
            selected_devices: [""],
            devices: [{device_name: "", device_settings:[]}]
        },
        outputdevices: {
            selected_devices: [""],
            devices: [{device_name: "", device_settings:[]}]
        },
    };
  
};
export const getEmptyPreset = () => ({
        name: "",
        deviceID: "",
        settings: getEmptySettings(),
   
});

export const getInputDeviceList = (obj) => {
    return obj.inputdevices;
};

export const getOutputDeviceList = (obj) => {
    return obj.outputdevices;
};

export const getSelectedDeviceNamesInDeviceList = (devList) => {
    return devList.selected_devices;
};

export const getUnselectedDeviceNamesInDeviceList = (devList) => {
    const lst = devList.devices.reduce((acc, curr) => {
        const search = devList.selected_devices.find(dname => {
            return dname == curr.device_name;
        });
        if (search == undefined) {
            acc.push(curr.device_name);
        }
        return acc;
    }, []);
    return lst;
};

export const switchSelectedDeviceNameInDeviceList = (devList, formerDev, newDev) => {
    const modifiedSelected = devList.selected_devices.map((name) => 
        (name == formerDev ? newDev : name)
    );
    return {...devList, selected_devices: modifiedSelected};
};

export const setFieldValueForDeviceNameInDeviceList = (devList, devName, fieldName, value) => {
    const devices = devList.devices;
    const modifiedDevices = devices.map((device) => {
        if (device.device_name != devName) {
            return device;
        }    
        return setFieldValueForDevice(device, fieldName, value);
    });
    return {...devList, devices: modifiedDevices};

};

const setFieldValueForDevice = (device, fieldName, value) => {
    const modifiedSettings = device.device_settings.map(
        (setting) => setFieldValueForSetting(setting, fieldName, value));
    return {...device, device_settings: modifiedSettings};
};

const setFieldValueForSetting = (setting, fieldName, value) => {
    if (setting.name == fieldName) {
        return {...setting, value: value};
    }
    const modifiedDep = setting.dependencies.map(
        (dep) => 
            setFieldValueForDependency(dep, setting.value, fieldName, value)    
        );
    return {...setting, dependencies: modifiedDep};

};

const setFieldValueForDependency = (dep, parentValue, fieldName, value) => {
       const n_items_directory = dep.items_directory.map(
           (item) => {
               if (item.parent_value != parentValue) {
                   return item;
               }                    
               if (dep.name == fieldName) {
                   return {...item, value: value};
               }
               const modifiedDependencies = item.dependencies.map((dep) =>
                setFieldValueForDependency(dep, item.value, fieldName, value));
                return {...item, dependencies: modifiedDependencies};
           });
       return {...dep, items_directory: n_items_directory};
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
    cancelDeviceOperation,
    name2settings,
    getInputDeviceList,
    getOutputDeviceList,
    setCalibrationTrue,
    verifySettingsObj,
    getEmptySettings,
    getSelectedDeviceNamesInDeviceList,
    getUnselectedDeviceNamesInDeviceList,
    setFieldValueForDeviceNameInDeviceList,    
    switchSelectedDeviceNameInDeviceList,
    getEmptyPreset,
    addPreset,
    deletePreset,
};




