import Vue from 'nativescript-vue';
import App from './components/App';
import RadSideDrawer from 'nativescript-ui-sidedrawer/vue';
import RadChart from 'nativescript-ui-chart/vue';
import StatusIndicator from './components/StatusIndicator';
import DeviceSettingButton from './components/DeviceSettings/Button';
import DeviceSettingSlider from './components/DeviceSettings/Slider';
import DeviceSettingListPicker from './components/DeviceSettings/ListPicker';

import { Fontawesome } from 'nativescript-fontawesome';
Fontawesome.init();

//Vue.registerElement('RadSideDrawer', () => require('nativescript-ui-sidedrawer').RadSideDrawer);
Vue.use(RadSideDrawer);
Vue.use(RadChart);
Vue.component('StatusIndicator', StatusIndicator);

Vue.component('DeviceSettingButton', DeviceSettingButton);
Vue.component('DeviceSettingSlider', DeviceSettingSlider);
Vue.component('DeviceSettingListPicker', DeviceSettingListPicker);


// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.prototype.$bus = new Vue();

new Vue({
  render: h => h('frame', [h(App)])
}).$start()
