import React, { useState, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { useBLEScanAndAccEffect } from '../controllers/presetController';
import FormDropdownMenu from "./FormDropdownMenu";
import PropTypes from "prop-types";

const server2Item = (device) => ({
    label: (device.name ? device.name : "Unknown"), 
    sublabel: device.id, 
    value: device, 
    key: device.id
});


const servers2Items = (devices) => {
    const named = [];
    const nnamed = [];
    for(let i = 0; i < devices.length; i++) {
        let nItem = server2Item(devices[i]);
        nItem.label == "Unknown" ? nnamed.push(nItem) : named.push(nItem);
    } 
    const items = named.concat(nnamed);
    return items;
};

export default function BLEDeviceDropdownMenu(props) {
    const [devices, setDevices] = useState([]);
    const [isServerScan, setServerScan] = useState(false);
    const [isRefresh, setRefresh] = useState(false);

    useBLEScanAndAccEffect(isServerScan, devices, setDevices);
    
    const onRefresh = useCallback(() => {
        setRefresh(true);
        setServerScan(false);
        setDevices([]);          
        setServerScan(true);
        setRefresh(false);
    }, []);


    return (
     <FormDropdownMenu label={props.label} 
     disply={props.display}
     selected={server2Item(props.selectedDevice)}
     onSelect={(item) => props.onSelect(item)}
     refreshControl={<RefreshControl refreshing={isRefresh} onRefresh={onRefresh}/>}
     onDrop={()=>{setDevices([]); setServerScan(true);}} onClose={()=>setServerScan(false)}
     lock={props.lock}
     items={servers2Items(devices)}/>
 
    );
 
};

BLEDeviceDropdownMenu.propTypes = {
    label: PropTypes.string.isRequired,
    selectedDevice: PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
    }),
    onSelect: PropTypes.func.isRequired,
    display: PropTypes.bool.isRequired,
    lock: PropTypes.bool.isRequired,
};

BLEDeviceDropdownMenu.defaultProps = {
    display: true,
    selectedDevice: {name: "Select Device", id: ""},
    label: "Peripheral Devices", 
    onSelect: (device) => {},
    lock: false,
};



