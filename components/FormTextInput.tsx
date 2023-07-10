import React , {useState} from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import PropTypes from "prop-types";

export default function FormTextInput(props) {
    const [text, changeText] = useState(props.defaultText);
    return (
       <>
       { props.display ?
           <>
            <Text> {props.label} </Text>
            <TextInput style={styles.textInput} onChangeText={
             (e) => { changeText(e);
                      props.onChangeText(e);   
             }}
             value={text}
             />
           </>
           : <View/>
       }
       </>
    );
}

FormTextInput.defaultProps = {
    display: true,
    label: "Text Input",
    onChangeText: (e) => {},
    defaultText: "", 
};


FormTextInput.propTypes = {
    display: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired,
    defaultText: PropTypes.string.isRequired,
};
    

const styles = StyleSheet.create({
    textInput: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});

