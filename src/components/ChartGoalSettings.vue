<template>
	<Page>
		<ActionBar title="Chart Goals" />
		<StackLayout class="body">
			<Label text="Vertical Goal 1" class="lineName"/>
			<GridLayout class="linePropSection" columns="*,*" rows="auto,auto,auto">
				<Label class="lineProp" text="Visibility" row="0" col="0"/>
				<Switch class="lineProp" v-model="showGoalV1" row="0" col="1" />

				<Label class="lineProp" text="Value" row="1" col="0" />
				<Label class="lineProp" :text="curGoalV1value" row="1" col="1" horizontalAlignment="right"/>
				<Slider class="lineProp" v-model="GoalV1value" minValue="5" :maxValue="vMax" row="3" col="0" colSpan="2" />
			</GridLayout>

			<Label class="lineName" text="Horizontal Goal 1" />
			<GridLayout class="linePropSection" columns="*, *" rows="auto,auto,auto">
				<Label class="lineProp" text="Visibility" row="0" col="0" />
				<Switch class="lineProp" v-model="showGoalH1" row="0" col="1" />

				<Label class="lineProp" text="Value" row="1" col="0" />
				<Label class="lineProp" :text="curGoalH1value" row="1" col="1" horizontalAlignment="right" />
				<Slider class="lineProp" v-model="GoalH1value" minValue="5" :maxValue="vMax" row="3" col="0" cospan="2" />
			</GridLayout>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import ChartView from './ChartView.vue';

@Component
export default class ChartGoalSettings extends Vue {

	private vMax: number = 60;
	private curGoalV1value: number = this.GoalV1value;
	private curGoalH1value: number = this.GoalH1value;

	@Prop () chartView: ChartView;

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
}
</script>

<style lang="scss" scoped>

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
