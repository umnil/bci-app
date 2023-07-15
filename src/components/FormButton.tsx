import {View, StyleSheet, Pressable, Text} from 'react-native';
import React, { useState } from 'react';

export default function FormButton(props) {
    return (
    <>
       { props.display ?
         <Button {...props}/>  : null
       }   
    </>
    );
 
}

function Button(props) {
    const [pressing, setPressing] = useState(false); 
    return (
       <Pressable 
         disabled={props.disabled}
         onPressIn={() => setPressing(true)}
         onPressOut={() => setPressing(false)}
         onPress={props.onPress}> 
        <View style={[styles.pressableContainer,{backgroundColor: pressing ? 'grey' : 'white'} ]}>
                <Text> {props.label} </Text> 
        </View>
      </Pressable> 
    );
};


FormButton.defaultProps = {
    display: true,
    label: "Button",
    disabled: false,
}
const styles = StyleSheet.create({
    pressableContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});

