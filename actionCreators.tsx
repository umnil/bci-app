import * as ActionTypes from "./actionTypes";

export const addPresets = (preset) => { 
    return {
        type: ActionTypes.ADD_PRESET,
        payload: {preset: preset}
    };
};

export const deletePreset = (id) => { 
    return {
        type: ActionTypes.DELETE_PRESET,
        payload: {id: id}
    };
};

export const setPresetInProgessName = (name) => {      
    return {
        type: ActionTypes.SET_PRESET_PROGRESS_NAME,
        payload: {name: name}
    };
};      

export const setPresetInProgessServer = (server) => {
     return {
        type: ActionTypes.SET_PRESET_PROGRESS_SERVER,
        payload: {server: server}
    };
};      

export const setPresetInProgessInput = (input) => {
     return {
        type: ActionTypes.SET_PRESET_PROGRESS_INPUT,
        payload: {input: input}
    };
};            
             
export const setPresetInProgessDecoder = (decoder) => {
     return {
        type: ActionTypes.SET_PRESET_PROGRESS_DECODER,
        payload: {decoder: decoder}
    };
};            
             
export const setPresetInProgessOutput = (output) => {
     return {
        type: ActionTypes.SET_PRESET_PROGRESS_OUTPUT,
        payload: {output: output}
    };
};            
 
export const commitPresetInProgess = () => {
    return {
        type: ActionTypes.COMMIT_PRESET_PROGRESS,
        payload: {}
    };
};

export const flushPresetInProgess = () => {
    return {
        type: ActionTypes.FLUSH_PRESET_PROGRESS,
        payload: {}
    };
};

