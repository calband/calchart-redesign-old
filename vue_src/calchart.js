import Vue from "vue";
import { directive as onClickOutside } from "vue-on-click-outside";

import App from "App";
import router from "router";

import ContextMenu from "utils/ContextMenu";

Vue.component("context-menu", ContextMenu);

Vue.directive("on-click-outside", onClickOutside);

let CalchartApp = Vue.extend(App);
window.$vms.root = new CalchartApp({
    el: "#app",
    router,
});
