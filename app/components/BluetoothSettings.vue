<template>
	<Page>
	<StackLayout>
			<Label text="HI" />
	</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class BluetoothSettings extends Vue {
	// Data
	n: number = 0;
}
</script>

<style lang="scss" scoped>
</style>
