export default class DeviceData {
	inputdevices: DeviceSettingsCollection;
	outputdevices: DeviceSettingsCollection;

	constructor() {
		this.inputdevices = ({} as DeviceSettingsCollection);
		this.outputdevices = ({} as DeviceSettingsCollection);
	}
}
