<template>
	<Page @loaded="startScan">
		<ActivityIndicator row="1" :busy="isBusy" />
		<ScrollView orientation="vertical">
			<StackLayout row="0" v-if="!isBusy">
				<StackLayout class="device-listing" v-for="(device, i) in cm.scannedDevices" :key="i" @tap="connect(device)">
					<Label :text="device.name" />
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
import connectionDelegate from '../../utils/ConnectionDelegate';
import BTHome from './Home.vue';

@Component
export default class BluetoothPairing extends Vue {

	// Members
	cm = connectionDelegate;
	isBusy: boolean = true;
	nav: any = (this as any).$navigateTo;

	// Methods
	async startScan(args: EventData): Promise<void> {
		const page: Page = args.object as Page;
		let result: boolean = await this.cm.scan();

		if(!result) {
			console.log("DANG");
		 	page.frame.goBack();	
		}
	}

	async connect(peripheral: any): Promise<void> {
		let connected: boolean = await this.cm.connect(peripheral);
		Frame.topmost().goBack();
	}

	// Watches
	@Watch("cm.scannedDevices")
	scanWatch() {
		if(this.cm.scannedDevices.length > 0 && !this.cm.isConnecting) this.isBusy = false;
	}

	@Watch("cm.isConnecting")
	connectingWatch() {
		if(this.cm.isConnecting) {
			this.isBusy = true;
		}
		else {
			this.isBusy = false;
		}
	}
}
</script>

<style lang="scss" scoped>

.device-listing {
	font-size: 20px;
	padding: 0px 30px;
	border-width: 2px 0px;
	border-bottom-color: gray;
}

.device-details {
	font-color: #444444;
	font-size: 12px;
}
</style>
