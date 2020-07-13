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
			<StackLayout v-if="cd.isConnected">
				<Button @tap="reconnect" text="Reconnect" />
			</StackLayout>
		</StackLayout>
	</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../../utils/ConnectionDelegate';
import Pairing from './Pairing';

@Component
export default class BluetoothSettings extends Vue {

	// Members
	private nav: any = (this as any).$navigateTo;
	private bus: any = (this as any).$bus;
	cd: ConnectionDelegate;

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
	}

	pair(): void {
		this.nav(Pairing);
	}

	async disconnect(): Promise<void> {
		await this.cd.disconnect();
	}

	reconnect(): void {
		this.cd.connect(this.cd.selectedPeripheral);
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
		return `Interface Status: ${this.cd.ecoglinkAvailableStatus}`;
	}
	
	get status(): string {
		return this.cd.status;
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
