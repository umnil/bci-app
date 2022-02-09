import { Vue } from "vue-property-decorator";

declare module "vue-property-decorator" {
	interface Vue {
		$navigateTo(args, properties?: any);
		$navigateBack(options?:any, backstackEntry?: any = null);
		$showModal(model);
		$bus: any;
	}
}
