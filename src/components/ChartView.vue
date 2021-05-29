<template>
	<Page @loaded="loaded">
		<ActionBar "Chart View" />
		<GridLayout columns="*, *, *, *, *, *", rows="auto, *, auto">
			<Button :text="toggle_icon" class="fa icon-row" @tap="toggle()" row="0" col="0" colSpan="3" />
			<Button :text="settings_icon" class="fa icon-row" @tap="toSettings()" row="0" col="4" colSpan="3" />
			<RadCartesianChart ref="chart" allowAnimations="false" height=500 row="1" col="0" colSpan="6">
				<LineSeries v-tkCartesianSeries :items="data" categoryProperty="X" valueProperty="Y"></LineSeries>
				<LinearAxis v-tkCartesianVerticalAxis ref="YAxis" minimum=-4 maximum=60 horizontalLocation="Left" allowPan="true" allowZoom="true"></LinearAxis>
				<LinearAxis v-tkCartesianHorizontalAxis ref="XAxis" maximum=10 allowPan="true" allowZoom="true"></LinearAxis>
			</RadCartesianChart>
			<Button text="trigger" @tap="trigger()" row="2" col="0" colSpan="3" />
			<Button :text="reset_icon" class="fa icon-row" @tap="reset()" row="2" col="3" colSpan="3" />
		</GridLayout>
	</Page>
</template>

<script lang="ts">
import * as dialogs from '@nativescript/core/ui/dialogs';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { LinearAxis, ChartAxisHorizontalLocation, ChartAxisVerticalLocation, LogarithmicAxis, RadCartesianChart, LineSeries} from 'nativescript-ui-chart';
import { ObservableArray } from "@nativescript/core/data/observable-array";
import ChartViewSettings from './ChartViewSettings.vue';

enum Acceleration {
	Decelerating = -1,
	Constant = 0,
	Accelerating = 1
}

@Component
export default class ChartView extends Vue {

	private play_icon: string = String.fromCharCode(0xf04b);
	private pause_icon: string = String.fromCharCode(0xf04c);
	private settings_icon: string = String.fromCharCode(0xf013);
	private reset_icon: string = String.fromCharCode(0xf01e);

	private time_scale: number = 1;  // Seconds
	private cur_time: number = 0;
	private cur_velocity: number = 0;
	private timer: ReturnType<typeof setTimeout>;
	private running: boolean = false;
	refresh_rate: number = 10;  // Hz

	acceleration_scale: number = 1;
	private acceleration_state: Acceleration = Acceleration.Constant;
	private acceleration_cache: Acceleration = Acceleration.Decelerating;

	private data: ObservableArray<any> = new ObservableArray([]);

	x_window_size: number = 20;
	window_percent: number = 0.5;
	private _loaded: boolean = false;

	// Goal Lines
	private GoalV1: LineSeries = this.createLine("GoalV1", false, 8);


	constructor() {
		super();
		let x: number[] = this.range(-1, 0, 0.05);
		let y: number[] = x;
		x.forEach((e,i) => {
			this.data.push({X:e, Y:0});
		});
	}

	loaded() {
		if (this._loaded) return;

		this.toggleLine("GoalV1", true);
		this._loaded = true;
	}

	range(start, end, step=1): number[] {
		let d: number = end - start;
		let n: number = d / step;
		return Array(n).fill(start).map((e,i) => e+i*step);
	}

	reset(): void {
		this.stop();
		this.data = new ObservableArray([]);
		this.cur_time = 0;
		this.cur_velocity = 0;
		this.acceleration_state = Acceleration.Constant;
		this.acceleration_cache = Acceleration.Decelerating;
		this.centerAxisView();
	}

	start() {
		this.running = true;
		let time_i: Date = new Date();
		let wait_time: number = 1000 / this.refresh_rate;
		this.timer = setTimeout(()=>{
			this.addPoint(time_i);
			this.start();
		}, wait_time);
	}

	stop() {
		this.running = false;
		clearTimeout(this.timer);
	}

	toggle(): void {
		this.running ? this.stop() : this.start();
	}

	addPoint(time_i: Date): void {
		// Time, acceleration, and dV calcuations
		const time_f: Date = new Date();
		const delta_time: number = time_f.valueOf() - time_i.valueOf();  // in milliseconds
		const delta_time_scaled: number = delta_time * this.time_scale / 1000;  // Convert to time scale
		const acceleration: number = this.acceleration_scale * this.acceleration_state;
		const delta_velocity: number = acceleration * delta_time_scaled;

		// Update our velocity
		this.cur_velocity += delta_velocity;
		if (this.cur_velocity < 0) {
			this.cur_velocity = 0;
			this.trigger();
		}
		this.cur_velocity = this.cur_velocity > 0 ? this.cur_velocity : 0;

		// Convert this to X, Y
		const x: number = this.cur_time += (delta_time * this.time_scale/1000);
		const y: number = this.cur_velocity;
		
		// Add the point
		this.data.push({
			X: x,
			Y: y
		});

		// Update the view
		this.centerAxisView();
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

	/**
	 * Center the end point to a fraction of the window view
	 *
	 * @param	number	percent		100% will place the cursor at the far right
	 * @returns void
	 */
	centerAxisView(): void {
		const percent: number = this.window_percent;
		const x: number = this.cur_time;
		const displacement_minimum: number = this.x_window_size * percent;
		const displacement_maximum: number = this.x_window_size * (1 - percent);
		const minimum: number = x - displacement_minimum;
		const maximum: number = x + displacement_maximum;

		// Ternary conditions are to ensure that we keep the initial window stable until
		// the line reaches `percent` of the window size
		this.XAxis.minimum = minimum > 0 ? minimum : 0;
		this.XAxis.maximum = maximum > this.x_window_size ? maximum : this.x_window_size;
	}

	/**
	 * Setup a straight line
	 * 
	 * @param	string	name		the ID of the line
	 * @param	boolean	horizontal	whether the line is horiztonal or vertical
	 * @param	number	value		the point on the x (for horizontal lines) or y (for vertical lines) axis
	 * @return	LineSeries
	 */
	createLine(name: string, horizontal: boolean, value: number): LineSeries {
		let line: LineSeries = new LineSeries();
		let kAxisName: string = horizontal ? "Y" : "X";
		let vAxisName: string = horizontal ? "X" : "Y";
		let lower: any = {};
		let higher: any = {};
		lower[kAxisName] = value;
		lower[vAxisName] = -1000;
		higher[kAxisName] = value;
		higher[vAxisName] = 1000;
		let data: ObservableArray<any> = new ObservableArray([
			lower,
			higher
		]);
		line.items = data;
		line.categoryProperty = "X";
		line.valueProperty = "Y";
		line.id = name;
		return line;
	}

	/**
	 * Determine whether the line is in the char series
	 *
	 * @param	string	lineNmae
	 * @returns	boolean
	 */
	isLineVisible(lineName: string): boolean {
		console.log(this.chart.series.length);
		return this.chart.series.reduce( (visibility, series, idx) => {
			console.log(`isLineVisible | idx: ${idx} | id: ${series.id}`);
			if (series.id == lineName) {
				visibility = true;
			}
			return visibility;
		}, false );
	}

	/**
	 * Toggle visibility for one of the goal lines
	 *
	 * @param	string	lineName
	 * @param	boolean	show
	 */
	toggleLine(lineName: string, show: boolean = null): void {
		if (show == null) {
			// Show will be determined by the opposite of the current value
			show = !this.isLineVisible(lineName);
		}
		
		if (show) {
			if (this.isLineVisible(lineName))
				return;
			this.chart.series.push(this[lineName]);
		}
		else {
			if (!this.isLineVisible(lineName))
				return;
			const seriesIndex: number = this.chart.series.reduce( (result, series, idx) => {
				if (series.id == lineName)
					result = idx;
				return result;
			}, -1 );
			this.chart.series.splice(seriesIndex, 1);
		}
	}

	toSettings(): void {
		let nav_properties = {
			props: {
				chartview: this
			}
		};
		this.$navigateTo(ChartViewSettings, nav_properties);
	}

	get chart(): RadCartesianChart {
		return (this.$refs.chart as any).nativeView;
	}

	get XAxis(): LinearAxis {
		return (this.$refs.XAxis as any).nativeView;
	}

	get YAxis(): LinearAxis {
		return (this.$refs.YAxis as any).nativeView;
	}

	get toggle_icon(): string {
		return this.running ? this.pause_icon : this.play_icon;
	}
}

</script>

<style lang="scss" scoped>
@import "../app.scss";
.icon-row {
	font-size: 28pt;
	padding: 10px 0px;
	color: $orange;
}
.hidden {
	display: none;
}
</style>
