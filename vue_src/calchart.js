import Vue from "vue";
import { directive as onClickOutside } from "vue-on-click-outside";
import VueFormGenerator from "vue-form-generator";

import App from "App";
import router from "router";

import ContextMenu from "utils/ContextMenu";

Vue.component("context-menu", ContextMenu);

Vue.directive("on-click-outside", onClickOutside);

Vue.use(VueFormGenerator);

let CalchartApp = Vue.extend(App);
new CalchartApp({
    el: "#app",
    router,
});
