import { Button, ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import DropdownMenu from "../components/DropdownMenu";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as ActionCreators from '../actionCreators'; 

const items = new Array(20)
  .fill(null)
  .map((v, i) => ({ label: i.toString(), value: ('Item ' + i.toString())
}));


function PresetCreationScreen(props) {
    const [isForm , setForm] = useState(true);
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
               <DropdownMenu label="Server" onSelect={(e)=>props.setServer(e)}
                    items={[{label: "mac", value: "mac"}, {label: "mac1", value: "mac1"}]} />
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
