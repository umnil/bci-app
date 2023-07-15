import { ActionType } from "./actionTypes";

export default function reducer(state = { presets: [], idgen: 0, presetInProgress: {} }, action) {
    switch(action.type) {
        case ActionType.GET_PRESETS:
            return state;
        case ActionType.ADD_PRESET:
            return {...state, idgen: state.idgen+1, 
                    presets: [...state.presets, {...action.payload.preset, id: state.idgen}]};
        case ActionType.SET_PRESET:
            return state;
        case ActionType.DELETE_PRESET:
            return {...state, presets: state.presets.filter((preset) => (preset.id != action.payload.id))};
    default:
        return state;
    }
    
}






