<template>
	<Page>
		<ActionBar "Chart View" />
		<GridLayout columns="*, *, *, *, *, *", rows="auto, *, auto">
			<Button text="play" @tap="start()" row="0" col="0" colSpan="2" />
			<Button text="pause" @tap="stop()" row="0" col="2" colSpan="2" />
			<Button text="settings" row="0" col="4" colSpan="2" />
			<RadCartesianChart allowAnimations="false" height=500 row="1" col="0" colSpan="6">
				<LineSeries v-tkCartesianSeries :items="data" categoryProperty="X" valueProperty="Y"></LineSeries>
				<LinearAxis v-tkCartesianVerticalAxis ref="YAxis" maximum=60 horizontalLocation="Left" allowPan="true" allowZoom="true"></LinearAxis>
				<LinearAxis v-tkCartesianHorizontalAxis ref="XAxis" maximum=10 allowPan="true" allowZoom="true"></LinearAxis>
			</RadCartesianChart>
			<Button text="trigger" @tap="trigger()" row="2" col="0" colSpan="6" />
		</GridLayout>
	</Page>
</template>

<script lang="ts">
import * as dialogs from '@nativescript/core/ui/dialogs';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { LinearAxis, ChartAxisHorizontalLocation, ChartAxisVerticalLocation, LogarithmicAxis } from 'nativescript-ui-chart';
import { ObservableArray } from "@nativescript/core/data/observable-array";

enum Acceleration {
	Decelerating = -1,
	Constant = 0,
	Accelerating = 1
}

@Component
export default class ChartView extends Vue {
	time_scale: number = 1;  // Seconds
	cur_time: number = 0;
	cur_velocity: number = 0;
	data: ObservableArray<any> = new ObservableArray([]);
	private timer: ReturnType<typeof setTimeout>;
	private acceleration_state: Acceleration = Acceleration.Constant;
	private refresh_rate: number = 10;  // 2 Hz
	private acceleration_scale: number = 5 / this.refresh_rate;
	private acceleration_cache: Acceleration = Acceleration.Decelerating;

	x_window_size: number = 20;

	constructor() {
		super();
		let x: number[] = this.range(-1, 0, 0.05);
		let y: number[] = x;
		x.forEach((e,i) => {
			this.data.push({X:e, Y:0});
		});
	}

	range(start, end, step=1): number[] {
		let d: number = end - start;
		let n: number = d / step;
		return Array(n).fill(start).map((e,i) => e+i*step);
	}

	start() {
		let time_i: Date = new Date();
		let wait_time: number = 1000 / this.refresh_rate;
		this.timer = setTimeout(()=>{
			this.addPoint(time_i);
			this.start();
		}, wait_time);
	}

	stop() {
		clearTimeout(this.timer);
	}

	addPoint(time_i: Date): void {
		const time_f: Date = new Date();
		const delta_time: number = time_f.valueOf() - time_i.valueOf();
		const acceleration: number = this.acceleration_scale * this.acceleration_state;

		this.cur_velocity += acceleration;
		const x: number = this.cur_time += (delta_time * this.time_scale/1000);
		const y: number = this.cur_velocity;
		this.data.push({
			X: x,
			Y: y
		});
		this.XAxis.minimum = (x - (this.x_window_size / 2)) > 0 ? (x - this.x_window_size / 2) : 0;
		this.XAxis.maximum = (x + this.x_window_size / 2) > this.x_window_size ? (x + this.x_window_size / 2) : this.x_window_size;
	}

	trigger(): void {
		if (this.acceleration_state != Acceleration.Constant) {
			this.acceleration_cache = this.acceleration_state;
			this.acceleration_state = Acceleration.Constant;
		}
		else {
			this.acceleration_state = -1 * this.acceleration_cache;
		}
	}

	removePoint(): void {
		this.data.pop()
	}
	
	get XAxis(): LinearAxis {
		return (this.$refs.XAxis as any).nativeView;
	}

	get YAxis(): LinearAxis {
		return (this.$refs.YAxis as any).nativeView;
	}
}

</script>

<style lang="scss" scoped>
</style>
