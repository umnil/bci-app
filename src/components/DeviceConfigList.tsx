import { View, Text } from "react-native"; 
import DeviceConfigForm from "../components/DeviceConfigForm"
import FormButton from "../components/FormButton";
import PropTypes from "prop-types";
import { 
        name2settings,
        getUnselectedDeviceNamesInDeviceList,
        getSelectedDeviceNamesInDeviceList,
switchSelectedDeviceNameInDeviceList
       } from "../controllers/presetController"
import React, { useState, useEffect } from 'react';

const HorizontalRule = (props) =>
(<>
{props.display ? (<View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginVertical: 15}}>
  <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
    <Text> {props.label} </Text>
  <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
</View>) : null}</>);


export default function DeviceConfigList(props) {
    const unselectedInDevs = getUnselectedDeviceNamesInDeviceList(props.inputdevices);
    const unselectedOutDevs = getUnselectedDeviceNamesInDeviceList(props.outputdevices);
    const selectedInDevs = getSelectedDeviceNamesInDeviceList(props.inputdevices); 
    const selectedOutDevs = getSelectedDeviceNamesInDeviceList(props.outputdevices);
 
    return (
        <>
            <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                <FormButton 
                    label="Add Device Pair" 
                    onPress={props.onAddPress} 
                    display={props.display && 
                             (unselectedInDevs.length != 0 && unselectedOutDevs.length != 0)}
                />  
            </View>
            {
                selectedInDevs.map((devName, index) =>     
                    (<> 
                        <HorizontalRule display={props.display} label={"Device Pair #" + (index + 1)}/> 
                        <DeviceConfigForm
                            label={"Select Input Device"}
                            display={props.display}   
                            onSelectDevice={props.onSelectInputDevice}
                            onFieldChange={props.onInputFieldChange}
                            selectedDeviceName={devName}
                            deviceNameList={unselectedInDevs}
                            deviceList={props.inputdevices}
                            />
                        <DeviceConfigForm
                            label={"Select Output Device"}
                            display={props.display}   
                            onSelectDevice={props.onSelectOutputDevice}
                            onFieldChange={props.onOutputFieldChange}
                            selectedDeviceName={selectedOutDevs[index]}
                            deviceNameList={unselectedOutDevs}
                            deviceList={props.outputdevices}
                            />
                        <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
                            <FormButton 
                                label="Remove Device Pair" 
                                onPress={() => props.onRemovePress(devName, selectedOutDevs[index]) } 
                                display={props.display}
                            />  
                             <FormButton 
                                label="Check Accuracy" 
                                onPress={props.onTestPress} 
                                display={props.display}
                            />  
                        </View>
                        
                    </>)
                )
            }

        </>
    );
}

