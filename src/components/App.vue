<template>
	<Page @loaded="init">
	<ActionBar>
		<ActionItem>
			<Label :text="menuText" class="fa menu-icon" @tap="toggleDrawer" />
		</ActionItem>
		<Label text="ecoglink BMI" />
		<StatusIndicator name="main" />
	</ActionBar>
		<RadSideDrawer class="ns-dark" ref="drawer" drawerLocation="Left" :gesturesEnabled="gesturesEnabled">
			<StackLayout ~drawerContent class="ns-dark">
				<component :is="drawer" :ref="drawer"></component>
			</StackLayout>
			<StackLayout ~mainContent>
				<component :is="home" :ref="home"></component>
			</StackLayout>
		</RadSideDrawer>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { EventData  } from '@nativescript/core/data/observable';
import * as dialogs from '@nativescript/core/ui/dialogs';
import Drawer from './Drawer.vue';
import Home from './Home.vue';
import * as appSettings from '@nativescript/core/application-settings';
import ConnectionDelegate from "../utils/ConnectionDelegate";
import { BLEStatusChecker } from "../utils/BLEStatusChecker";

@Component
export default class App extends Vue {

	// Members
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = new ConnectionDelegate();
	private sc: BLEStatusChecker = new BLEStatusChecker(this.cd);
	private initialized: boolean = false;
	drawerIsOpen: boolean = false;
	gesturesEnabled: boolean = false;
	drawer = Drawer;
	home = Home;

	constructor() {
		super();
		this.bus.App = this;
		this.bus.cd = this.cd;
		this.bus.sc = this.sc;
	}
	
	// Methods
	async init(): Promise<void> {
		this.cd.checkBluetooth();
		if(this.initialized) return;

		await this.cd.init();
		let potentialDevice: string = appSettings.getString("peripheral", "");
		if( potentialDevice == "" ) return;
		let peripheral: any = JSON.parse(potentialDevice);

		if(this.cd.connectionStatus == "Connected") return;

		await this.cd.scan(1);
		await this.cd.connect(peripheral);
		this.initialized = true;
	}

	toggleDrawer(): void {
		this.drawerIsOpen = !this.drawerIsOpen;
	}

	// Computed Properties
	get drawerElement() {
		return (this.$refs && this.$refs.drawer) || null;
	}

	get menuText(): string {
		let bars: string = String.fromCharCode(0xf0c9);
		let x: string = String.fromCharCode(0xf00d);
		return this.drawerIsOpen ? x : bars
	}

	// Watches
	@Watch('drawerIsOpen')
	drawerWatch(): void {
		let de: any = this.drawerElement as any;
		let nv: any = de.nativeView as any;
		return this.drawerIsOpen ? nv.showDrawer() : nv.closeDrawer();
	}
};
</script>

<style lang="scss" scoped>
	@import '../app';

	.menu-icon {
		font-size: 28px;
	}
</style>
