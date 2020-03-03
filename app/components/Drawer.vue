<template>
	<StackLayout>
		<StackLayout v-for="(page, i) in pages" :key="i" orientation="horizontal" class="drawer-item" v-show="page.show" @tap="goTo(page.component)">
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
import Inputs from './Inputs';
import Outputs from './Outputs';
import connectionDelegate from "../utils/ConnectionDelegate";

@Component
export default class Drawer extends Vue {

	// Data
	test: boolean = false;
	cd: any = connectionDelegate;
	bus: any = (this as any).$bus;
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
			component: Inputs,
			show: false
		},
		{
			name: 'Output Devices',
			icon: String.fromCharCode(0xf0ad),
			component: Outputs,
			show: false
		}
	];

	// Methods
	constructor() {
		super();
		this.bus.Drawer = this;
	}

	goTo(component: any) {
		(this as any).$navigateTo(component);
		this.bus.App.toggleDrawer();
	}

	setPageShow(pageName: string, show: boolean): void {
		let potentialPage: any[] = this.pages.filter(page => page.name == pageName);
		if(potentialPage.length == 0) return;
		let page: any = potentialPage[0];
		page.show = show;
	}

	@Watch("cd.isNotifying")
	updatePages() {
		if(this.cd.isNotifying) {
			this.setPageShow('Input Devices', true);
			this.setPageShow('Output Devices', true);
		}
		else {
			this.setPageShow('Input Devices', false);
			this.setPageShow('Output Devices', false);
		}
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
