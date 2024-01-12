import { ActionType } from "./actionTypes";

/* 
the reducer manages action on the global redux state. It takes in a current state(initialized using
the default below) and an action, which is a payload + action type.
The SET_PRESET action type is currently a no-op, and is not used anywhere in the app 
*/
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






