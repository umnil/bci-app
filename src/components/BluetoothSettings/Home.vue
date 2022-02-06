<template>
	<Page>
	<ActionBar title="Bluetooth Settings"></ActionBar>
	<StackLayout>
		<StackLayout class="status">
			<Label :text="getStatusText" />
			<StackLayout v-if="cd.isConnected">
				<Label :text="getPeripheralName" />
				<Label :text="getPeripheralUUID" />
				<Label :text="getPeripheralLinkState" />
			</StackLayout>
		</StackLayout>
		<StackLayout class="action-panel" horizontalAlignment="center">
			<Button @tap="pair" text="Pair Devices" />
			<Button @tap="disconnect" text="Disconnect" />
			<StackLayout v-if="hasSavedDevice">
				<Button @tap="reconnect" :text="reconnectText" />
			</StackLayout>
			<Button @tap="log" text="Log" />
		</StackLayout>
	</StackLayout>
	</Page>
</template>

<script lang="ts">
import * as appSettings from '@nativescript/core/application-settings';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import BluetoothLog from './Log';
import ConnectionDelegate from '../../utils/ConnectionDelegate';
import Pairing from './Pairing';

@Component
export default class BluetoothSettings extends Vue {

	// Members
	private nav: any = (this as any).$navigateTo;
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;

	// Methods
	constructor() {
		super();
	}

	pair(): void {
		this.nav(Pairing);
	}

	async disconnect(): Promise<void> {
		await this.cd.disconnect();
	}

	async reconnect(): Promise<void> {
		let selectedPeripheral = this.cd.status == "Connected" ?
			this.cd.selectedPeripheral :
			this.savedDevice;
		await this.disconnect();
		this.cd.connect(selectedPeripheral);
	}

	log(): void {
		this.nav(BluetoothLog);
	}

	// Computed
	get getStatusText(): string {
		return `Status: ${this.status}`;
	}

	get getPeripheralUUID(): string {
		return `UUID: ${this.cd.selectedPeripheral.UUID}`;
	}

	get getPeripheralName(): string {
		return `Device Name: ${this.cd.selectedPeripheral.name}`;
	}

	get getPeripheralLinkState(): string {
		return `Interface Status: ${this.cd.primaryServiceAvailableStatus}`;
	}
	
	get status(): string {
		return this.cd.status;
	}

	get savedDevice(): any {
		let potential: string = appSettings.getString("peripheral", "");
		if(potential == "") return;
		return JSON.parse(potential);
	}

	get savedDeviceName(): string {
		return this.savedDevice['name'];
	}

	get hasSavedDevice(): boolean {
		return this.savedDevice != null;
	}

	get recentDeviceName(): string {
		return this.cd.status == 'Connected' ? 
			this.cd.selectedPeripheral.name :
			this.savedDevice['name'];
	}

	get reconnectText(): string {
		return `Reconnect to ${this.recentDeviceName}`;
	}
}
</script>

<style lang="scss" scoped>

.status {
	border-width: 2px;
	border-color: black;
}

.action-panel {
	margin: 10px;
}
</style>
