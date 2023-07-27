import { 
        RefreshControl, 
        Alert, 
        ScrollView,
        Button,
        View,
        ActivityIndicator } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import FormButton from "../components/FormButton";
import DeviceConfigList from "../components/DeviceConfigList";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import DeviceConfigForm from "../components/DeviceConfigForm";
import BLEDeviceDropdownMenu from "../components/BLEDeviceDropdownMenu";
import { useEffect, useState, useCallback } from 'react';
import { readDeviceSettings, 
         writeDeviceSettings, 
         cancelDeviceOperation,
         getInputDeviceList,
         getOutputDeviceList,
         getEmptySettings,
         setFieldValueForDeviceNameInDeviceList,    
         switchSelectedDeviceNameInDeviceList,
         addSelectedDeviceNameInDeviceList,
         removeSelectedDeviceNameInDeviceList,
         getUnselectedDeviceNamesInDeviceList,
         getSelectedDeviceNamesInDeviceList,
 
        } from '../controllers/presetController';
import PropTypes from "prop-types";

const defaultDev = {name: "Select Device", id:"Tap Here"};

const serverSelect = (item, setServer, setSettings, setIsSelect, setSelectedDev, setConnecting) => {
    setIsSelect(false);
    setConnecting(true); 
    const device = item.value;
    setSelectedDev(device);
    readDeviceSettings(device.id)
    .then((obj) => {
        setSettings(obj); 
        setServer(device.id);
        setIsSelect(true); 
        setConnecting(false); 
    })
    .catch((error) => {
         setSelectedDev(defaultDev);
         setIsSelect(false);
         setConnecting(false); 
         setServer("");
         setSettings(getEmptySettings());
         if (error.hasOwnProperty("message") && error.message == "Operation was cancelled") {
            return;
         }
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
                <RefreshControl refreshing={!connecting && isRefresh} onRefresh={onRefresh}/>}
        >
            <View style={
                  {
                    flex: 1, 
                    flexDirection:'row', 
                    justifyContent:'flex-end', 
                    alignItems:'center'
                  }
            }>
                  <TwoPanelButton 
                    titleLeft="Form" 
                    titleRight="Drag"  
                    display={false}
                    onPressLeft={() => setForm(true)} 
                    onPressRight={() => setForm(false)}
                    disabledRight={true}/>  
                  <FormButton disabled={connecting} onPress={props.onTestPress} label="Check Accuracy" />
            </View>    
               <FormTextInput onChangeText={(e)=>props.onNameChange(e)} label="Preset Name" />
               <BLEDeviceDropdownMenu 
                lock={connecting || isRefresh}
                display={props.displayServerSelect}
                label="Server" 
                selectedDevice={selectedDev} 
                onSelect={(dev) => serverSelect(dev, props.onDeviceIDChange,
                 props.onSettingsChange, setShouldDisplay, setSelectedDev, setConnecting) 
                 }
                />
               <DeviceConfigList 
                    display={display}
                    inputdevices={getInputDeviceList(props.preset.settings)}
                    outputdevices={getOutputDeviceList(props.preset.settings)}
                    onSelectInputDevice={(fdname, ndname) => props.onSettingsChange({
                        ...props.preset.settings,
                        inputdevices: switchSelectedDeviceNameInDeviceList(props.preset.settings.inputdevices, fdname, ndname)
                    })}
                    onInputFieldChange={(dname, fieldName, value) => 
                        props.onSettingsChange({
                            ...props.preset.settings,
                            inputdevices: setFieldValueForDeviceNameInDeviceList(props.preset.settings.inputdevices, dname, fieldName, value)
                        })
                    }
                    onSelectOutputDevice={(fdname, ndname) => props.onSettingsChange({
                        ...props.preset.settings,
                        outputdevices: switchSelectedDeviceNameInDeviceList(props.preset.settings.outputdevices, fdname, ndname)
                    })}
                    onOutputFieldChange={(dname, fieldName, value) => 
                        props.onSettingsChange({
                            ...props.preset.settings,
                            outputdevices: setFieldValueForDeviceNameInDeviceList(props.preset.settings.outputdevices, dname, fieldName, value)
                        })
                    }
                    onAddPress={() =>{
                        const potentialInList = getUnselectedDeviceNamesInDeviceList(props.preset.settings.inputdevices)
                        const potentialOutList = getUnselectedDeviceNamesInDeviceList(props.preset.settings.outputdevices)
                        if (potentialInList.length > 0 && potentialOutList.length > 0) {
                            props.onSettingsChange({
                                ...props.preset.settings,
                                inputdevices: addSelectedDeviceNameInDeviceList(props.preset.settings.inputdevices, potentialInList[0]),
                                outputdevices: addSelectedDeviceNameInDeviceList(props.preset.settings.outputdevices, potentialOutList[0]),
                            });
                        }
                    }}
                    onRemovePress={(inName, outName) =>{
                        props.onSettingsChange({
                                    ...props.preset.settings,
                                    inputdevices: removeSelectedDeviceNameInDeviceList(props.preset.settings.inputdevices, inName),
                                    outputdevices: removeSelectedDeviceNameInDeviceList(props.preset.settings.outputdevices, outName),
                        });
                    }}

                    onTestPress={() => {}}
 
 
                />
               <FormButton label="Cancel Connection" onPress={()=>cancelDeviceOperation(selectedDev.id)} display={connecting}/>
               <ActivityIndicator size="large" animating={isConnecting}/>
         </ScrollView>
    );
};

PresetCreationForm.defaultProps = {
    displayServerSelect: true, 
}
PresetCreationForm.propTypes = {
    preset: PropTypes.shape({
        settings: PropTypes.any,
    }),
    onSettingsChange: PropTypes.func.isRequired,
    onDeviceIDChange: PropTypes.func.isRequired,
    onNameChange: PropTypes.func.isRequired,
    onTestPress: PropTypes.func.isRequired,
    displayServerSelect: PropTypes.bool.isRequired,
};

export default PresetCreationForm;


