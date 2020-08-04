<template>
	<GridLayout rows="44" columns="*, auto, auto">
		<Label col="0" class="setting-item-label" :text="setting.display_name" />
		<Label col="1" class="setting-item-value" :text="setting.value" />
		<Label col="2" class="fa chevron" :text="String.fromCharCode(0xf054)" />
	</GridLayout>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component
export default class DeviceSettingItem extends Vue {

	// Properties
	@Prop() setting: any;

	// Members

	// Methods
	constructor() {
		super();
	}
}
</script>

<style lang="scss">
@import "../app.scss"
</style>
