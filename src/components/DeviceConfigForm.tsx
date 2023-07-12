import DeviceSettingsList from "./DeviceSettingsList";
import FormDropdownMenu from "./FormDropdownMenu";
import PropTypes from "prop-types";
import { 
        name2settings,
        getSelectedDeviceNameFromList,
        setSelectedDeviceNameForList,
        setSelectedDeviceValueForList,
       } from "../controllers/presetController"
import React, { useState, useEffect } from 'react';

const device2Item = (device) => (
    { label: device.device_name, value: device.device_name }
);

const devices2Items = (devices) => { 
   const items = []; 
   for (const dev of devices) {
        items.push(device2Item(dev)); 
    }
   return items;
};

export default function DeviceConfigForm(props) {
    const devName = getSelectedDeviceNameFromList(props.deviceList);
    const selected = {label: devName, value: devName} 
    return (
        <>
            <FormDropdownMenu label={props.label} 
            display={props.display}
            items={devices2Items(props.deviceList.devices)} 
            selected={selected}
            onSelect={(e)=>{
                props.onSelectDevice(e.label);}}/>
            <DeviceSettingsList settings={name2settings(getSelectedDeviceNameFromList(props.deviceList), props.deviceList)} 
            display={props.display}
            onChange={(fieldName,value)=>{
                props.onFieldChange(fieldName, value)}}/>
        </>
    );
};

DeviceConfigForm.defaultProps = {
    display: true, 
    onSelectDevice: (deviceName) => {},
    onFieldChange: (fieldName, value) => {},
};

DeviceConfigForm.propTypes = {
    display: PropTypes.bool.isRequired,
    deviceList: PropTypes.shape({
        selected_device: PropTypes.string.isRequired,
        devices: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            dispaly_name: PropTypes.string.isRequired,
            items(props, ...rest) {
                if (props.type == "ListPicker") {
                    return PropTypes.arrayOf(Proptypes.string).isRequired(props, ...rest);
                }     
                return PropTypes.any(props, ...rest);
            },
            minValue(props, ...rest) {
                if (props.type == "Slider") {
                    return PropTypes.number.isRequired(props, ...rest);
                }     
                return PropTypes.any(props, ...rest);
            },
            maxValue(props, ...rest) {
                if (props.type == "Slider") {
                    return PropTypes.number.isRequired(props, ...rest);
                }     
                return PropTypes.any(props, ...rest);
            },
 
            value: PropTypes.number.isRequired,
 
        })).isRequired,

    }),
    onSelectDevice: PropTypes.func.isRequired,
    onFieldChange: PropTypes.func.isRequired,
};
 




