import React, { useState } from 'react'; 
import { StyleSheet, View, Text, useWindowDimensions} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

import PropTypes from 'prop-types';



export default function FormSlider(props) {
    const width = useWindowDimensions().width;
    const slideStart = 10;
    const slideEnd = width - 52;
    const isPressed = useSharedValue(false);
    const offset = useSharedValue(slideStart);
    const start = useSharedValue(slideStart);

    const gesture = Gesture.Pan()
        .onBegin(() => {
            isPressed.value = true;
        })
        .onUpdate((e) => {
            const rawOffset = e.translationX + start.value;
            const boundedOffset = rawOffset < slideStart ? slideStart :
                                 rawOffset > slideEnd ? slideEnd :
                                 rawOffset;
            offset.value = boundedOffset; 
        })
        .onEnd(() => {
            start.value = offset.value;
        })
        .onFinalize(() => {
            isPressed.value = false;
        }); 
        const ballAnimatedStyles = useAnimatedStyle(() => {
            return {
                transform: [
                    { translateX: offset.value },
                    { scale: withSpring(isPressed.value ? 1.1 : 1) },
                ],
            };
        });
    
    return (
        <>
            <Text> {props.label} </Text>
            <View>
                <View style={styles.slideContainer}>
                    <GestureDetector gesture={gesture}>
                        <Animated.View style={[styles.slideCircle, ballAnimatedStyles]} />
                    </GestureDetector>
                    <Animated.View style={[styles.slideBar]} />
                </View>
            </View>
        </>
    );

}


const styles = StyleSheet.create({
    slideContainer: {
        height: 40,
        margin: 12,
        padding: 10,
        borderWidth: 1,
        justifyContent: 'center',
    },
    slideCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,    
        borderColor: 'grey',
        borderWidth: 1.1,
        backgroundColor: 'lightgray',
        borderOpacity: 0.03,
        zIndex: 3,
        position: 'absolute',
    },
    slideBar: {
        height: 7,
        borderRadius: 10,
        backgroundColor: 'silver',
        zIndex: 2,
    },

});
