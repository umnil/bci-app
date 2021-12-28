import Vue from 'nativescript-vue';
import App from './components/App.vue';
import RadSideDrawer from 'nativescript-ui-sidedrawer/vue';
import StatusIndicator from './components/StatusIndicator.vue';
import DeviceSettingButton from './components/DeviceSettings/Button.vue';
import DeviceSettingSlider from './components/DeviceSettings/Slider.vue';
import DeviceSettingListPicker from './components/DeviceSettings/ListPicker.vue';

//Vue.registerElement('RadSideDrawer', () => require('nativescript-ui-sidedrawer').RadSideDrawer);
Vue.use(RadSideDrawer);
Vue.component('StatusIndicator', StatusIndicator);

Vue.component('DeviceSettingButton', DeviceSettingButton);
Vue.component('DeviceSettingSlider', DeviceSettingSlider);
Vue.component('DeviceSettingListPicker', DeviceSettingListPicker);


// Prints Vue logs when --env.production is *NOT* set while building
// Vue.config.silent = (TNS_ENV === 'production')

Vue.prototype.$bus = new Vue();

new Vue({
  render: h => h('frame', [h(App)])
}).$start()
