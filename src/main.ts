import Vue from 'nativescript-vue';
import App from './components/App.vue';
import RadSideDrawer from 'nativescript-ui-sidedrawer/vue';
import StatusIndicator from './components/StatusIndicator.vue';
import DeviceSettingButton from './components/DeviceSettings/Button.vue';
import DeviceSettingSlider from './components/DeviceSettings/Slider.vue';
import DeviceSettingListPicker from './components/DeviceSettings/ListPicker.vue';
import ConnectionDelegate from "./utils/ConnectionDelegate";
import { DeviceDataController } from './controllers/DeviceDataController';
import { SystemStatusController } from './controllers/SystemStatusController';
import { PromptController } from './controllers/PromptController';

require('nativescript-nodeify');

Vue.use(RadSideDrawer);
Vue.component('StatusIndicator', StatusIndicator);

Vue.component('DeviceSettingButton', DeviceSettingButton);
Vue.component('DeviceSettingSlider', DeviceSettingSlider);
Vue.component('DeviceSettingListPicker', DeviceSettingListPicker);

// Create the bus
Vue.prototype.$bus = new Vue();
Vue.prototype.$bus.cd = new ConnectionDelegate();
Vue.prototype.$bus.controllers = {
	"deviceDataController": new DeviceDataController(Vue.prototype.$bus),
	"systemStatusController": new SystemStatusController(Vue.prototype.$bus),
	"promptController": new PromptController(Vue.prototype.$bus)
};

new Vue({
  render: h => h('frame', [h(App)])
}).$start()
