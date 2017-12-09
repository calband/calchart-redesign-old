import Vue from 'vue';
import VueContextMenu from 'vue-ctxmenu';

import App from 'App';
import FormsPlugin from 'forms';
import router from 'router';
import store from 'store';
import { ConstantsPlugin } from 'utils/vue';

Vue.use(ConstantsPlugin);
Vue.use(FormsPlugin);
Vue.use(VueContextMenu);

let CalchartApp = Vue.extend(App);
new CalchartApp({
    el: '#app',
    router,
    store,
});
