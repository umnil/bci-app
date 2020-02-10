<template>
    <Page @loaded="checkDevices">
        <ActionBar title="ecoglink BMI"/>
        <StackLayout>
            <Label :text="inputDeviceText" @tap="checkDevices" />
            <Label :text="outputDeviceText"/>
        </StackLayout>
    </Page>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { EventData  } from 'tns-core-modules/data/observable';
import connectionDelegate from '../utils/ConnectionDelegate';

@Component
export default class App extends Vue {

	inputDevice: string = '';
	outputDevice: string = '';
	
	// Computed Properties
	get inputDeviceText(): string {
		return `Input Device: ${this.inputDevice}`;
	}

	get outputDeviceText(): string {
		return `Output Device: ${this.outputDevice}`;
	}

	// Methods
	async checkDevices(args: EventData): Promise<void> {
		// ConnectionDelegate.inputDeviceManager.selectedDevice.name
		console.log('checking!');
		await connectionDelegate.checkBluetooth();
		return;
	}
};
</script>

<style scoped>
    ActionBar {
        background-color: #002c15;
        color: #ffffff;
    }

	Label {
		font-size: 20px;
		margin: 5px;
	}
</style>
