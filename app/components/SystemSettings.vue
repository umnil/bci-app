<template>
	<Page>
		<ActionBar id="SystemSettingsAction" title="System Settings" />
		<StackLayout>
			<ListView for="setting in settings" v-show="!busy">
				<v-template>
					<GridLayout class="settingItem" rows="auto" columns="*,*,*" width="100%">
						<Label col="0" colSpan="1" :text="setting.name" />
						<component col="1" colSpan="2" :is="settingComponent(setting)" horizontalAlignment="right" /> 
					</GridLayout>
				</v-template>
			</ListView>
			<Label text="Please Wait..." v-show="busy" horizontalAlignment="center"/>
			<ActivityIndicator :busy="busy"></ActivityIndicator>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import ConnectionDelegate from '../utils/ConnectionDelegate';

@Component
export default class SystemSettings extends Vue {

	// Attributes
	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate = this.bus.cd;
	private busy: boolean = false;

	settings = [
		{
			name: "ReloadDevices",
			displayName: "Reload Devices",
			type: "Button",
			method: this.reloadDevices.bind(this)
		}
	];

	elemActionMap = {
		"Button": "tap"
	};

	elemMethodMap = {
		"Button": "buttonPush($event)"
	};

	// Methods

	constructor() {
		super();
		this.bus.DeviceSettings = this;
	}

	log: (message: any) => void = console.log.bind(console, "SystemSettings: ");

	getSettingByName(settingName: string): any {
		let potential_setting: any[] = this.settings.filter(e => e.name == settingName);
		if(potential_setting.length < 1) return null;

		return potential_setting[0];
	}

	async reloadDevices(): Promise<void> {
		this.log("Reload Devices");
		this.busy = true;
		await this.cd.writeSysCtrl("RELOAD_DEVICE");
		this.busy = false;
	}

	actionValue(setting): string {
		let action: string = this.elemActionMap[setting.type];
		let method: string = this.elemMethodMap[setting.type];
		return `@${action}=${method}`;
	}

	buttonPush(args): void {
		let input: any = args.object;
		let settingName: string = input.id;
		let settingType: string = this.getSettingByName(settingName).type;
		let setting: any = this.getSettingByName(settingName);
		setting.method();
	}

	// Computed Properties
	get settingComponent(): any {
		return (setting) => {
			let component = {
				template: `<${setting.type} id="${setting.name}" col="1" colSpan="2" text="${setting.displayName}" ${this.actionValue(setting)} />`,
				data: () => ({
					buttonPush: this.buttonPush.bind(this)
				})
			};
			this.log(`Template: ${component.template}`);
			return component;
		};
	}
}
</script>

<style lang="scss">
@import "../app";

.settingItem {
	margin: 10px 10px 10px 10px;
	padding: 0px 30px;
}

</style>
