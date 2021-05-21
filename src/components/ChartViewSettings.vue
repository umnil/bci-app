<template>
	<Page>
		<ActionBar title="Chart View Settings" />
		<GridLayout rows="auto, auto, auto, auto, auto, auto" columns="auto, *">
			<Label text="Acceleration" row="0" col="0" />
			<Label :text="acceleration" class="value" row="0" col="1" />
			<Slider v-model="acceleration" minValue="1" maxValue="10" row="1" col="0" colSpan="2"></Slider>

			<Label text="Window Width" row="2" col="0" />
			<Label :text="window_size" class="value" row="2" col="1" />
			<Slider v-model="window_size" minValue="5" maxValue="100" row="3" col="0" colSpan="2"></Slider>

			<Label text="Point Position" row="4" col="0" />
			<Label :text="window_percent" class="value" row="4" col="1" />
			<Slider v-model="window_percent" minValue="10" maxValue="90" row="5" col="0" colSpan="2"></Slider>
		</GridLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import ChartView from './ChartView.vue';

@Component
export default class ChartViewSettings extends Vue {
	@Prop() chartview: ChartView;

	get acceleration(): number {
		return this.chartview.acceleration_scale;
	}

	set acceleration(x: number) {
		x = Math.round(x);
		this.chartview.acceleration_scale = x;
	}

	get window_size(): number {
		return this.chartview.x_window_size;
	}

	set window_size(x: number) {
		x = Math.round(x);
		this.chartview.x_window_size = x;
	}

	get window_percent(): number {
		return this.chartview.window_percent * 100;
	}

	set window_percent(x: number) {
		x = Math.round(x) / 100;
		this.chartview.window_percent = x;
	}
}
</script>

<style lang="scss" scoped>
Label {
	font-size: 24pt;
	padding: 10px;
}

Slider {
	margin: 5px 80px;
}

.value {
	text-align: right;
}
</style>
