<template>
	<Page @loaded="onOpen" @navigatingFrom="stopCalibrating">
		<GridLayout class="mainlayout" columns="*" rows="*">
			<Label col="0" v-show="text" class="instruction" :text="instruction" />
			<Gif col="0" v-show="!text" class="motorimage" :src="motorImage" />
		</GridLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { keepAwake, allowSleepAgain } from 'nativescript-insomnia';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import DeviceSettings from './DeviceSettings.vue';
import { PromptController } from '../controllers/PromptController';

@Component
export default class Calibrate extends Vue {

	@Prop() deviceSettings: any;

	// Class Properties
	bus: any = (this as any).$bus;
	cd: ConnectionDelegate;
	pc: PromptController;
	text: boolean;
	motorImage: string;

	// Data
	instruction: string = "Please wait...";

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
		this.pc = this.bus.controllers.promptController;
		this.text = true;
		this.motorImage = "~/assets/images/GRASP.gif";
	}

	log: (message: any) => void = console.log.bind(console, "Calibrate: ");

	onOpen(): void {
		// this.cd.calibrationSubscribe(this.recvCalibrationUpdate.bind(this));
		keepAwake().then(() => {this.log("Keep Awake");});
		this.pc.subscribe();
	}

	stopCalibrating(): void {
		allowSleepAgain().then(() => {this.log("Sleep again");});
		this.bus.DeviceSettings.stopCalibrating();
	}

	/**
	 * isArmDecoder
	 * This is a temporary hard coding to allow for GIF motor imageries
	 * @returns {boolean} - whether the Arm decoder is selected
	 */
	get isArmDecoder(): boolean {
		console.log("Getting arm decoder check")
		console.log(`Device settings: ${this.deviceSettings}`);
		const decoderSetting: boolean = this.deviceSettings.reduce((p, c) => {
			const objectKeys: any = Object.keys(c);

			// Object must have display name
			if (!objectKeys.includes("display_name")) return p;

			// that must be decoder
			if (c["display_name"] != "Decoder") return p;

			// Check the current name
			let decoder_names: string[] = c["items"];
			let index_value: string = c["value"];
			let index: number = parseInt(index_value);
			console.log(`decoder: ${decoder_names[index]}`);
			if (decoder_names[index] == "Arm Decoder") return true;

			return p;
		}, false);
		return decoderSetting;
	}

	/**
	 * handleMotorImagery
	 * This is a temporary functio to handle images displays
	 * @param {string} prompt
	 */
	handleMotorImagery(prompt: string) {
		if (prompt == "REST") {
			this.text = true;
			return;
		}

		if (this.isArmDecoder) {
			if (this.instruction != prompt) {
				this.text = false;
				this.motorImage = `~/assets/images/${this.pc.prompt.value}.gif`;
			}
		}
	}

	@Watch('pc.prompt.value')
	recvCalibrationUpdate(): void {
		if(this.pc.prompt.value == "END") {
			(this as any).$navigateBack();
			return;
		}

		this.handleMotorImagery(this.pc.prompt.value);
		this.log(`CALIBRATE END TIME: ${new Date().toJSON()}`);
		this.instruction = this.pc.prompt.value;
	}
}
</script>

<style lang="scss" scoped>
@import "../app";

Page {
	background: $orange;
}

.mainlayout {
	width: 100%;
	height: 100%;
}

.instruction {
	font-size: 36px;
	color: white;
	text-align: center;
	vertical-align: center;
	width: 100%;
	height: 100%;
}

.motorimage {
	vertical-align: center;
	text-align: center;
	width: 1080px;
	height: 1080px;
}
</style>
