import { Alert, Button, ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import FormDropdownMenu from "../components/FormDropdownMenu";
import FormSlider from "../components/FormSlider";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as ActionCreators from '../actionCreators'; 
import { manager } from '../bleManager';
import BLEStream from '../bleStream';
import {useBLEScanAndAcc} from '../controllers/presetCreationController';


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
        items.push({ label: dev["device_name"], value: dev["device_settings"] }); 
    }
   return items;
}

const serverSelect = (item, setServer, setSettings, setIsSelect) => {
    setIsSelect(false);
    const device = item.value;
    const serviceUUID = '51ff12bb-3ed8-46e5-b4f9-d64e2fec021b';
    setServer(device); 
    device.connect() 
    .then((device) => {
        return device.discoverAllServicesAndCharacteristics();
    })
    .then((services) => {
        return BLEStream.streamRead(manager, device, serviceUUID);

    })
    .then((resStr) => {
          let obj : any;
          try {
            obj = JSON.parse(resStr);
          }
          catch {
            reject(error);
          }
          console.log(JSON.stringify(obj));
          setSettings(obj);
          setIsSelect(true);
    })
    .catch((error) => {
         setIsSelect(false);
         Alert.alert('Cannot connect to server !', 'The selected server \'' + device.id + '\' cannot be connected to.\n Error: ' + error, [
            {
                text: 'Ok',
                onPress: () => {},
            },   
        ]);
    });

};


const settings2Views = (settings) =>
{
    return (
        <>
            {
                settings.map((obj) => {
                    switch(obj["type"]) {
                        case "ListPicker":    
                            return (<FormDropdownMenu items={obj["items"].map((curr, index) => 
                            ({label: curr, value: index}))} label={obj["display_name"]}/>);
                        case "Slider":    
                            return (<FormSlider 
                                    lower={parseFloat(obj["minValue"])} 
                                    upper={parseFloat(obj["maxValue"])} 
                                    initial={parseFloat(obj["value"])} 
                                    label={obj["display_name"]}/>);
                    }
                })
            }
        </>
    );
}

function PresetCreationScreen(props) {
    const [isForm , setForm] = useState(true);
    const [isSelect , setSelect] = useState(false);
    const [devices, setDevices] = useState([]);
    const [isServerScan, setServerScan] = useState(false);
    const [settings, setSettings] = useState({});
    const [inputSetting, setInputSetting] = useState([]);
    const [outputSetting, setOutputSetting] = useState([]);
    

    useBLEScanAndAcc(isServerScan, devices, setDevices);

    useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <Button onPress={() =>{
                    props.navigation.navigate("Presets", {});
                    props.commitPreset();
                } } title="Save" />
            ),
            headerLeft: () => (
                <Button onPress={() =>{
                    props.navigation.navigate("Presets", {});
                    props.flushPreset();
                } } title="Cancel" />
            ),
        });

    }, [props.navigation]);

    return (
        <ScrollView nestedScrollEnabled = {true}>
              <TwoPanelButton titleLeft="Form" titleRight="Drag"  
               onPressLeft={() => {setForm(true);}} onPressRight={() => {setForm(false);}}
                disabledRight={true}/>  
               <FormTextInput onChangeText={(e)=>{props.setName(e);}} label="Preset Name" />
               <FormDropdownMenu label="Server" onSelect={(item) => serverSelect(item, props.setServer, setSettings, setSelect)}
                onDrop={()=>{setDevices([]); setServerScan(true);}} onClose={()=>setServerScan(false)}
                     items={serversToItems(devices)}/>
               {
                isSelect ?  
                isForm ? 
                        <>
                            <FormDropdownMenu label="Input Device" items={devices2Items(settings["inputdevices"]["devices"])} onSelect={(e)=>setInputSetting(e.value)}/>
                            {settings2Views(inputSetting)}
                            <FormDropdownMenu label="Output Device" items={devices2Items(settings["outputdevices"]["devices"])} onSelect={(e)=>setOutputSetting(e.value)}/>
                            {settings2Views(outputSetting)}
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
        commitPreset: () => dispatch(ActionCreators.commitPresetInProgess()),
        flushPreset: () => dispatch(ActionCreators.flushPresetInProgess()),
        setName: (e) => dispatch(ActionCreators.setPresetInProgessName(e)),
        setServer: (e) => dispatch(ActionCreators.setPresetInProgessServer(e)),
        setInput: (e) => dispatch(ActionCreators.setPresetInProgessInput(e)),
        setDecoder: (e) => dispatch(ActionCreators.setPresetInProgessDecoder(e)),
        setOutput: (e) => dispatch(ActionCreators.setPresetInProgessOutput(e)),
    };
};

export default connect(null, matchDispatchToProps)(PresetCreationScreen);
