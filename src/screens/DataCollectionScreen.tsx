import { SafeAreaView, Text, StyleSheet } from "react-native";
import React, { useState, useEffect } from 'react';
import { useToggleTestingEffect } from '../controllers/dataCollectionController.ts';

export default function DataCollectionScreen(props) {
    const [prompt, setPrompt] = useState("Loading"); 
    const preset = props.route.params.preset;
    const deviceID = preset.deviceID;
    const settings = preset.settings;

    useToggleTestingEffect(preset.deviceID, settings, (v) => setPrompt(v), []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}> {prompt} </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 40,    
    },
});

