import DeviceSettingsList from "./DeviceSettingsList";
import FormDropdownMenu from "./FormDropdownMenu";
import PropTypes from "prop-types";
import { 
        name2settings,
        getUnselectedDeviceNamesInDeviceList,
        getSelectedDeviceNamesInDeviceList,
       } from "../controllers/presetController"
import React, { useState, useEffect } from 'react';

const device2Item = (dname) => (
    { label: dname, value: dname }
);

const devices2Items = (deviceNames) => { 
   const items = []; 
   for (const dname of deviceNames) {
        items.push(device2Item(dname)); 
    }
   return items;
};

export default function DeviceConfigForm(props) {
    const devName = props.deviceName;
    const selected = {label: devName, value: devName} 
    return (
        <>
            <FormDropdownMenu label={props.label} 
            display={props.display}
            items={devices2Items(getUnselectedDeviceNamesInDeviceList(props.deviceList))} 
            selected={selected}
            onSelect={(e)=>{
                props.onSelectDevice(devName, e.label);}}/>
            <DeviceSettingsList settings={name2settings(devName, props.deviceList)} 
            display={props.display}
            onChange={(fieldName,value)=>{
                props.onFieldChange(devName, fieldName, value)}}/>
        </>
    );
};

DeviceConfigForm.defaultProps = {
    display: true, 
    onSelectDevice: (formerDeviceName, newDeviceName) => {},
    onFieldChange: (deviceName, fieldName, value) => {},
};

DeviceConfigForm.propTypes = {
    display: PropTypes.bool.isRequired,
    deviceList: PropTypes.any.isRequired,
    onSelectDevice: PropTypes.func.isRequired,
    onFieldChange: PropTypes.func.isRequired,
};
 




