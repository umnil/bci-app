import { Alert, Button, ScrollView, TextInput, Text, View, FlatList, RefreshControl } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import DeviceConfigForm from "../components/DeviceConfigForm";
import BLEDeviceDropdownMenu from "../components/BLEDeviceDropdownMenu";
import { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import * as ActionCreators from '../actionCreators'; 
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
         addPreset,
        } from '../controllers/presetController';



const useNavEffect = (navigation, addPreset, name, serverID, settings) => {
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button onPress={() =>{
                    if (name.trim() == "") {
                        return Alert.alert('Missing Name', 
                                'Please input a preset name.', [
                                {
                                    text: 'Ok',
                                    onPress: () => {},
                                },   
                            ]);   
                    } else if (serverID == "") {
                        return Alert.alert('Missing Server', 
                                'Please select a server.', [
                                {
                                    text: 'Ok',
                                    onPress: () => {},
                                },   
                            ]); 
                    }
                    navigation.navigate("Presets", {});
                    addPreset({name: name.trim(), deviceID: serverID, settings: settings});
                } } title="Save" />
            ),
            headerLeft: () => (
                <Button onPress={() =>{
                     if (serverID == "") {
                        return Alert.alert('Missing Server', 
                                'Please select a server.', [
                                {
                                    text: 'Ok',
                                    onPress: () => {},
                                },   
                            ]); 
                    }
                    navigation.navigate("Data Collection", {preset: {name: name.trim(), deviceID: serverID, settings: settings}});
                } } title="Use" />
            ),
        });

    }, [navigation, name, serverID, settings]);

};

const devices2Items = (devices) => { 
   const items = []; 
   for (const dev of devices) {
        items.push({ label: dev["device_name"], value: dev["device_name"] }); 
    }
   return items;
}

const serverSelect = (id, setServer, setSettings, setIsSelect) => {
    setIsSelect(false);
    return readDeviceSettings(id)
    .then((obj) => {
        setSettings(obj); 
        setServer(id);
        setIsSelect(true); 
    })
    .catch((error) => {
         setIsSelect(false);
         setServer("");
         setSettings(getEmptySettings());
         Alert.alert('Cannot connect to server', 
            'The selected server \'' + id + '\' cannot be connected to.\n Error: ' + error, [
            {
                text: 'Ok',
                onPress: () => {},
            },   
        ]);
    }); 
};

function SandboxScreen(props) {
    const [isForm , setForm] = useState(true);
    const [isSelect , setSelect] = useState(false);
    const [serverID, setServerID] = useState("");
    const [settings, setSettings] = useState(getEmptySettings());
    const [name, setName] = useState("");
    const [isRefresh, setRefresh] = useState(false);
    
    useNavEffect(props.navigation, props.addPreset, name, serverID, settings);
    
    const onRefresh = useCallback(() => {
        setRefresh(true);
        if (serverID != "") {
            setSelect(false); 
            writeDeviceSettings(serverID, settings)
            .then(() => readDeviceSettings(serverID))
            .then((obj) => {
                    setSettings(obj); 
                    setSelect(true); 
                    setRefresh(false)
             })
             .catch(() => setRefresh(false));
        } else {
            console.log("here");
            setRefresh(false);
        }
    }, [serverID, settings]);


    return (
        <ScrollView nestedScrollEnabled={true}
         refreshControl={
                    <RefreshControl refreshing={isRefresh} onRefresh={onRefresh}/>}
        >
               <TwoPanelButton titleLeft="Form" titleRight="Drag"  
                onPressLeft={() => setForm(true)} 
                onPressRight={() => setForm(false)}
                disabledRight={true}/>  

               <FormTextInput onChangeText={(e)=>setName(e)} label="Preset Name" /> 

               <BLEDeviceDropdownMenu label="Server" 
                onSelect={(item) => serverSelect(item.value.id, setServerID, setSettings, setSelect)}/>
               <DeviceConfigForm label="Input Device"
                display={isSelect && isForm}
                deviceList={getInputDeviceList(settings)}
                onSelectDevice={(dname) => setSettings(setSelectedInputName(settings, dname))}
                onFieldChange={(fieldName, value) => setSettings(setSelectedInputValue(settings,fieldName,value))}
               />
               <DeviceConfigForm label="Output Device"
                display={isSelect && isForm}
                deviceList={getOutputDeviceList(settings)}
                onSelectDevice={(dname) => setSettings(setSelectedOutputName(settings, dname))}
                onFieldChange={(fieldName, value) => setSettings(setSelectedOutputValue(settings,fieldName,value))}
               />
         </ScrollView>
    );
}

const matchDispatchToProps = (dispatch) => { 
    return {
        addPreset: (e) => dispatch(addPreset(e)),
    };
};

export default connect(null, matchDispatchToProps)(SandboxScreen);
