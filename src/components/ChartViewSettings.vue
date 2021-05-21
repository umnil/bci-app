<template>
	<Page>
		<ActionBar title="Chart View Settings" />
		<GridLayout rows="auto, auto" columns="auto, *">
			<Label text="Acceleration" row="0" col="0" />
			<Label :text="acceleration" class="value" row="0" col="1" />
			<Slider v-model="acceleration" minValue="1" maxValue="10" row="1" col="0" colSpan="2"></Slider>
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
