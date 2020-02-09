<template>
    <Page @loaded="checkDevices">
        <ActionBar title="ecoglink BMI"/>
        <StackLayout>
            <Label class="message" :text="inputDeviceText" col="0" row="0"/>
            <Label class="message" :text="outputDeviceText" col="0" row="0"/>
        </StackLayout>
    </Page>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { EventData  } from 'tns-core-modules/data/observable';

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
	checkDevices(args: EventData) {
		console.log("Page Loaded");
	}
};
</script>

<style scoped>
    ActionBar {
        background-color: #002c15;
        color: #ffffff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
    }
</style>
