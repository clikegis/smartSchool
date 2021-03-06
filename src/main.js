import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "../node_modules/cesium/Build/Cesium/Widgets/widgets.css";
import vuetify from './plugins/vuetify'
import './utils/drag.js';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  beforeCreate(){
    Vue.prototype.$bus = this;
  },
  render: h => h(App)
}).$mount('#app')
