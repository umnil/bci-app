<template>
	<Page>
	<StackLayout>
		<StackLayout class="status">
			<Label :text="getStatusText" />
			<StackLayout v-if="cm.isConnected">
				<Label :text="getUUID" />
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
	
	get status(): string {
		return this.cm.isConnected ? 'Connected' : 'Disconnected';
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
