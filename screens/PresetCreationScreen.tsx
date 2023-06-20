import { ScrollView, TextInput, Text, View, FlatList } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import FormPicker from "../components/FormPicker";
import FormTextInput from "../components/FormTextInput";
import TwoPanelButton from "../components/TwoPanelButton";
import DragDropItemList from "../components/DragDropItemList";
import { useState } from 'react';

const data = new Array(20)
  .fill(null)
  .map((v, i) => ({ key: i.toString(), value: ('Item ' + i.toString())
}));


export default function PresetCreationScreen() {
    const [isForm , setForm] = useState(true);
    const [isScroll , setScroll] = useState(true);
    return (
        <ScrollView nestedScrollEnabled = {true}>
              <TwoPanelButton titleLeft="Form" titleRight="Drag&Drop" 
               onPressLeft={() => {setForm(true);}} onPressRight={() => {setForm(false);}}/>  
               <FormTextInput label="Preset Name" />
               <FormPicker label="Server" items={[{label: "mac", value: "mac"}, {label: "mac1", value: "mac1"}]} />
               {isForm ? <Form/> : <DragDrop/> }
        </ScrollView>
    );
}

function Form(props) {
    return (
        <>
            <FormPicker label="Input Device" items={[{label: "mac", value: "mac"}]}/>
            <FormPicker label="Decoder" items={[{label: "mac", value: "mac"}]}/>
            <FormPicker label="Output Device" items={[{label: "mac", value: "mac"}]}/>
        </>
    );
}

function DragDrop(props) {
    return (
            <DragDropItemList  data={data} renderItem={(item) => <Text> {item.value} </Text>}/>
    );
}
