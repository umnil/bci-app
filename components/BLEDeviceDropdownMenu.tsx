import React, { useState } from 'react';
import { useBLEScanAndAccEffect } from '../controllers/presetController';
import FormDropdownMenu from "./FormDropdownMenu";
import PropTypes from "prop-types";

const serversToItems = (devices) => {
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

export default function BLEDeviceDropdownMenu(props) {
    const [devices, setDevices] = useState([]);
    const [isServerScan, setServerScan] = useState(false);

    useBLEScanAndAccEffect(isServerScan, devices, setDevices);

    return (
     <FormDropdownMenu label={props.label} 
     disply={props.display}
     onSelect={(item) => props.onSelect(item)}
     onDrop={()=>{setDevices([]); setServerScan(true);}} onClose={()=>setServerScan(false)}
     items={serversToItems(devices)}/>
 
    );
 
};

BLEDeviceDropdownMenu.propTypes = {
    label: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    display: PropTypes.bool.isRequired,
};

BLEDeviceDropdownMenu.defaultProps = {
    display: true,
    label: "Peripheral Devices", 
    onSelect: (device) => {},
};



