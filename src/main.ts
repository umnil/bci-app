import Vue from 'nativescript-vue';
import App from './components/App';
import RadSideDrawer from 'nativescript-ui-sidedrawer/vue';
import StatusIndicator from './components/StatusIndicator';
import DeviceSettingButton from './components/DeviceSettings/Button';
import DeviceSettingSlider from './components/DeviceSettings/Slider';
import DeviceSettingListPicker from './components/DeviceSettings/ListPicker';
import ConnectionDelegate from "./utils/ConnectionDelegate";
import { DeviceDataController } from './controllers/DeviceDataController';
import { SystemStatusController } from './controllers/SystemStatusController';
import { PromptController } from './controllers/PromptController';

import { Fontawesome } from 'nativescript-fontawesome';
Fontawesome.init();

//Vue.registerElement('RadSideDrawer', () => require('nativescript-ui-sidedrawer').RadSideDrawer);
Vue.use(RadSideDrawer);
Vue.component('StatusIndicator', StatusIndicator);

Vue.component('DeviceSettingButton', DeviceSettingButton);
Vue.component('DeviceSettingSlider', DeviceSettingSlider);
Vue.component('DeviceSettingListPicker', DeviceSettingListPicker);


// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

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
