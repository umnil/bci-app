import 'react-native-reanimated';
import React, { useState } from 'react'; 
import { StyleSheet, View, Text, TextInput, useWindowDimensions} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    runOnUI,
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withSpring,
} from 'react-native-reanimated';

import PropTypes from 'prop-types';

Animated.addWhitelistedNativeProps({ text: true });

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const pos2value = (gLower, gUpper, lower, upper, pos) => {
    const cutoffPos = pos < gLower ? gLower :
                      pos > gUpper ? gUpper :
                      pos;
    const toUnit = ((cutoffPos - gLower)/(gUpper - gLower));
    const toValue = toUnit * (upper - lower) + lower;
    return toValue;
};

const value2pos = (gLower, gUpper, lower, upper, value) => {
    const cutoffValue = value < lower ? lower :
                        value > upper ? upper :
                        value;
    const toUnit = ((cutoffValue - lower)/(upper - lower));
    const toPos = toUnit * (gUpper - gLower) + gLower;
    return toPos;

};


export default function FormSlider(props) {
    props.initial = props.initial == -1 ? props.lower : props.initial;
    const width = useWindowDimensions().width;
    
    const slideStart = 10;
    const slideEnd = width - 50;

    const ballSlideStart = slideStart;
    const ballSlideEnd = slideEnd - 10;

    const isPressed = useSharedValue(false);
    const initialPos = value2pos(ballSlideStart, ballSlideEnd, props.lower, props.upper, props.initial);
    const offset = useSharedValue(initialPos);
    const start = useSharedValue(initialPos);
    const text = useSharedValue(props.initial.toString());
    const gesture = Gesture.Pan()
        .onBegin(() => {
            isPressed.value = true;
        })
        .onUpdate((e) => {
            const rawOffset = e.translationX + start.value;
            const boundedOffset = rawOffset < ballSlideStart ? ballSlideStart :
                                 rawOffset > ballSlideEnd ? ballSlideEnd:
                                 rawOffset;
            const toUnit = ((boundedOffset - ballSlideStart)/(ballSlideEnd - ballSlideStart));
            const value = toUnit * (props.upper - props.lower) + props.lower;

            text.value = value.toString();
            offset.value = boundedOffset; 
        })
        .onEnd(() => {
            start.value = offset.value;
        })
        .onFinalize(() => {
            runOnJS(props.onSlide)(parseFloat(text.value));
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
        const emptyBarAnimatedStyles = useAnimatedStyle(() => {
            return {
                width: slideEnd - offset.value,
            };
        });   
        const selectBarAnimatedStyles = useAnimatedStyle(() => {
            return {
                width: offset.value,
            };
        });   
        const textInputProps = useAnimatedProps(() => {
            return {
                text: text.value,
            };
        });

    return (
        <>
        { props.display ?
            <>
               <Text> {props.label} </Text>
               <View style={styles.slideContainer}>
                   <GestureDetector gesture={gesture}>
                       <Animated.View style={[styles.slideCircle, ballAnimatedStyles]} />
                   </GestureDetector>
                   <View style={styles.slideBar}>
                       <Animated.View style={[styles.slideBarSelect, selectBarAnimatedStyles]}/>
                       <Animated.View style={[styles.slideBarEmpty, emptyBarAnimatedStyles]}/>
                   </View>
               </View>
               <View style={styles.displayContainer}>
                  <Text> Value: </Text>
                  <AnimatedTextInput style={{color: 'black'}} value={text.value} 
                  editable={false} animatedProps={textInputProps}/> 

               </View>
            </>
            : <View/>
        }
        </>
    );

}

FormSlider.defaultProps = {
    display: true,
    label: "Slider",
    lower: 0,
    upper: 1,
    initial: 0,
    onSlide: (e) => {},
};


FormSlider.propTypes = {
    display: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onSlide: PropTypes.func.isRequired,
    lower: PropTypes.number.isRequired,
    upper: PropTypes.number.isRequired,
    initial: PropTypes.number.isRequired,
};
 

const styles = StyleSheet.create({
    slideContainer: {
        height: 40,
        margin: 12,
        padding: 10,
        borderWidth: 1,
        justifyContent: 'center',
    },
    slideCircle: {
        width: 25,
        height: 25,
        borderRadius: 15,    
        borderColor: 'grey',
        borderWidth: 1.1,
        backgroundColor: 'lightgray',
        borderOpacity: 0.03,
        zIndex: 3,
        position: 'absolute',
    },
    slideBar: {
        flexDirection: 'row',
        zIndex: 2,
    },
    slideBarEmpty: {
        height: 7,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: 'silver',
        zIndex: 2,
    },
    slideBarSelect: {
        height: 7,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: 'blue',
        zIndex: 2,
    },
    displayContainer: {
        flexDirection: 'row',
        margin: 12,
        padding: 10,
        borderWidth: 1,
    },

});
