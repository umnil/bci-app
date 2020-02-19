<template>
	<Page>
	<StackLayout>
		<StackLayout class="status">
			<Label :text="getStatusText" />
			<StackLayout v-if="cm.isConnected">
				<Label :text="getDeviceName" />
				<Label :text="getUUID" />
				<Label :text="getLinkState" />
			</StackLayout>
		</StackLayout>
		<StackLayout class="action-panel" horizontalAlignment="left">
			<Button @tap="pair">Pair Devices</Button>
			<StackLayout v-if="cm.isConnected">
				<Button @tap="disconnect">Disconnect</Button>
			</StackLayout>
		</StackLayout>
	</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import connectionDelegate from '../../utils/ConnectionDelegate';
import Pairing from './Pairing';

@Component
export default class BluetoothSettings extends Vue {

	// Members
	nav: any = (this as any).$navigateTo;
	cm: any = connectionDelegate;

	// Methods
	pair(): void {
		this.nav(Pairing);
	}

	async disconnect(): Promise<void> {
		await this.cm.disconnect();
	}

	// Computed
	get getStatusText(): string {
		return `Status: ${this.status}`;
	}

	get getUUID(): string {
		return `UUID: ${this.cm.selectedDevice.UUID}`;
	}

	get getDeviceName(): string {
		return `Device Name: ${this.cm.selectedDevice.name}`;
	}

	get getLinkState(): string {
		return `Interface Status: ${this.cm.ecoglinkStatus}`;
	}
	
	get status(): string {
		return this.cm.status;
	}
}
</script>

<style lang="scss" scoped>

Button {
	margin: 10px;
}

.status {
	border-size: 2px;
	border-color: black;
}

.action-panel {
	border-size: 2px;
	border-color: black;
}
</style>
