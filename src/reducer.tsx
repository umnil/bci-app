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
    default:
        return state;
    }
    
}






