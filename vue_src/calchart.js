import Vue from "vue";

import Calchart from "Calchart.vue";
import router from "router.js";

import ContextMenu from "utils/ContextMenu.vue";

Vue.component("context-menu", ContextMenu);

let App = Vue.extend(Calchart);
new App({
    el: "#app",
    router,
});
