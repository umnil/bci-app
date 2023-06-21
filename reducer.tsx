import * as ActionTypes from "./actionTypes";

export default function reducer(state = { presets: [], idgen: 0, presetInProgress: {} }, action) {
    switch(action.type) {
        case ActionTypes.GET_PRESETS:
            return state;
        case ActionTypes.ADD_PRESET:
            return {...state, idgen: state.idgen+1, 
                    presets: [...state.presets, {...action.payload.preset, id: state.idgen}]};
        case ActionTypes.SET_PRESET:
            return state;
        case ActionTypes.DELETE_PRESET:
            return {...state, presets: state.presets.filter((preset) => (preset.id != action.payload.id))};
        case ActionTypes.SET_PRESET_PROGRESS_NAME:
            return {...state, presetInProgress: {...state.presetInProgress, name: action.payload.name}};
        case ActionTypes.SET_PRESET_PROGRESS_SERVER:
            return {...state, presetInProgress: {...state.presetInProgress, server: action.payload.server}};
        case ActionTypes.SET_PRESET_PROGRESS_INPUT:
            return {...state, presetInProgress: {...state.presetInProgress, input: action.payload.input}};
        case ActionTypes.SET_PRESET_PROGRESS_DECODER:
            return {...state, presetInProgress: {...state.presetInProgress, decoder: action.payload.decoder}};
        case ActionTypes.SET_PRESET_PROGRESS_OUTPUT:
            return {...state, presetInProgress: {...state.presetInProgress, output: action.payload.output}};
        case ActionTypes.COMMIT_PRESET_PROGRESS:
            return {...state, idgen: state.idgen+1, presets: [...state.presets, {...state.presetInProgress, id: state.idgen}], presetInProgress:{}};
        case ActionTypes.FLUSH_PRESET_PROGRESS:
            return {...state, presetInProgress:{}};
    default:
        return state;
    }
    
}






