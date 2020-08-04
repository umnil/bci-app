import Vue from 'nativescript-vue';
import App from './components/App';
import StatusIndicator from './components/StatusIndicator';
import DeviceSettingItem from './components/DeviceSettingItem';

import { Fontawesome } from 'nativescript-fontawesome';
Fontawesome.init();

Vue.registerElement('RadSideDrawer', () => require('nativescript-ui-sidedrawer').RadSideDrawer);
Vue.component('StatusIndicator', StatusIndicator);
Vue.component('DeviceSettingItem', DeviceSettingItem);


// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.prototype.$bus = new Vue();

new Vue({
  render: h => h('frame', [h(App)])
}).$start()
