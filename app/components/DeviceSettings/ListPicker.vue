<template>
	<GridLayout :rows="nRows" columns="*, auto">
		<Label row="0" col="0" class="setting-item-label" :text="setting.display_name" @tap="toggle" />
		<Label row="0" col="1" :text="setting.items[setting.value]" @tap="toggle" />
		<ListPicker v-if="show" row="1" col="0" colSpan="2" v-model="setting.value" :items="setting.items"/>
	</GridLayout>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component
export default class DeviceSettingSlider extends Vue {

	// Properties
	@Prop() setting: any;

	// Members
	show: boolean = false;

	// Methods
	constructor() {
		super();
	}

	toggle(): void {
		this.show = !this.show;
	}

	// Computed Properties
	get nRows(): string {
		if(this.show) {
			return "44,132";
		}
		return "44"
	}
}
</script>

<style lang="scss">
@import "../../app.scss";

Slider {
	margin: 0px 30px;
}

GridLayout {
	hight: 44px;
}
</style>
