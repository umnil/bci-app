import { manager } from '../bleManager';
import BLEStream from '../bleStream';
import { useEffect, useState } from 'react';
import { 
        setCalibrationTrue,
        writeDeviceSettings, 
        } from '../controllers/presetController';
import {decode as atob, encode as btoa} from 'base-64'

/*
 *
 * BLE Interface Methods
 *
 */

/*
 * Name: usePromptListenerEffect
 * usePromptListenerEffect is a react-native effect which registers
 * a component to listen to the prompt characteristic
 * @param {serverID} serverID - ID for the device running the server
 * @param {promptHandler} promptHandler - callback receiving the monitored prompt 
 */
export const usePromptListenerEffect = (serverID, promptHandler) => {
    const targetServUUID = "a07498ca-ad5b-474e-940d-16f1fbe7e8cd";
    const promptCharUUID = "E58AC8E3-615A-45C4-A96B-590F64D3492A";
     useEffect(() => {
      const subscription = manager
       .monitorCharacteristicForDevice(serverID, targetServUUID, promptCharUUID, (e,v) => 
           promptHandler(atob(v.value)));
      return () => subscription.remove() 
    }, []);

};

/*
 * Name: toggleTestingEffect 
 * toggleTestingEffect is an effect which starts and stops testing 
 * @param {serverID} serverID - ID for the device running the server
 * @param {promptHandler} promptHandler - callback receiving the monitored prompt 
 */
export const toggleTestingEffect = (serverID, settings, promptHandler) =>
{
    const targetServUUID = "a07498ca-ad5b-474e-940d-16f1fbe7e8cd";
    const promptCharUUID = "E58AC8E3-615A-45C4-A96B-590F64D3492A";
     useEffect(() => {
      const subscriptionPromise = writeDeviceSettings(serverID, setCalibrationTrue(settings))
        .then(() => manager
        .monitorCharacteristicForDevice(serverID, targetServUUID, promptCharUUID, (e,v) => 
           promptHandler(atob(v.value))));
      return () => subscriptionPromise
                    .then((subscription) => subscription.remove()) 
                    .then(() => writeDeviceSettings(serverID, settings)); 
    }, []);
}


export default Controller = {
    toggleTestingEffect,
}

