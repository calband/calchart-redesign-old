import Vue from "vue";
import { directive as onClickOutside } from 'vue-on-click-outside' 

import Calchart from "Calchart.vue";
import router from "router.js";

import ContextMenu from "utils/ContextMenu.vue";

Vue.component("context-menu", ContextMenu);

Vue.directive('on-click-outside', onClickOutside)

let App = Vue.extend(Calchart);
new App({
    el: "#app",
    router,
});
