<template>
	<Page>
	<ActionBar>
		<ActionItem>
			<Label :text="menuText" class="fa" @tap="toggleDrawer" />
		</ActionItem>
		<Label text="ecoglink BMI" />
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
import { EventData  } from 'tns-core-modules/data/observable';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import Drawer from './Drawer.vue';
import Home from './Home.vue';
import * as appSettings from 'tns-core-modules/application-settings';
import deviceSettings from '../utils/DeviceSettings';

@Component
export default class App extends Vue {

	constructor() {
		super();
		(this as any).$bus.App = this;
	}

	// Components
	drawer = Drawer;
	home = Home;

	// OLD Stuff -- Remove Later --
	drawerIsOpen: boolean = false;
	gesturesEnabled: boolean = false;
	
	// Computed Properties
	get drawerElement() {
		return (this.$refs && this.$refs.drawer) || null;
	}
	get menuText(): string {
		let bars: string = String.fromCharCode(0xf0c9);
		let x: string = String.fromCharCode(0xf00d);
		return this.drawerIsOpen ? x : bars
	}

	// Methods
	toggleDrawer(): void {
		this.drawerIsOpen = !this.drawerIsOpen;
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
</style>
