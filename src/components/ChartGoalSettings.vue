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

	private showGoalV1: boolean = true;
	private showGoalH1: boolean = true;

	@Prop () chartView: ChartView;
}
</script>

<style lang="scss" scoped>
</style>
