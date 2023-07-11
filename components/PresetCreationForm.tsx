import { RefreshControl, Alert, Button, ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import DeviceConfigForm from "../components/DeviceConfigForm";
import BLEDeviceDropdownMenu from "../components/BLEDeviceDropdownMenu";
import { useEffect, useState, useCallback } from 'react';
import { readDeviceSettings, 
         writeDeviceSettings, 
         getInputDeviceList,
         getOutputDeviceList,
         getSelectedInputName,
         setSelectedInputName,
         setSelectedInputValue,
         getSelectedInputSettings,
         getSelectedOutputName,
         setSelectedOutputName,
         setSelectedOutputValue,
         getSelectedOutputSettings,
         getEmptySettings,
        } from '../controllers/presetController';
import PropTypes from "prop-types";


const devices2Items = (devices) => { 
   const items = []; 
   for (const dev of devices) {
        items.push({ label: dev["device_name"], value: dev["device_name"] }); 
    }
   return items;
}

const serverSelect = (item, setServer, setSettings, setIsSelect) => {
    setIsSelect(false);
    const device = item.value;
    readDeviceSettings(device.id)
    .then((obj) => {
        setSettings(obj); 
        setServer(device.id);
        setIsSelect(true); 
    })
    .catch((error) => {
         setIsSelect(false);
         setServer("");
         setSettings(getEmptySettings());
         Alert.alert('Cannot connect to server', 
            'The selected server \'' + device.id + '\' cannot be connected to.\n Error: ' + error, [
            {
                text: 'Ok',
                onPress: () => {},
            },   
        ]);
    }); 
};

function PresetCreationForm(props) {
    const [isForm , setForm] = useState(true);
    const [isSelect , setSelect] = useState(false);
    const [isRefresh , setRefresh] = useState(false);
    
    const onRefresh = useCallback(() => {
        setRefresh(true);
        if (props.preset.deviceID != "") {
            setSelect(false); 
            writeDeviceSettings(props.preset.deviceID, props.preset.settings)
            .then(() => readDeviceSettings(props.preset.deviceID))
            .then((obj) => {
                    props.onSettingsChange(obj); 
                    setSelect(true); 
                    setRefresh(false)
             })
             .catch(() => setRefresh(false));
        } else {
            setRefresh(false);
        }
    }, [props.preset.deviceID, props.preset.settings]);


    return (
        <ScrollView nestedScrollEnabled = {true}
          refreshControl={
                    <RefreshControl refreshing={isRefresh} onRefresh={onRefresh}/>}
        >
              <TwoPanelButton titleLeft="Form" titleRight="Drag"  
                onPressLeft={() => setForm(true)} 
                onPressRight={() => setForm(false)}
                disabledRight={true}/>  
               <FormTextInput onChangeText={(e)=>props.onNameChange(e)} label="Preset Name" />
               <BLEDeviceDropdownMenu label="Server" 
                onSelect={(dev) => serverSelect(dev, props.onDeviceIDChange,
                 props.onSettingsChange, setSelect)}/>
               <DeviceConfigForm label="Input Device"
                display={isSelect && isForm}
                deviceList={getInputDeviceList(props.preset.settings)}
                onSelectDevice={(dname) => props.onSettingsChange(setSelectedInputName(props.preset.settings, dname))}
                onFieldChange={(fieldName, value) => props.onSettingsChange(setSelectedInputValue(props.preset.settings,fieldName,value))}
               />
               <DeviceConfigForm label="Output Device"
                display={isSelect && isForm}
                deviceList={getOutputDeviceList(props.preset.settings)}
                onSelectDevice={(dname) => props.onSettingsChange(setSelectedOutputName(props.preset.settings, dname))}
                onFieldChange={(fieldName, value) => props.onSettingsChange(setSelectedOutputValue(props.preset.settings,fieldName,value))}
               />
         </ScrollView>
    );
};

PresetCreationForm.propTypes = {
    preset: PropTypes.shape({
        settings: PropTypes.shape({
            inputdevices: PropTypes.shape({
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
 
                })).isRequired
            }).isRequired,
            outputdevices: PropTypes.shape({
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
 
                })).isRequired
            }).isRequired,
        }).isRequired,
    }).isRequired,
    name: PropTypes.string.isRequired,
    deviceID: PropTypes.string.isRequired,
    onSettingsChange: PropTypes.func.isRequired,
    onDeviceIDChange: PropTypes.func.isRequired,
    onNameChange: PropTypes.func.isRequired,
};

export default PresetCreationForm;


