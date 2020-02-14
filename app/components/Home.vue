<template>
	<StackLayout>
		<Label class="device-label" text="Selected Input Device" />
		<Label class="device-name" :text="inputDeviceName" style="text-align: center;" />
		<Label class="device-label" text="Selected OutputDevice" />
		<Label class="device-name" :text="outputDeviceName" style="text-align: center;" />
	</StackLayout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class Home extends Vue {

	// Data
	inputDeviceName: string = "None";
	outputDeviceName: string = "None";

	// Computed
	get inputDeviceText(): string {
		return `Input Device: ${this.inputDeviceName}`;
	}

	get outputDeviceText(): string {
		return `Output Device: ${this.outputDeviceName}`;
	}
}
</script>

<style lang="scss" scoped>
@import "../app";

.device-label {
	border-bottom: 5px solid black;
	margin: 20% 0px 0px 0px;
	text-align:center;
}

.device-name {
	background-color: $orange;
	border-color: $orange;
	border-radius: 20px;
	margin: 0px 20px;
}

</style>
