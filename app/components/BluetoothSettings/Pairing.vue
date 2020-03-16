<template>
	<Page @loaded="startScan">
		<ActionBar title="Bluetooth Pairing"></ActionBar>
		<ActivityIndicator row="1" :busy="isScanning" />
		<ScrollView orientation="vertical" width="100%">
			<StackLayout row="0" width="100%">
				<StackLayout class="device-listing" v-for="(device, i) in cm.scannedDevices" :key="i" @tap="connect(device)">
					<StackLayout orientation="horizontal" width="100%">
						<Label :text="device.name" />
						<ActivityIndicator :class="displayProgress(device)" :busy="isConnecting" />
					</StackLayout>
					<Label class="device-details" :text="device.UUID" />
				</StackLayout>
			</StackLayout>
		</ScrollView>
	</Page>
</template>

<script lang="ts">
import { EventData } from "tns-core-modules/data/observable";
import { Frame } from "tns-core-modules/ui/frame";
import { Page } from "tns-core-modules/ui/page";
import { Vue, Component, Watch} from 'vue-property-decorator';
import { WorkerMessage } from '../../utils/workers/ble';
import BTHome from './Home.vue';

@Component
export default class BluetoothPairing extends Vue {

	// Members
	private bus: any = (this as any).$bus;
	private worker: any;
	nav: any = (this as any).$navigateTo;
	selected_device: any = null;

	// Methods
	constructor() {
		super();
		this.worker = this.bus.worker;
	}

	async startScan(args: EventData): Promise<void> {
		this.selected_device = null;
		const page: Page = args.object as Page;
		let workerMessage: WorkerMessage = {
			type: 'scan',
			data: null
		};
		this.worker.postMessage(workerMessage);
		// let result: boolean = await this.cm.scan();

		// if(!result) {
		//  	page.frame.goBack();	
		// }
	}

	async connect(peripheral: any): Promise<void> {
		if(this.cm.isConnecting) return;
		this.selected_device = peripheral.name;
		let connected: boolean = await this.cm.connect(peripheral);
		Frame.topmost().goBack();
	}

	// Computed
	get isScanning(): boolean {
		return this.cm.status == "Scanning";
	}

	get isConnecting(): boolean {
		return this.cm.isConnecting;
	}

	get displayProgress(): any {
		return device => ({
			"activity-icon": true,
			"invisible": device.name != this.selected_device
		});
	}
}
</script>

<style lang="scss" scoped>

.device-listing {
	font-size: 20px;
	padding: 20px;
	border-width: 2px 0px;
	border-bottom-color: gray;
}

.device-details {
	font-color: #444444;
	font-size: 12px;
}

.invisible {
	opacity: 0.0;
}

.activity-icon {
	width: 100%;
	text-align: right;
}
</style>
