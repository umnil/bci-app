<template>
	<Page @loaded="startScan">
		<ActivityIndicator row="1" :busy="isBusy" />
		<StackLayout row="0" v-if="!isBusy">
			<Label text="loaded!" />
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { EventData } from "tns-core-modules/data/observable";
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

	// Watches
	@Watch("cm.scannedDevices")
	scanWatch() {
		console.log("NEW DEVICE!");
	}
}
</script>

<style lang="scss" scoped>
</style>
