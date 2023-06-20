import { StyleSheet, View, Pressable, Button, Text } from 'react-native';
import { useState } from 'react';
import  PropTypes from "prop-types";

export default function TwoPanelButton(props) {
    const [isForm, setForm] =  useState(true);
    return (
        <View style={styles.container}>
            <Pressable style={[styles.buttonLeft, {opacity: isForm ? 1 : 0.5}]} onPress={() => {setForm(true); props.onPressLeft();}} disabled={props.disabledLeft}>
                <Text style={styles.buttonLeftText}> {props.titleLeft} </Text>
            </Pressable>
            <Pressable style={[styles.buttonRight, {opacity: !isForm ? 1 : 0.5}]} onPress={() => {setForm(false); props.onPressRight();}} disabled={props.disabledRight}>
                <Text style={styles.buttonRightText}> {props.titleRight} </Text>
            </Pressable>
         </View>
    );
}

TwoPanelButton.defaultProps = {
    titleLeft: "Left",
    titleRight: "Right",
    disabledLeft: false,
    disabledRight: false,
};

TwoPanelButton.propTypes = {
    titleLeft: PropTypes.string.isRequired,
    titleRight: PropTypes.string.isRequired,
    disabledLeft: PropTypes.bool.isRequired,
    disabledRight: PropTypes.bool.isRequired,
    onPressLeft(props, ...rest) {
        if (!props.disabledLeft) {
            return PropTypes.func.isRequired(props, ...rest);     
        }
        return PropTypes.func(props, ...rest);     
    }, 
    onPressRight(props, ...rest) {
        if (!props.disabledRight) {
            return PropTypes.func.isRequired(props, ...rest);     
        }
        return PropTypes.func(props, ...rest);     
    },
};
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        marginVertical: 10,
        marginHorizontal: 10,
    },
    buttonRight: {
        height:60,
        width:60,
        backgroundColor: 'grey',
        justifyContent: 'center', 
        alignItems: 'center',
        borderBottomRightRadius: 10,
        borderTopRightRadius: 10,
        borderColor: 'rgba(0,0,0,1)',
        borderRightWidth: 0.5,
        borderTopWidth: 0.5, 
        borderBottomWidth: 0.5,
    },
    buttonRightText: {
    },
    buttonLeft: {
        height:60,
        width:60,
        backgroundColor: 'grey',
        justifyContent: 'center', 
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        borderColor: 'rgba(0,0,0,1)',
        borderLeftWidth: 0.5, 
        borderTopWidth: 0.5, 
        borderBottomWidth: 0.5,
        borderOpacity: 1,
    },
    buttonLeftText: {
    },
    
});

