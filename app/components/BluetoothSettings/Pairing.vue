<template>
	<Page @loaded="startScan">
		<ActivityIndicator row="1" :busy="isBusy" />
		<StackLayout row="0" v-if="!isBusy">
			<Label text="loaded!" />
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import connectionDelegate from '../../utils/ConnectionDelegate';

@Component
export default class BluetoothPairing extends Vue {

	// Members
	isBusy: boolean = true;

	// Methods
	startScan(): void {

	}
}
</script>

<style lang="scss" scoped>
</style>
