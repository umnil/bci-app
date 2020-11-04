<template>
	<Page @navigatingFrom="save">
		<ActionBar :title="title" />
		<StackLayout>
			<ListPicker :items="list" v-model="data['value']" />
		</StackLayout>
	</Page>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component
export default class ItemSelector extends Vue {

	// Attributes
	private bus: any = (this as any).$bus;
	private data: any = this.bus.ItemSelector;
	private title: string = this.data['title'];
	private list: any[] = this.data['list'];
	private cb: (val: any)=>void = this.data['callback'];

	// Methods
	log: (message: any)=>void = console.log.bind(console, "Item Selector: ");

	save(): void {
		this.log(`Saving value: ${this.data['value']}`);
		this.cb(this.data['value']);
	}
}
</script>

<style lang="scss">
</style>
