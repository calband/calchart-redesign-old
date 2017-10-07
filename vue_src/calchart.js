import Vue from "vue";
import { directive as onClickOutside } from "vue-on-click-outside" 

import Calchart from "Calchart";
import router from "router";

import ContextMenu from "utils/ContextMenu";

Vue.component("context-menu", ContextMenu);

Vue.directive("on-click-outside", onClickOutside)

let App = Vue.extend(Calchart);
new App({
    el: "#app",
    router,
});
