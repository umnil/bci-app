<template>
	<Page>
		<ActionBar "Chart View" />
		<RadCartesianChart>
			<LinearAxis v-tkCartesianHorizontalAxis></LinearAxis>
			<LinearAxis v-tkCartesianVerticalAxis></LinearAxis>
			<LineSeries v-tkCartesianSeries :items="data" categoryProperty="X", valueProperty="Y"></LineSeries>
		</RadCartesianChart>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';

@Component
export default class ChartView extends Vue {
	data: any[] = [
		{ X: 0, Y: 0 },
		{ X: 1, Y: 1 },
		{ X: 2, Y: 2 },
		{ X: 3, Y: 3 },
		{ X: 4, Y: 4 },
	];
}

</script>

<style lang="scss" scoped>
</style>
