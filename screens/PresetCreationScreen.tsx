import { Button, ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import DropdownMenu from "../components/DropdownMenu";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as ActionCreators from '../actionCreators'; 
import { manager } from '../bleManager';

const items = new Array(20)
  .fill(null)
  .map((v, i) => ({ label: i.toString(), value: ('Item ' + i.toString())
}));


const scanAndAcc = (arr, setArr, isScan) => {
    if(!isScan) {
        manager.stopDeviceScan();
        return; 
    }
    manager.startDeviceScan(null, null, (error, device) =>
    {
        if (error) {
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id == device.id) {
                return;
            }
        }
        setArr([...arr, device]);
    });
};

const deviceToItems = (devices) => {
    const named = [];
    const nnamed = [];
    for(let i = 0; i < devices.length; i++) {
        if (devices[i].name) {
            named.push({label: devices[i].name, sublabel: devices[i].id , value: devices[i], key: devices[i].id}); 
        } else {
            nnamed.push({label: "Unknown", sublabel: devices[i].id , value: devices[i], key: devices[i].id}); 
        }
    } 
    named.sort((i1,i2) => i1.rssi > i2.rssi)
    const items = named.concat(nnamed);
    return items;
};


function PresetCreationScreen(props) {
    const [isForm , setForm] = useState(true);
    const [devices, setDevices] = useState([]);
    const [isServerScan, setServerScan] = useState(false);
    useEffect(() => {
      const subscription = manager.onStateChange((state) => {
          if (state === 'PoweredOn') {
              subscription.remove();
              scanAndAcc(devices, setDevices, isServerScan);
          }
      }, true);
      return () => { subscription.remove(); manager.stopDeviceScan();}
    }, [manager, isServerScan, devices]);
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
               onPressLeft={() => {setForm(true);}} onPressRight={() => {setForm(false);}}/>  
               <FormTextInput onChangeText={(e)=>{props.setName(e);}} label="Preset Name" />
               <DropdownMenu label="Server" onSelect={(e)=>props.setServer(e.value)} onDrop={()=>{setDevices([]); setServerScan(true);}} onClose={()=>setServerScan(false)}
                     items={deviceToItems(devices)}/>
               { isForm ? 
                        <>
                            <DropdownMenu label="Input Device" items={items} onSelect={(e)=>props.setInput(e)}/>
                            <DropdownMenu label="Decoder" items={[{label: "mac", value: "mac"}, {label: "mac1", value: "mac1"}]} onSelect={(e)=>props.setDecoder(e)}/>
                            <DropdownMenu label="Output Device" items={[{label: "mac", value: "mac"}, {label: "mac1", value: "mac1"}]} onSelect={(e)=>props.setOutput(e)}/>
                        </>
 
                        :
                         <DragDropItemList data={items} renderItem={(item) => <Text> {item.value} </Text>}/>
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
