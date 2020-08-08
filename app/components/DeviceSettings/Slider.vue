<template>
	<GridLayout :rows="nRows" columns="*, auto">
		<Label row="0" col="0" class="setting-item-label" :text="setting.display_name" @tap="toggle" />
		<Label row="0" col="1" :text="setting.value" @tap="toggle" />
		<Slider width="80%" v-if="show" row="1" col="0" colSpan="2" v-model="setting.value" :minValue="setting.minValue" :maxValue="setting.maxValue" />
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
		let n_rows: number = 1;
		const row_height: number = 44;
		if(this.show) {
			n_rows = 2;
		}
		return Array(n_rows).fill(0).map(e=>`${row_height}`).join();
	}
}
</script>

<style lang="scss">
@import "../../app.scss";

</style>
