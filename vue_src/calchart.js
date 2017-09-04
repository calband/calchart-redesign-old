import Vue from "vue";

import Calchart from "Calchart.vue";
import router from "router.js";

new Vue({
    el: "#app",
    router,
    render: h => h(Calchart),
});
