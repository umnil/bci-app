<template>
	<Page>
		<ActionBar title="Chart View Settings" />
		<GridLayout rows="auto, auto" columns="auto, *" horizontalAlignment="center">
			<Label text="Hello" row="0" col="0" />
			<Label text="World", row="0" col="1" />
		</GridLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';

@Component
export default class ChartViewSettings extends Vue {

}
</script>

<style lang="scss" scoped>
</style>
