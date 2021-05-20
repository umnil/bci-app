<template>
	<Page>
		<ActionBar "Chart View" />
		<RadCartesianChart allowAnimations="false">
			<LineSeries v-tkCartesianSeries :items="data" categoryProperty="X" valueProperty="Y"></LineSeries>
			<LinearAxis v-tkCartesianVerticalAxis horizontalLocation="Left" allowPan="true" allowZoom="true"></LinearAxis>
			<LinearAxis v-tkCartesianHorizontalAxis allowPan="true" allowZoom="true"></LinearAxis>
		</RadCartesianChart>
		<Button text="HI" />
	</Page>
</template>

<script lang="ts">
import * as dialogs from '@nativescript/core/ui/dialogs';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { LinearAxis, ChartAxisHorizontalLocation, ChartAxisVerticalLocation, LogarithmicAxis } from 'nativescript-ui-chart';

@Component
export default class ChartView extends Vue {
	cur_x: number = 2;
	data: any[] = [];

	constructor() {
		super();
		let x: number[] = this.range(0, 5, 0.5);
		let y: number[] = x; // .map(i => Math.pow(i, 2));
		this.data.push({X:0, Y:0});
		this.data.push({X:1, Y:1});
		// this.start();
	}

	range(start, end, step=1): number[] {
		let d: number = end - start;
		let n: number = d / step;
		return Array(n).fill(start).map((e,i) => e+i*step);
	}

	start() {
		setTimeout(()=>{
			this.addPoint();
			this.start();
		}, 500);
	}

	addPoint(): void {
		let x: number = this.cur_x++;
		this.data.push({
			X: x,
			Y: x
		})
	}
}

</script>

<style lang="scss" scoped>
</style>
