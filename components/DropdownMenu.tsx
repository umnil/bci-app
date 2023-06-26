import React, { useState } from 'react';
import { Pressable, Text, View, ScrollView, StyleSheet } from 'react-native';
import  Animated, {
         useSharedValue,
         useAnimatedStyle,
         withSpring,
         withTiming,
} from 'react-native-reanimated'
import PropTypes from "prop-types";

export default function DropdownMenu(props) {
    const dropHeight = 200;
    const timing = 5;
    const height = useSharedValue(0);
    const [selected, changeSelected] = useState(props.default);
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
                        props.onClose();
                        height.value = withTiming(0, timing);
                    } else {
                        props.onDrop();
                        height.value = withTiming(dropHeight, timing);
                    }
                }}> 
                {props.renderSelected(selected)}    
            </Pressable>
            <Animated.ScrollView style={[styles.scrollView, animatedStyles]}>
                {props.items.map(item => { return (<Pressable onPress={() => {
                changeSelected(item); props.onSelect(item);}} style={props.itemStyle} key={item.key}> 
                    {props.renderItem(item)} 
                    </Pressable>);})}
            </Animated.ScrollView>
        </View>
    );
}

DropdownMenu.defaultProps = {
    label: "Select Item",
    default: {label: "None"},
    items: {},
    itemStyle: {},
    renderSelected: (item) => (
        <View style={styles.selected}>
            <Text style={styles.label}> {item == null ? "" : (item.label.length > 30 ? (item.label.substring(0,30) + "...") : item.label) } </Text> 
            {(item != null && item.hasOwnProperty('sublabel')) && (<Text style={styles.sublabel}> {item.sublabel} </Text>)}
        </View>
    ),
    renderItem: (item) => (
        <View style={styles.item}>
            <Text style={styles.label}> {item == null ? "" : item.label } </Text> 
            {(item != null && item.hasOwnProperty('sublabel')) && (<Text style={styles.sublabel}> {item.sublabel} </Text>)}
        </View>
    ),
    onSelect: (item)=>{},
    onDrop: ()=>{},
    onClose: ()=>{},

};


DropdownMenu.propTypes = {
    label: PropTypes.string.isRequired,
    default: PropTypes.string.isRequired,
    renderItem: PropTypes.func.isRequired,
    renderSelected: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        sublabel: PropTypes.string,
        value: PropTypes.any.isRequired,
        key: PropTypes.any.isRequired,
    })).isRequired,
    itemStyle: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
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
    },
    label: {
       fontSize: 15, 
    },
    sublabel: {
       fontSize: 10, 
    },
    selected: {
        margin: 5,
        padding: 3,
        borderWidth: 0.2,
    },
    item: {
        margin: 5,
        padding: 3,
        borderWidth: 0.5,
        borderStyle: 'dashed',
    },

 
});
            


