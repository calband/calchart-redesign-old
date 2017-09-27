import Vue from "vue";

import Calchart from "Calchart.vue";
import router from "router.js";

let App = Vue.extend(Calchart);
new App({
    el: "#app",
    router,
});
