import React, { useState, useEffect } from 'react';
import { RefreshControl, Pressable, Text, View, ScrollView, StyleSheet } from 'react-native';
import  Animated, {
         useSharedValue,
         useAnimatedStyle,
         withSpring,
         withTiming,
} from 'react-native-reanimated'
import Icon from "react-native-vector-icons/Ionicons";
import PropTypes from "prop-types";

export default function FormDropdownMenu(props) {
    // Default keys for items
    if (props.items.length != 0 && !props.items[0].hasOwnProperty("key")) {
        props.items = props.items.map((item,index) => {
            return ({...item, key: index});
        });
    }
    const dropHeight = 200;
    const timing = 5;
    const height = useSharedValue(0);
    const rotation = useSharedValue(0);
    const [selected, setSelected] = useState({label: props.initialLabel});
    useEffect(() => {
        setSelected({label: props.initialLabel});
        return () => {}; 
    }, [props.initialLabel]);

    const animatedDropStyles = useAnimatedStyle(() => {
        return {
           borderRightWidth: height.value != 0 ? 1 : 0,
           borderLeftWidth:  height.value != 0 ? 1 : 0,
           borderBottomWidth: height.value != 0 ? 1 : 0,
           height: height.value,
        };
    });
    const animatedArrowStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: rotation.value + 'deg' },
            ],
        };
    });
    return (
        <>
        { props.display ?
            <>
                <Text> {props.label} </Text>
                <Pressable style={styles.text} onPress={() => 
                    {
                        if (height.value == dropHeight) {
                            props.onClose();
                            height.value = withTiming(0, timing);
                            rotation.value = withTiming(0, timing);
                        } else {
                            props.onDrop();
                            height.value = withTiming(dropHeight, timing);
                            rotation.value = withTiming(-180, timing);
                        }
                    }}> 
                    
                    {props.renderSelected(selected)}

                    <Animated.View style={animatedArrowStyles}>
                        <Icon name="caret-down" size={20}/>
                    </Animated.View>
                    
                </Pressable>
                <Animated.ScrollView 
                 style={[styles.scrollView, animatedDropStyles]}
                 refreshControl={props.refreshControl}
                >
                    {props.items.map(item => { return (<Pressable onPress={() => {
                    setSelected(item); props.onSelect(item);}} style={props.itemStyle} key={item.key}> 
                        {props.renderItem(item)} 
                        </Pressable>);})}
                </Animated.ScrollView>
            </>
            : <View/>
        }
        </>
    );
}

FormDropdownMenu.defaultProps = {
    display: true,
    label: "Select Item",
    initialLabel: "Select item...",
    initialSublabel: "",
    items: [],
    itemStyle: {},
    refreshControl: null,
    renderSelected: (item) => 
    (
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


FormDropdownMenu.propTypes = {
    display: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    initialLabel: PropTypes.string.isRequired,    
    initialSublabel: PropTypes.string,
    renderItem: PropTypes.func.isRequired,
    renderSelected: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        sublabel: PropTypes.string,
        value: PropTypes.any.isRequired,
    })).isRequired,
    itemStyle: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
 
const styles = StyleSheet.create({
    text: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
            


