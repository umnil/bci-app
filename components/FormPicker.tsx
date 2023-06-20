import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { Text, View } from 'react-native';
import PropTypes from "prop-types";

export default function FormPicker(props) {
    return (
       <View>
        <Text> {props.label} </Text>
        <Picker {...props}>
         {props.items.map((item) => <Picker.Item 
            key={item.label} label={item.label} value={item.value}/>)}   
        </Picker>
       </View>
    );
}

FormPicker.propTypes = {
    label: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
    })).isRequired,
};
    

