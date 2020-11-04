<template>
	<Page @loaded="startScan">
		<ActionBar title="Bluetooth Pairing"></ActionBar>
		<ActivityIndicator row="1" :busy="isScanning" />
		<ScrollView orientation="vertical" width="100%">
			<StackLayout row="0" width="100%">
				<StackLayout class="peripheral-listing" v-for="(peripheral, i) in cd.scannedPeripherals" :key="i" @tap="connect(peripheral)">
					<StackLayout orientation="horizontal" width="100%">
						<Label :text="peripheral.name" />
						<ActivityIndicator :class="displayProgress(peripheral)" :busy="isConnecting" />
					</StackLayout>
					<Label class="peripheral-details" :text="peripheral.UUID" />
				</StackLayout>
			</StackLayout>
		</ScrollView>
	</Page>
</template>

<script lang="ts">
import { EventData } from "@nativescript/core/data/observable";
import { Frame } from "@nativescript/core/ui/frame";
import { Page } from "@nativescript/core/ui/page";
import { Vue, Component, Watch} from 'vue-property-decorator';
import ConnectionDelegate from '../../utils/ConnectionDelegate';
import BTHome from './Home.vue';

@Component
export default class BluetoothPairing extends Vue {

	// Members
	private bus: any = (this as any).$bus;
	private nav: any = (this as any).$navigateTo;
	cd: ConnectionDelegate;
	selected_peripheral: string = null;

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
	}

	async startScan(args: EventData): Promise<void> {
		this.selected_peripheral = null;
		const page: Page = args.object as Page;
		let result: boolean = await this.cd.scan();

		if(!result) {
		 	page.frame.goBack();	
		}
	}

	async connect(peripheral: any): Promise<void> {
		this.selected_peripheral = peripheral.UUID;
		let connected: boolean = await this.cd.connect(peripheral);
		if(connected) Frame.topmost().goBack();
	}

	// Computed
	get isScanning(): boolean {
		return this.cd.scanningStatus == "Scanning";
	}

	get isConnecting(): boolean {
		return this.cd.connectingStatus == "Connecting";
	}

	get displayProgress(): any {
		return peripheral => ({
			"activity-icon": true,
			"invisible": peripheral.UUID != this.selected_peripheral
		});
	}
}
</script>

<style lang="scss" scoped>

.peripheral-listing {
	font-size: 20px;
	padding: 20px;
	border-width: 2px 0px;
	border-bottom-color: gray;
}

.peripheral-details {
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
