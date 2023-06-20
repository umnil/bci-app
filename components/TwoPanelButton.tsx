import { StyleSheet, View, Pressable, Button, Text } from 'react-native';
import { useState } from 'react';
import  Animated, {
         useSharedValue,
         useAnimatedStyle,
         withSpring,
         withTiming } from 'react-native-reanimated'
import { Gesture,
         GestureDetector } from 'react-native-gesture-handler'
import  PropTypes from "prop-types";

export default function TwoPanelButton(props) {
    const timing = 5;
    const left = useSharedValue(0);
    const leftRadius = useSharedValue(10); 
    const animatedStyles = useAnimatedStyle(() => {
        return {
          transform: [
            { translateX: left.value },
          ],
          borderBottomRightRadius: 10 - leftRadius.value,
          borderTopRightRadius: 10 - leftRadius.value,   
          borderBottomLeftRadius: leftRadius.value,
          borderTopLeftRadius: leftRadius.value,                
        };
    });
    return (
        <View style={styles.container}>
            <Animated.View style={[styles.overlaySquare, animatedStyles ]}/>
            <Pressable style={[styles.buttonLeft]} onPress={() => {
                left.value = withTiming(0, timing);
                leftRadius.value = withTiming(10, timing);
                props.onPressLeft();}} disabled={props.disabledLeft}>
                <Text style={styles.buttonLeftText}> {props.titleLeft} </Text>
            </Pressable>
            <Pressable style={[styles.buttonRight]} onPress={() => {
                left.value = withTiming(60, timing);
                leftRadius.value = withTiming(0, timing);
                props.onPressRight();}} disabled={props.disabledRight}>
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
    overlaySquare: {
        height: 60,
        width:60, 
        zIndex: 2, 
        backgroundColor: "grey",
        opacity: 0.5,
        position: 'absolute',
    },
    buttonRight: {
        height:60,
        width:60,
        backgroundColor: 'white',
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
        backgroundColor: 'white',
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

