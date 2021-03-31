<template>
	<GridLayout rows="44" columns="*">
		<Button col="0" class="setting-item-label" :text="setting.display_name" @tap="toggle" />
	</GridLayout>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component
export default class DeviceSettingButton extends Vue {

	// Properties
	@Prop() setting: any;

	// Members
	private bus: any = (this as any).$bus;

	// Methods
	constructor() {
		super();
	}

	toggle(): void {
		this.setting.value = !this.setting.value;
	}

	@Watch("setting.value")
	valueWatch(): void {
		if(["calibrating", "assessingAccuracy"].indexOf(this.setting.name) != -1) {
			if(this.setting.value) {
				this.bus.DeviceSettings.startCalibration();
			}
		}
	}
}
</script>

<style lang="scss">
@import "../../app.scss"
</style>
