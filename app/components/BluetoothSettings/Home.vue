<template>
	<Page>
	<StackLayout>
		<StackLayout class="status">
			<Label :text="getStatusText" />
		</StackLayout>
		<StackLayout class="action-panel" horizontalAlignment="left">
			<Button @tap="pair">Pair Devices</Button>
		</StackLayout>
	</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Pairing from './Pairing';

@Component
export default class BluetoothSettings extends Vue {

	// Members
	status: string = "disconnected";
	nav: any = (this as any).$navigateTo;

	// Methods
	pair(): void {
		this.nav(Pairing);
	}

	// Computed
	get getStatusText(): string {
		return `Status: ${this.status}`;
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
