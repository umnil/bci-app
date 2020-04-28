<template>
	<Page>
		<StackLayout>
			<Label class="instruction" :text="instruction" width="100%" height="100%"/>
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class Calibrate extends Vue {

	// Data
	instruction: string = "Please wait...";

	// Methods
	constructor() {
		super();
	}

	// onOpen(): void {
	//     Subscribe to the characteristic and begin displaying the value
	// }
}
</script>

<style lang="scss" scoped>
@import "../app";

Page {
	background: $orange;
}

.instruction {
	font-size: 36px;
	color: white;
	text-align: center;
}
</style>
