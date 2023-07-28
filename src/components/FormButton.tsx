import {View, StyleSheet, Pressable, Text} from 'react-native';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function FormButton(props) {
    return (
    <>
       { props.display ?
         <Button {...props}/>  : null
       }   
    </>
    );
 
};

const processText = (charLimit, strLabel) => {
//    let retStr = "";
//    for (let i = 0; i < strLabel.length; i += charLimit) {
//        let j = (i + charLimit > strLabel.length ? 
//            strLabel.length :
//            i + charLimit);
//        retStr += strLabel.substring(i, j) + "\n";
//    }
//    return retStr;
    return strLabel;
};

function Button(props) {
    const [pressing, setPressing] = useState(false); 
    return (
       <Pressable 
         disabled={props.disabled}
         onPressIn={() => setPressing(true)}
         onPressOut={() => setPressing(false)}
         onPress={props.onPress}> 
        <View style={[styles.pressableContainer,{backgroundColor: pressing ? 'grey' : 'white'} ]}>
                <Text> 
                    { props.charLimit != null ? 
                            processText(props.charLimit, props.label) :
                            props.label
                    } 
                </Text> 
        </View>
      </Pressable> 
    );
};


FormButton.defaultProps = {
    display: true,
    label: "Button",
    disabled: false,
}

FormButton.propTypes = {
    display: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    charLimit: PropTypes.int,
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

