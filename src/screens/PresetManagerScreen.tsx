import {SafeAreaView} from 'react-native';
import { useEffect } from 'react';
import PresetList from '../components/PresetList';
import { writeDeviceSettings } from '../controllers/presetController';
import * as ActionCreators from '../actionCreators';
import { connect } from 'react-redux';

function PresetManagerScreen({presets, deletePreset, route, navigation, isEdit, setEdit }) {

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setEdit(false); 
        });
             return unsubscribe;
    }, [navigation]); 

    return (
    <SafeAreaView style={{flex:1}}>
        <PresetList
            presets={presets}
            isEdit={isEdit}
            onRegularPress={(item) => writeDeviceSettings(item.deviceID, item.settings)}
            onEditPress={(item)=>{}}
            onDeletePress={(item) => deletePreset(item.id)}
        />
    </SafeAreaView>
    );

};

const mapStateToProps = (state) => {
    return {
        presets: state.presets,
    };
};

const matchDispatchToProps = (dispatch) => {
    return {
        deletePreset: (e) => dispatch(ActionCreators.deletePreset(e)),
    };
};     


export default connect(mapStateToProps, matchDispatchToProps)(PresetManagerScreen);
