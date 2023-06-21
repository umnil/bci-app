export const GET_PRESETS = 'GET_PRESETS';
export const ADD_PRESET = 'ADD_PRESET';
export const SET_PRESET = 'SET_PRESET';
export const DELETE_PRESET = 'DELETE_PRESET';
export const SET_PRESET_PROGRESS_NAME = 'SET_PRESET_PROGRESS_NAME';
export const SET_PRESET_PROGRESS_SERVER = 'SET_PRESET_PROGRESS_SERVER';
export const SET_PRESET_PROGRESS_INPUT = 'SET_PRESET_PROGRESS_INPUT';
export const SET_PRESET_PROGRESS_DECODER = 'SET_PRESET_PROGRESS_DECODER';
export const SET_PRESET_PROGRESS_OUTPUT = 'SET_PRESET_PROGRESS_OUTPUT';
export const COMMIT_PRESET_PROGRESS = 'COMMIT_PRESET_PROGRESS';
export const FLUSH_PRESET_PROGRESS = 'FLUSH_PRESET_PROGRESS';

export default function reducer(state = { presets: [], idgen: 0, presetInProgress: {} }, action) {
    switch(action.type) {
        case GET_PRESETS:
            return state;
        case ADD_PRESET:
            return {...state, idgen: state.idgen+1, 
                    presets: [...state.presets, {...action.payload.preset, id: state.idgen}]};
        case SET_PRESET:
            return state;
        case DELETE_PRESET:
            return {...state, presets: state.presets.filter((preset) => (preset.id != action.payload.id))};
        case SET_PRESET_PROGRESS_NAME:
            return {...state, presetInProgress: {...state.presetInProgress, name: action.payload.name}};
        case SET_PRESET_PROGRESS_SERVER:
            return {...state, presetInProgress: {...state.presetInProgress, server: action.payload.server}};
        case SET_PRESET_PROGRESS_INPUT:
            return {...state, presetInProgress: {...state.presetInProgress, input: action.payload.input}};
        case SET_PRESET_PROGRESS_DECODER:
            return {...state, presetInProgress: {...state.presetInProgress, decoder: action.payload.decoder}};
        case SET_PRESET_PROGRESS_OUTPUT:
            return {...state, presetInProgress: {...state.presetInProgress, output: action.payload.output}};
        case COMMIT_PRESET_PROGRESS:
            return {...state, idgen: state.idgen+1, presets: [...state.presets, {...state.presetInProgress, id: state.idgen}], presetInProgress:{}};
        case FLUSH_PRESET_PROGRESS:
            return {...state, presetInProgress:{}};
    default:
        return state;
    }
    
}

export const getPresets = () => { 
    return {
        type: GET_PRESETS,
        payload: {}
    };
};

export const addPresets = (preset) => { 
    return {
        type: ADD_PRESET,
        payload: {preset: preset}
    };
};

export const deletePreset = (id) => { 
    return {
        type: DELETE_PRESET,
        payload: {id: id}
    };
};

export const setPresetInProgessName = (name) => {      
    return {
        type: SET_PRESET_PROGRESS_NAME,
        payload: {name: name}
    };
};      

export const setPresetInProgessServer = (server) => {
     return {
        type: SET_PRESET_PROGRESS_SERVER,
        payload: {server: server}
    };
};      

export const setPresetInProgessInput = (input) => {
     return {
        type: SET_PRESET_PROGRESS_INPUT,
        payload: {input: input}
    };
};            
             
export const setPresetInProgessDecoder = (decoder) => {
     return {
        type: SET_PRESET_PROGRESS_DECODER,
        payload: {decoder: decoder}
    };
};            
             
export const setPresetInProgessOutput = (output) => {
     return {
        type: SET_PRESET_PROGRESS_OUTPUT,
        payload: {output: output}
    };
};            
 
export const commitPresetInProgess = () => {
     return {
        type: COMMIT_PRESET_PROGRESS,
        payload: {}
    };
};

export const flushPresetInProgess = () => {
     return {
        type: FLUSH_PRESET_PROGRESS,
        payload: {}
    };
};




