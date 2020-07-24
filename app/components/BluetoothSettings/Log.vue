<template>
	<Page>
		<ActionBar title="Bluetooth Log"></ActionBar>
		<StackLayout>
			<TextView editable="false" v-model="$data.cd.textlog" />
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../../utils/ConnectionDelegate';

@Component
export default class BluetoothLog extends Vue {
	
	// Members
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	private _log: string = "(none)";

	// Methods
	constructor() {
		super();
		this.cd = this.bus.cd;
	}

	log: (any)=>void = console.log.bind(console, "BluetoothLog: ");

	// Computed Properties
	get initialized(): boolean {
		return this._log == "(none)";
	}

	// Watched Properties
	@Watch("cd.textlog")
	updateLog(): void {
		this._log = this.cd.textlog;
	}
}
</script>

<style lang="scss">
</style>
