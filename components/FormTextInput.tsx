import React from 'react';
import { Text, TextInput, View } from 'react-native';
import PropTypes from "prop-types";

export default function FormTextInput(props) {
    return (
       <View>
           <Text> {props.label} </Text>
           <TextInput {...props} />
       </View>
    );
}

FormTextInput.propTypes = {
    label: PropTypes.string.isRequired,
};
    

