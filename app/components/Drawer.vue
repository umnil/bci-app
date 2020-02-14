<template>
	<StackLayout>
		<Label v-for="(page, i) in pages" :text="page.name" @tap="goTo(page.component)" :key="i"/>
	</StackLayout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Mixins} from 'vue-property-decorator';
import App from './App';
import Home from './Home';
import BluetoothSettings from './BluetoothSettings';

@Component
export default class Drawer extends Vue {

	// Data
	bus: any = (this as any).$bus;

	pages: any[] = [
		{ name: 'Bluetooth Settings', component: BluetoothSettings }
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
</style>
