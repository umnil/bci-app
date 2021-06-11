<template>
	<Page @loaded="loaded">
		<ActionBar "Chart View" />
		<GridLayout columns="*, *, *, *, *, *", rows="auto, *, auto">
			<Button :text="toggle_icon" class="fa icon-row" @tap="toggle()" row="0" col="0" colSpan="3" />
			<Button :text="settings_icon" class="fa icon-row" @tap="toSettings()" row="0" col="4" colSpan="3" />
			<RadCartesianChart ref="chart" allowAnimations="false" height=500 row="1" col="0" colSpan="6">
				<LineSeries v-tkCartesianSeries :items="data" categoryProperty="X" valueProperty="Y" strokeColor="MediumSeaGreen" strokeWidth=3></LineSeries>
				<LinearAxis v-tkCartesianVerticalAxis ref="YAxis" minimum=-4 maximum=60 horizontalLocation="Left" allowPan="true" allowZoom="true"></LinearAxis>
				<LinearAxis v-tkCartesianHorizontalAxis ref="XAxis" maximum=10 allowPan="true" allowZoom="true"></LinearAxis>
			</RadCartesianChart>
			<Button text="trigger" @tap="trigger()" row="2" col="0" colSpan="2" />
			<Button class="fa icon-row" :text="String.fromCharCode(0xf0c7)" @tap="save" row="2" col="2" colSpan="2" />
			<Button class="fa icon-row" :text="reset_icon" @tap="reset()" row="2" col="4" colSpan="2" />
		</GridLayout>
	</Page>
</template>

<script lang="ts">
import * as dialogs from '@nativescript/core/ui/dialogs';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { LinearAxis, ChartAxisHorizontalLocation, ChartAxisVerticalLocation, LogarithmicAxis, RadCartesianChart, LineSeries} from 'nativescript-ui-chart';
import { ObservableArray } from "@nativescript/core/data/observable-array";
import ConnectionDelegate from '../utils/ConnectionDelegate';
import ChartViewSettings from './ChartViewSettings.vue';

enum Acceleration {
	Decelerating = -1,
	Constant = 0,
	Accelerating = 1
}

@Component
export default class ChartView extends Vue {

	private bus: any = (this as any).$bus;
	private cd: ConnectionDelegate;

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

	acceleration_scale: number = 4;
	private acceleration_state: Acceleration = Acceleration.Constant;
	private acceleration_cache: Acceleration = Acceleration.Decelerating;

	private data: ObservableArray<any> = new ObservableArray([]);

	x_window_size: number = 20;
	window_percent: number = 0.5;
	private _loaded: boolean = false;

	// Goal Lines
	private GoalV1: LineSeries = this.createLine("GoalV1", false, 8);
	private GoalH1: LineSeries = this.createLine("GoalH1", true, 40);
	private GoalV2: LineSeries = this.createLine("GoalV2", false, 25);

	constructor() {
		super();
		this.cd = this.bus.cd;

		let x: number[] = this.range(-1, 0, 0.05);
		let y: number[] = x;
		x.forEach((e,i) => {
			this.data.push({X:e, Y:0});
		});
	}

	loaded() {
		if (this._loaded) return;
		this.toggleLine("GoalV1", true);
		this.toggleLine("GoalH1", true);
		this.toggleLine("GoalV2", true);
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
	 * Saves the current data by packaging the relevant information into an
	 * object and sending it over bluetooth for saving
	 */
	save(): void {
		const data: any[] = this.data.map((point)=>[point["X"], point["Y"]]);
		const target_names: string[] = ["GoalV1", "GoalH1", "GoalV2"];
		const target_data: any[] = target_names.map((target_name) => {
			return {
				name: target_name,
				visible: this.isLineVisible(target_name),
				value: this.getLineValue(target_name)
			};
		});
		const metadata: any = {
			acceleration: this.acceleration_scale,
			sampling_rate: this.refresh_rate,
			target_data: target_data
		};
		const save_data: any = {
			data: data,
			metadata: metadata
		};
		console.log(save_data);
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
	 * Create line data set
	 *
	 * @param	boolean	horizontal	whether the line is horizontal
	 * @param	number	value		the point along the constant axis
	 * @returns	ObservableArray
	 */
	createLineData(horizontal: boolean, value: number): ObservableArray<any> {
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
		return data;
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
		line.items = this.createLineData(horizontal, value);
		line.categoryProperty = "X";
		line.valueProperty = "Y";
		line.id = name;
		line.strokeWidth = 200;
		return line;
	}

	/**
	 * Get Line index
	 *
	 * @param	string	lineName	retrieve the line by id
	 * @returns	number
	 */
	getLineIndex(lineName: string): number {
		return this.chart.series.reduce( (result, series, idx) => {
			if (series.id == lineName)
				result = idx;
			return result;
		}, -1 );
	}

	/**
	 * Determine whether the line is horizontal or vertical
	 *
	 * @param	string	lineName
	 * @returns	boolean
	 */
	isLineHorizontal(lineName: string): boolean {
		const seriesIndex: number = this.getLineIndex(lineName);
		const series: LineSeries = seriesIndex == -1 ? this[lineName] : this.chart.series.getItem(seriesIndex);
		const data: ObservableArray<any> = series.items;
		const lower: any = data.getItem(0);
		const upper: any = data.getItem(1);
		return lower["Y"] == upper["Y"];
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
			const seriesIndex: number = this.getLineIndex(lineName);
			this.chart.series.splice(seriesIndex, 1);
		}
	}

	/**
	 * Set A lines value
	 *
	 * NOTE: the line must already have been created
	 *
	 * @param	string	lineName	the name of the line
	 * @param	number	value		the value along the constant axis the line sits
	 */
	setLineValue(lineName: string, value: number, horizontal: boolean = null) {
		const seriesIndex: number = this.getLineIndex(lineName);
		const _horizontal: boolean = horizontal == null ? this.isLineHorizontal(lineName) : horizontal;
		const series: LineSeries = seriesIndex == -1 ? this[lineName] : this.chart.series.getItem(seriesIndex);
		series.items = this.createLineData(_horizontal, value);
	}

	/**
	 * Get line value
	 *
	 * @param	string	lineNmae
	 * @returns	number
	 */
	getLineValue(lineName: string): number {
		console.log(`getLineValue | Getting line value for line ${lineName}`);
		const seriesIndex: number = this.getLineIndex(lineName);
		console.log(`getLineValue | seriesIndex = ${seriesIndex}`);
		const horizontal: boolean = this.isLineHorizontal(lineName);
		console.log(`getLineValue | horizontal = ${horizontal}`);
		const series: LineSeries = seriesIndex == -1 ? this[lineName] : this.chart.series.getItem(seriesIndex);
		console.log(`getLineValue | series = ${series}`);
		const data: ObservableArray<any> = series.items;
		const kAxis: string = horizontal ? "Y" : "X";
		const firstPoint: any = data.getItem(0);
		return firstPoint[kAxis];
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
.mainLine {
	stroke-width: 10;
}
</style>
