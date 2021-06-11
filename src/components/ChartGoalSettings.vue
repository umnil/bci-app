<template>
	<Page>
		<ActionBar title="Chart Goals" />
		<ScrollView orientation="vertical">
			<StackLayout class="body">
				<Label class="setting-list-label" text="Vertical Goal 1" />
				<StackLayout class="setting-list">
					<GridLayout rows="44" columns="*,20,40">
						<Label class="setting-item-label" text="Visibility" row="0" col="0"/>
						<Switch class="setting-item-value" v-model="showGoalV1" row="0" col="1" />
					</GridLayout>
					<GridLayout rows="44" columns="*,40,60">
						<Label class="setting-item-label setting-item-last" text="Value" row="1" col="0" @tap="showV1Slider" />
						<Label class="setting-item-value" :text="curGoalV1value" row="1" col="1" />
						<Label class="fa chevron" row="1" col="2" :text="v1Chevron" />
					</GridLayout>
					<StackLayout v-show="v1ValueShow">
						<Slider class="lineProp" v-model="GoalV1value" minValue="5" :maxValue="vMax" />
					</StackLayout>
				</StackLayout>

				<Label class="setting-list-label" text="Horizontal Goal 1" />
				<StackLayout class="setting-list">
					<GridLayout rows="44" columns="*,20,40">
						<Label class="setting-item-label" text="Visibility" row="0" col="0" />
						<Switch class="setting-item-value" v-model="showGoalH1" row="0" col="1" />
					</GridLayout>
					<GridLayout rows="44" columns="*,40,60">
						<Label class="setting-item-label setting-item-last" text="Value" row="1" col="0" @tap="showH1Slider" />
						<Label class="setting-item-value" :text="curGoalH1value" row="1" col="1" />
						<Label class="fa chevron" row="1" col="2" :text="h1Chevron" />
					</GridLayout>
					<StackLayout v-show="h1ValueShow">
						<Slider class="lineProp" v-model="GoalH1value" minValue="5" :maxValue="vMax" />
					</StackLayout>
				</StackLayout>

				<Label class="setting-list-label" text="Vertical Goal 2" />
				<StackLayout class="setting-list">
					<GridLayout rows="44" columns="*,20,40">
						<Label class="setting-item-label" text="Visibility" row="0" col="0" />
						<Switch class="setting-item-value" v-model="showGoalV2" row="0" col="1" />
					</GridLayout>
					<GridLayout rows="44" columns="*,40,60">
						<Label class="setting-item-label setting-item-last" text="Value" row="1" col="0" @tap="showV2Slider" />
						<Label class="setting-item-value" :text="curGoalV2value" row="1" col="1" />
						<Label class="fa chevron" row="1" col="2" :text="v2Chevron" />
					</GridLayout>
					<StackLayout v-show="v2ValueShow">
						<Slider class="lineProp" v-model="GoalV2value" minValue="5" :maxValue="vMax" />
					</StackLayout>
				</StackLayout>
			</StackLayout>
		</ScrollView>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import ChartView from './ChartView.vue';

const up_code: number = 0xf077;
const down_code: number = 0xf078;

@Component
export default class ChartGoalSettings extends Vue {


	private vMax: number = 60;
	private curGoalV1value: number = this.GoalV1value;
	private curGoalH1value: number = this.GoalH1value;
	private curGoalV2value: number = this.GoalV2value;

	private v1ValueShow: boolean = false;
	private h1ValueShow: boolean = false;
	private v2ValueShow: boolean = false;

	@Prop () chartView: ChartView;

	// Vertical Goal #1
	get showGoalV1(): boolean {
		return this.chartView.isLineVisible("GoalV1");
	}

	set showGoalV1(visibility: boolean) {
		this.chartView.toggleLine("GoalV1", visibility);
	}

	get GoalV1value(): number {
		return this.chartView.getLineValue("GoalV1");
	}

	set GoalV1value(value: number) {
		value = Math.round(value);
		this.curGoalV1value = value;
		this.chartView.setLineValue("GoalV1", value, false);
	}

	get v1Chevron(): string {
		const selected_code: number = this.v1ValueShow ? up_code : down_code;
		const character: string = String.fromCharCode(selected_code)
		return character
	}

	showV1Slider() {
		this.v1ValueShow = !this.v1ValueShow;
	}

	// Horizontal Goal #1
	get showGoalH1(): boolean {
		return this.chartView.isLineVisible("GoalH1");
	}

	set showGoalH1(visibility: boolean) {
		this.chartView.toggleLine("GoalH1", visibility);
	}

	get GoalH1value(): number {
		return this.chartView.getLineValue("GoalH1");
	}

	set GoalH1value(value: number) {
		value = Math.round(value);
		this.curGoalH1value = value;
		this.chartView.setLineValue("GoalH1", value, true);
	}

	get h1Chevron(): string {
		const selected_code: number = this.h1ValueShow ? up_code : down_code;
		const character: string = String.fromCharCode(selected_code)
		return character
	}

	showH1Slider() {
		this.h1ValueShow = !this.h1ValueShow;
	}

	// Vertical Goal #2
	get showGoalV2(): boolean {
		return this.chartView.isLineVisible("GoalV2");
	}

	set showGoalV2(visibility: boolean) {
		this.chartView.toggleLine("GoalV2", visibility);
	}

	get GoalV2value(): number {
		return this.chartView.getLineValue("GoalV2");
	}

	set GoalV2value(value: number) {
		value = Math.round(value);
		this.curGoalV2value = value;
		this.chartView.setLineValue("GoalV2", value, false);
	}

	get v2Chevron(): string {
		const selected_code: number = this.v2ValueShow ? up_code : down_code;
		const character: string = String.fromCharCode(selected_code)
		return character
	}

	showV2Slider() {
		this.v2ValueShow = !this.v2ValueShow;
	}
}
</script>

<style lang="scss" scoped>
@import "../app.scss";

Slider {
	margin: 0px 80px;
}

.body {
	background: #CCCCCC;
}

.lineName {
	font-size: 12pt;
	margin: 80px 10px 10px;
}

.linePropSection {
	background: #FFFFFF;
	border-top: 1px solid black;
	border-bottom: 1px solid black;
	margin: 10px 10px;
}

.lineProp {
	font-size: 24pt;
	margin: 25px 80px;
}
</style>
