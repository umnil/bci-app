<template>
	<StackLayout>
		<StackLayout v-for="(page, i) in pages" :key="i" orientation="horizontal" class="drawer-item" v-show="page.show" @tap="goTo(page)">
			<Label class="fa drawer-icon" :text="page.icon" />
			<Label class="drawer-text" :text="page.name" />
		</StackLayout>
	</StackLayout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Mixins} from 'vue-property-decorator';
import App from './App';
import Home from './Home';
import BluetoothSettings from './BluetoothSettings/Home';
import DeviceList from './DeviceList';
import SystemSettings from './SystemSettings';
import ConnectionDelegate from "../utils/ConnectionDelegate";
import { SystemStatusController } from '../controllers/SystemStatusController';

@Component
export default class Drawer extends Vue {

	// Data
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate; 
	private ssc: SystemStatusController;
	pages: any[] = [
		{
			name: 'Bluetooth Settings',
			icon: String.fromCharCode(0xf294),
			component: BluetoothSettings,
			show: true
		},
		{
			name: 'Input Devices',
			icon: String.fromCharCode(0xf0ad),
			component: DeviceList,
			show: false
		},
		{
			name: 'Output Devices',
			icon: String.fromCharCode(0xf0ad),
			component: DeviceList,
			show: false
		},
		{
			name: 'System Settings',
			icon: String.fromCharCode(0xf1de),
			component: SystemSettings,
			show: false
		}
	];

	// Methods
	constructor() {
		super();
		this.bus.Drawer = this;
		this.cd = this.bus.cd;
		this.ssc = this.bus.controllers.systemStatusController;
	}

	goTo(page: any) {
		let isDevicePage: boolean = page.name.includes("Devices");
		let properties = isDevicePage ? {
			props: {
				listSet: page.name.split(' ')[0]
			}
		} : {};
		(this as any).$navigateTo(page.component, properties);
		this.bus.App.toggleDrawer();
	}

	setPageShow(pageName: string, show: boolean): void {
		let potentialPage: any[] = this.pages.filter(page => page.name == pageName);
		if(potentialPage.length == 0) return;
		let page: any = potentialPage[0];
		page.show = show;
	}

	updatePages() {
		console.log(`DRAWER.ssc.isNotifying: ${this.ssc.isNotifying}`);
		if(this.ssc.isNotifying && this.cd.connectionStatus == "Connected") {
			this.setPageShow('Input Devices', true);
			this.setPageShow('Output Devices', true);
			this.setPageShow('System Settings', true);
		}
		else {
			this.setPageShow('Input Devices', false);
			this.setPageShow('Output Devices', false);
			this.setPageShow('System Settings', false);
		}
	}

	@Watch("cd.status")
	updateOnStatus(): void{
		this.updatePages();
	}

	@Watch("cd.primaryServiceAvailableStatus")
	updateOnServiceStatus(): void {
		this.updatePages();
	}

	@Watch("ssc.isNotifying")
	updateOnNotifyStatus(): void {
		console.log("notifying changed");
		this.updatePages();
	}

}
</script>

<style lang="scss" scoped>
@import "../app";

.drawer-item {
	font-size: 20px;
	margin: 0px;
	padding: 50px 0px;
	border-bottom-width: 5px;
	border-bottom-color: gray;
}

.drawer-icon {
	margin: 0px 0px 0px 50px;
	padding: 0px 20px 0px 20px;
	background-color: $orange;
	border-radius: 20px;
}

.drawer-text {
	width: 100%;
	text-align: center;
}

</style>
