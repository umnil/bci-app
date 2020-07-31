<template>
	<Page>
		<ActionBar id="SystemSettingsAction" title="System Settings">
			<StatusIndicator />
		</ActionBar>
		<StackLayout>
			<StackLayout v-show="!busy">
				<Label class="list-label" text="System Commands" />
				<StackLayout class="setting-list">
					<Button class="setting-item-last" id="ReloadDevices" text="Reload Devices" horizontalAlignment="left" @tap="reloadDevices"/>
				</StackLayout>
				<Label class="list-label" text="System Settings" />
				<GridLayout class="setting-list" rows="44" columns="*,20,20">
					<Label row="0" col="0" class="setting-item-last" id="reconnectAttempts" text="Reconnect Attempts" horizontalAlignment="left" @tap="editReconnectionAttemps" />
					<label row="0" col="1" v-model="reconnectAttempts" />
					<Label row="0" col="2" class="fa chevron" :text="String.fromCharCode(0xf054)" />
				</GridLayout>
			</StackLayout>
			<Label text="Please Wait..." v-show="busy" horizontalAlignment="center"/>
			<ActivityIndicator :busy="busy"></ActivityIndicator>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import * as appSettings from 'tns-core-modules/application-settings';
import { Vue, Component, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../utils/ConnectionDelegate';
import ItemSelector from './Editors/ItemSelector';

@Component
export default class SystemSettings extends Vue {

	// Attributes
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	private busy: boolean = false;
	private reconnectAttempts: number = appSettings.getNumber("reconnectAttempts", 5);
	private reconnectOptions: number[] = Array(11).fill(0).map((e, i)=>i);

	// Methods
	constructor() {
		super();
	}

	log: (message: any) => void = console.log.bind(console, "SystemSettings: ");

	async reloadDevices(): Promise<void> {
		this.log("Reload Devices");
		this.busy = true;
		await this.cd.writeSysCtrl("RELOAD_DEVICE");
		this.busy = false;
	}

	editReconnectionAttemps(): void {
		this.bus.ItemSelector = {
			'title': 'Reconnect Attempts',
			'list': this.reconnectOptions,
			'value': this.reconnectAttempts,
			'callback': (value) => {
				appSettings.setNumber("reconnectAttempts", value);
				this.reconnectAttempts = value;
				this.cd.reconnectAttempts = value;
			}
		};

		(this as any).$navigateTo(ItemSelector);
	}

	// Computed Properties
}
</script>

<style lang="scss">
@import "../app";

.setting-list {
	background: white;
	border-width: 1px;
	border-style: solid;
	border-color: $systemGray4;

}

.setting-list > * {
	width: 100%;
	text-align: left;
	padding: 22px 0px;
	border-bottom-style: solid;
	border-bottom-width: 1px;
	border-bottom-color: $systemGray4;
}

.setting-item-last {
	border: none;
}

.chevron {
	color: $systemGray;
}

Label, Button {
	margin: 0px 30px;
}

</style>
