import Vue from 'vue';
import VueContextMenu from 'vue-ctxmenu';

import App from 'App';
import FormsPlugin from 'forms';
import PopupPlugin from 'popups';
import initRouter from 'router';
import initStore from 'store';
import { ConstantsPlugin } from 'utils/vue';

Vue.use(ConstantsPlugin);
Vue.use(FormsPlugin);
Vue.use(PopupPlugin);
Vue.use(VueContextMenu);

let CalchartApp = Vue.extend(App);
new CalchartApp({
    el: '#app',
    router: initRouter(Vue),
    store: initStore(Vue),
});
