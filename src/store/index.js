import Vue from 'vue'
import Vuex from 'vuex'

var Cesium = require('../../node_modules/cesium/Source/Cesium.js');
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewer: null
  },
  mutations: {
    setViewer(state) {
      state.viewer = new Cesium.Viewer('cesiumContainer');
    }
  },
  actions: {
  },
  modules: {
  }
})
