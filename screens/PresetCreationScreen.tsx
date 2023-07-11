import { RefreshControl, Alert, Button, ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import PresetCreationForm from "../components/PresetCreationForm";
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
                    navigation.navigate("Presets", {});
                } } title="Cancel" />
            ),
        });

    }, [navigation, name, serverID, settings]);

};

function PresetCreationScreen(props) {
    const [preset, setPreset] = useState({
        name: "",
        deviceID: "",
        settings: getEmptySettings(),
    }); 
    useNavEffect(props.navigation, props.addPreset, preset.name, preset.deviceID, preset.settings);
    return (
        <PresetCreationForm preset={preset} 
         onSettingsChange={(s)=>setPreset(p=>({...p, settings:s}))}
         onDeviceIDChange={(d)=>setPreset(p=>({...p, deviceID:d}))}
         onNameChange={(n)=>setPreset(p=>({...p, name:n}))}
        />
    );
}

const matchDispatchToProps = (dispatch) => { 
    return {
        addPreset: (e) => dispatch(addPreset(e)),
    };
};

export default connect(null, matchDispatchToProps)(PresetCreationScreen);
