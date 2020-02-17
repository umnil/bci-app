<template>
	<StackLayout class="ns-dark">
		<StackLayout class="drawer-item" orientation="horizontal" v-for="(page, i) in pages" @tap="goTo(page.component)" :key="i">
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

@Component
export default class Drawer extends Vue {

	// Data
	bus: any = (this as any).$bus;

	pages: any[] = [
		{
			name: 'Bluetooth Settings',
			icon: String.fromCharCode(0xf294),
			component: BluetoothSettings
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
}
</script>

<style lang="scss" scoped>
@import "../app";

.drawer-item {
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
