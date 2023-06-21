import { Button, ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import DropdownMenu from "../components/DropdownMenu";
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { SET_PRESET_PROGRESS_NAME, 
         SET_PRESET_PROGRESS_SERVER, 
         SET_PRESET_PROGRESS_INPUT, 
         SET_PRESET_PROGRESS_DECODER, 
         SET_PRESET_PROGRESS_OUTPUT, 
         COMMIT_PRESET_PROGRESS, 
         FLUSH_PRESET_PROGRESS, 
         setPresetInProgressName,
         setPresetInProgressServer,
         setPresetInProgressInput,
         setPresetInProgressDecoder,
         setPresetInProgressOutput,
         commitPresetInProgress,
         flushPresetInProgress,
} from '../reducer';

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
        commitPreset: () => dispatch({type: COMMIT_PRESET_PROGRESS}),
        flushPreset: () => dispatch({type: FLUSH_PRESET_PROGRESS}),
        setName: (e) => dispatch({type: SET_PRESET_PROGRESS_NAME, payload:{name:e}}),
        setServer: (e) => dispatch({type: SET_PRESET_PROGRESS_SERVER, payload:{server:e}}),
        setInput: (e) => dispatch({type: SET_PRESET_PROGRESS_INPUT, payload:{input:e}}),
        setDecoder: (e) => dispatch({type: SET_PRESET_PROGRESS_DECODER, payload:{decoder:e}}),
        setOutput: (e) => dispatch({type: SET_PRESET_PROGRESS_OUTPUT, payload:{output:e}}),
    };
};

export default connect(null, matchDispatchToProps)(PresetCreationScreen);
