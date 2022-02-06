import { DeviceDataService } from '../services/DeviceDataService';
import DeviceData from '../models/DeviceData';

export class DeviceDataController {
	service: DeviceDataService;
	deviceData: DeviceData = new DeviceData();

	/**
	 * constructor
	 * Creates a DeviceDataController that is responsible for maintaining the
	 * state of the data transfered using the DeviceDataService
	 * @param {Bus} bus - the application bus that holds global objects
	 */
	constructor(bus: Bus) {
		this.service = new DeviceDataService(bus.cd);
	}

	/**
	 * loadDeviceData
	 * Uses the DeviceDataService to retrieve device data for the rest of the
	 * applilcation to use
	 */
	async loadDeviceData(): Promise<void> {
		console.log("Loading data...");
		this.deviceData = await this.service.read();
		console.log(JSON.stringify(this.deviceData));
	}

	/**
	 * saveDeviceData
	 * Users the DeviceDataService to write data to the server
	 * @param {DeviceData} data - the data to write
	 */
	async saveDeviceData(data: DeviceData): Promise<void> {
		console.log("Saving Data...");
		return this.service.write(data);
	}

	/**
	 * saveDeviceSettingsCollection
	 * Convenience function to save only a portion of the device data
	 * @param {string} collectionName - the name of the collection of settings
	 * @param {DeviceSettingsCollection} settingCollection - a collection of settings to save
	 */
	async saveDeviceSettingsCollection(collectionName: string, settingCollection: DeviceSettingsCollection): Promise<void> {
		console.log("Saving device settings collection");
		this.deviceData[collectionName] = settingCollection;
		return this.saveDeviceData(this.deviceData);
	}

	/**
	 * saveDeviceSettings
	 * Convenience function for saving the settings of a specific device
	 * @param {string} collectioName - name of the collection the device bleongs to
	 * @param {string} deviceName - the name of the device to which the settings belong
	 * @param {DeviceSettings} deviceSettings - the device settings
	 */
	async saveDeviceSettings(collectionName: string, deviceName: string, deviceSettings: DeviceSettings): Promise<void> {
		console.log("Saving device settings");
		console.log(`collectionName: ${collectionName}`);
		console.log(`deviceName: ${deviceName}`);
		console.log(`deviceData: ${JSON.stringify(this.deviceData)}`);
		let updatedCollection: DeviceSettingsCollection = this.deviceData[collectionName];
		console.log(`updatedCollection: ${JSON.stringify(updatedCollection)}`);
		let deviceIndex: number | null = updatedCollection.devices.reduce((p: number | null, c: DeviceSettings, i: number) => c.device_name == deviceName ? i : p, null);
		if (deviceIndex == null) {
			console.error("Failed to get the device index number");
			return;
		}
		updatedCollection.devices[deviceIndex] = deviceSettings;
		return this.saveDeviceSettingsCollection(collectionName, updatedCollection);
	}
}
