import Vue from 'vue';
import VueContextMenu from 'vue-ctxmenu';
import { directive as onClickOutside } from 'vue-on-click-outside';
import Vuex from 'vuex';

import App from 'App';
import FormsPlugin from 'forms';
import router from 'router';
import store from 'store';
import { setRoot } from 'utils/vue';

Vue.use(FormsPlugin);
Vue.use(VueContextMenu);

Vue.directive('on-click-outside', onClickOutside);

let CalchartApp = Vue.extend(App);
let vm = new CalchartApp({
    el: '#app',
    router,
    store,
});
setRoot(vm);
