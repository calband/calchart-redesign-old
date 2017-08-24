import Vue from "vue"
import App from "home/App.vue"
import store from "home/store.js"

new Vue({
  el: "#content",
  store,
  render: h => h(App),
});
