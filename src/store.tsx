import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

import { createStore } from 'redux';
import reducer from './reducer';
import storage from 'redux-persist/lib/storage'

/* 
initialize the persistence config for redux-persist
*/
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['presets', 'idgen'],
    blacklist: ['presetInProgress'],
};

/* 
boilerplate for managing persistence
*/
const persistedReducer = persistReducer(persistConfig, reducer);
export const store = createStore(persistedReducer);
export const persistor = persistStore(store);


