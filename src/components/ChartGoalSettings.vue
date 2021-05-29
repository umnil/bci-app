<template>
	<Page>
		<ActionBar title="Chart Goals" />
		<StackLayout>
			<Label text="Vertical Goal 1" />
			<GridLayout columns="*,*" rows="auto,auto">
				<Label text="Visibility" row="0" col="0"/>
				<Switch v-model="showGoalV1" row="0" col="1" />
			</GridLayout>

			<Label text="Horizontal Goal 1" />
			<GridLayout columns="*, *" rows="auto,auto">
				<Label text="Visibility" row="0" col="0" />
				<Switch v-model="showGoalH1" row="0" col="1" />
			</GridLayout>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import ChartView from './ChartView.vue';

@Component
export default class ChartGoalSettings extends Vue {

	private showGoalH1: boolean = true;

	@Prop () chartView: ChartView;

	get showGoalV1(): boolean {
		return this.chartView.isLineVisible("GoalV1");
	}

	set showGoalV1(visibility: boolean) {
		console.log(`Setting visibility: ${visibility}`);
		this.chartView.toggleLine("GoalV1", visibility);
	}
}
</script>

<style lang="scss" scoped>
</style>
