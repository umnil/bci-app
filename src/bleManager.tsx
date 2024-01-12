import { BleManager } from 'react-native-ble-plx';

/* 
The Bluetooth Low Energery(BLE) controller library
required exactly one BleManager object to be instantiated
and used for all bluetooth operations, so it lives here
*/
export const manager = new BleManager();
