import { Alert, Button, ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import FormDropdownMenu from "../components/FormDropdownMenu";
import FormSlider from "../components/FormSlider";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as ActionCreators from '../actionCreators'; 
import { useBLEScanAndAccEffect, 
         readDeviceSettings, 
         writeDeviceSettings, 
         getSelectedInputName,
         setSelectedInputName,
         setSelectedInputValue,
         getSelectedInputSettings,
         getSelectedOutputName,
         setSelectedOutputName,
         setSelectedOutputValue,
         getSelectedOutputSettings,
         addPreset,
        } from '../controllers/presetController';



const useNavEffect = (navigation, addPreset, name, serverID, settings) => {
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button onPress={() =>{
                    navigation.navigate("Presets", {});
                    addPreset({name: name, deviceID: serverID, settings: settings});
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
         Alert.alert('Cannot connect to server!', 'The selected server \'' + device.id + '\' cannot be connected to.\n Error: ' + error, [
            {
                text: 'Ok',
                onPress: () => {},
            },   
        ]);
    }); 
};


const settings2Views = (settings, onChange) =>
{
    return (
        <>
            {
                settings.map((obj) => {
                    switch(obj.type) {
                        case "ListPicker":    
                            return (<FormDropdownMenu items={obj.items.map((curr, index) => 
                            ({label: curr + "", value: index}))} 
                            initialLabel={obj.items[parseInt(obj.value)] + ""}
                            label={obj.display_name}
                            init={false}
                            onSelect={(item) => onChange(obj.name, item.value)}/>);
                            
                        case "Slider":    
                            return (<FormSlider 
                                    lower={parseFloat(obj.minValue)} 
                                    upper={parseFloat(obj.maxValue)} 
                                    initial={parseFloat(obj.value)} 
                                    label={obj.display_name}
                                    onSlide={(item) => {onChange(obj.name, item)}}/>);
                    }
                })
            }
        </>
    );
}

function PresetCreationScreen(props) {
    const emptySettings = {
        inputdevices: {
            selected_device: "",
            devices: []
        },
        outputdevices: {
            selected_device: "",
            devices: []
        },
    };
    const [isForm , setForm] = useState(true);
    const [isSelect , setSelect] = useState(false);
    const [devices, setDevices] = useState([]);
    const [isServerScan, setServerScan] = useState(false);
    const [serverID, setServerID] = useState("");
    const [settings, setSettings] = useState(emptySettings);
    const [name, setName] = useState("");
    
    useNavEffect(props.navigation, props.addPreset, name, serverID, settings);

    useBLEScanAndAccEffect(isServerScan, devices, setDevices);

    const onInputSettingChange = (fieldName, value) => {
        const modObj = setSelectedInputValue(settings, fieldName, value);
        setSettings(modObj);
    };

    const onOutputSettingChange = (fieldName, value) => {
        const modObj = setSelectedOutputValue(settings, fieldName, value);
        setSettings(modObj);
    };


    return (
        <ScrollView nestedScrollEnabled = {true}>
              <TwoPanelButton titleLeft="Form" titleRight="Drag"  
               onPressLeft={() => {setForm(true);}} onPressRight={() => {setForm(false);}}
                disabledRight={true}/>  
               <FormTextInput onChangeText={(e)=>setName(e)} label="Preset Name" />
               <FormDropdownMenu label="Server" 
                onSelect={(item) => serverSelect(item, setServerID, setSettings, setSelect)}
                onDrop={()=>{setDevices([]); setServerScan(true);}} onClose={()=>setServerScan(false)}
                items={serversToItems(devices)}/>
               {
                isSelect ?  
                isForm ? 
                        <>
                            <FormDropdownMenu label="Input Device" 
                            items={devices2Items(settings.inputdevices.devices)} 
                            initialLabel={getSelectedInputName(settings)}
                            onSelect={(e)=>setSettings(setSelectedInputName(settings, e.label))}/>
                            {settings2Views(getSelectedInputSettings(settings), onInputSettingChange)}
                            <FormDropdownMenu label="Output Device" 
                            items={devices2Items(settings.outputdevices.devices)} 
                            initialLabel={getSelectedOutputName(settings)}
                            onSelect={(e)=>setSettings(setSelectedOutputName(settings, e.label))}/>
                            {settings2Views(getSelectedOutputSettings(settings), onOutputSettingChange)}
                        
                        </>
 
                        :
                         <DragDropItemList data={items} renderItem={(item) => <Text> {item.value} </Text>}/>
                        :
                        <View/>
               }
        </ScrollView>
    );
}

const matchDispatchToProps = (dispatch) => { 
    return {
        addPreset: (e) => dispatch(addPreset(e)),
    };
};

export default connect(null, matchDispatchToProps)(PresetCreationScreen);
