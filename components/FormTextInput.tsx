import React , {useState} from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import PropTypes from "prop-types";

export default function FormTextInput(props) {
    const [text, changeText] = useState(props.defaultText ? props.defaultText : "");
    return (
       <View>
           <Text> {props.label} </Text>
           <TextInput onChangeText={
            (e) => { changeText(e);
                     props.onChangeText(e);   
            }}
            value={text}
            />
       </View>
    );
}

FormTextInput.defaultProps = {
    label: "Text Input",
    onChangeText: (e) => {},
    defaultText: "", 
};


FormTextInput.propTypes = {
    label: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired,
    defaultText: PropTypes.string.isRequired,
};
    

