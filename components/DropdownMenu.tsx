import React, { useState } from 'react';
import { Pressable, Text, View, ScrollView, StyleSheet } from 'react-native';
import  Animated, {
         useSharedValue,
         useAnimatedStyle,
         withSpring,
         withTiming,
} from 'react-native-reanimated'
import PropTypes from "prop-types";

const data = new Array(100)
  .fill(null)
  .map((v, i) => ({ key: i.toString(), value: ('Item ' + i.toString())
}));

export default function DropdownMenu(props) {
    const dropHeight = 100;
    const timing = 10;
    const height = useSharedValue(0);
    const [selected, changeSelected] = useState("None");
    const animatedStyles = useAnimatedStyle(() => {
        return {
           borderRightWidth: height.value != 0 ? 1 : 0,
           borderLeftWidth:  height.value != 0 ? 1 : 0,
           borderBottomWidth: height.value != 0 ? 1 : 0,
           height: height.value,
        };
    });
    return (
        <View styles={styles.container}>
            <Text> {props.label} </Text>
            <Pressable style={styles.text} onPress={() => 
                {
                    if (height.value == dropHeight) {
                        height.value = withTiming(0, timing)
                    } else {
                        height.value = withTiming(dropHeight, timing)
                    }
                }}> 
                <Text> {selected} </Text> 
            </Pressable>
            <Animated.ScrollView style={[styles.scrollView, animatedStyles]}>
                {props.items.map(item => { return (<Pressable onPress={() => {
                changeSelected(item.label); props.onSelect(item);}} style={props.itemStyle}> 
                    <Text> {item.label} </Text>
                    </Pressable>);})}
            </Animated.ScrollView>
        </View>
    );
}

DropdownMenu.defaultProps = {
    label: "Select Item",
    onSelectValue: (e) => {},
    default: "None", 
    items: {},
    itemStyle: {},
    onSelect: (item)=>{},
};


DropdownMenu.propTypes = {
    label: PropTypes.string.isRequired,
    onSelectValue: PropTypes.func.isRequired,
    default: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
    })).isRequired,
    itemStyle: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
};
 
const styles = StyleSheet.create({
    container: {
        zIndex: 2
    },
    text: {
        borderWidth: 1,
        padding: 10,
        marginTop: 12,
        marginLeft: 12,
        marginRight: 12,
        borderWidth: 1,
    },
    scrollView: {
        zIndex: 2,
       marginLeft: 12,
        marginRight: 12,
        marginBottom: 12,
    }
 
});
            


