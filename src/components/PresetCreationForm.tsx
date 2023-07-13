import { 
        RefreshControl, 
        Alert, 
        ScrollView,
        Button,
        View,
        ActivityIndicator } from 'react-native';
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
         setSelectedInputName,
         setSelectedInputValue,
         setSelectedOutputName,
         setSelectedOutputValue,
        } from '../controllers/presetController';
import PropTypes from "prop-types";

const defaultDev = {name: "Select Device", id:"Tap Here"};

const serverSelect = (item, setServer, setSettings, setIsSelect, setSelectedDev, setConnecting) => {
    setIsSelect(false);
    setConnecting(true); 
    const device = item.value;
    readDeviceSettings(device.id)
    .then((obj) => {
        setSettings(obj); 
        setServer(device.id);
        setSelectedDev(device);
        setIsSelect(true); 
        setConnecting(false); 
    })
    .catch((error) => {
         setSelectedDev(defaultDev);
         setIsSelect(false);
         setConnecting(false); 
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
    const [isRefresh , setRefresh] = useState(false);
    const [shouldDisplay, setShouldDisplay] = useState(true);
    const [selectedDev, setSelectedDev] = useState(defaultDev);
    const [isConnecting, setConnecting] = useState(false);
    const display = isForm && props.preset.deviceID != "" && shouldDisplay;
    const connecting = isConnecting && !shouldDisplay;
    
    const onRefresh = useCallback(() => {
        setRefresh(true);
        if (props.preset.deviceID != "") {
            setShouldDisplay(false); 
            writeDeviceSettings(props.preset.deviceID, props.preset.settings)
            .then(() => readDeviceSettings(props.preset.deviceID))
            .then((obj) => {
                    props.onSettingsChange(obj); 
                    setShouldDisplay(true); 
                    setRefresh(false)
             })
             .catch((error) => {
                setRefresh(false)
                Alert.alert('An Error Occurred', 
                    '', [
                    {
                        text: 'Ok',
                        onPress: () => {},
                    },   
                ]);
            });
        } else {
            setRefresh(false);
        }
    }, [props.preset.deviceID, props.preset.settings]);


    return (
        <ScrollView nestedScrollEnabled = {true}
          refreshControl={
                <RefreshControl refreshing={isRefresh} onRefresh={onRefresh}/>}
        >
            <View style={
                  {
                    flex: 1, 
                    flexDirection:'row', 
                    justifyContent:'center', 
                    alignItems:'center'
                  }
            }>
                  <TwoPanelButton titleLeft="Form" titleRight="Drag"  
                    onPressLeft={() => setForm(true)} 
                    onPressRight={() => setForm(false)}
                    disabledRight={true}/>  
                  <Button onPress={props.onTestPress} title="Test" />
            </View>    
               <FormTextInput onChangeText={(e)=>props.onNameChange(e)} label="Preset Name" />
               <BLEDeviceDropdownMenu label="Server" 
                selectedDevice={selectedDev} 
                onSelect={(dev) => serverSelect(dev, props.onDeviceIDChange,
                 props.onSettingsChange, setShouldDisplay, setSelectedDev, setConnecting) 
                 }
                />
               <DeviceConfigForm label="Input Device"
                display={display}
                deviceList={getInputDeviceList(props.preset.settings)}
                onSelectDevice={(dname) => props.onSettingsChange(setSelectedInputName(props.preset.settings, dname))}
                onFieldChange={(fieldName, value) => props.onSettingsChange(setSelectedInputValue(props.preset.settings,fieldName,value))}
               />
               <DeviceConfigForm label="Output Device"
                display={display}
                deviceList={getOutputDeviceList(props.preset.settings)}
                onSelectDevice={(dname) => props.onSettingsChange(setSelectedOutputName(props.preset.settings, dname))}
                onFieldChange={(fieldName, value) => props.onSettingsChange(setSelectedOutputValue(props.preset.settings,fieldName,value))}
               />

               <ActivityIndicator size="large" animating={isConnecting}/>
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
        name: PropTypes.string.isRequired,
        deviceID: PropTypes.string.isRequired,
    }).isRequired,
    onSettingsChange: PropTypes.func.isRequired,
    onDeviceIDChange: PropTypes.func.isRequired,
    onNameChange: PropTypes.func.isRequired,
    onTestPress: PropTypes.func.isRequired,
};

export default PresetCreationForm;


