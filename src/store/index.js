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
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTIxMTVmYS1jZDIyLTQxZmQtOTcyYy0wZDAwZGZiOTA2ZjUiLCJpZCI6NzIwMzksImlhdCI6MTYzNjM3MDg5M30.ENhe-Zsp8SPmi71BziPAP2Ov8nqHZmVpQJUYImiXr0Y'

      state.viewer = new Cesium.Viewer('cesiumContainer',{
        animation: false, // 隐藏动画控件
        baseLayerPicker: false, // 隐藏图层选择控件state
        fullscreenButton: false, // 隐藏全屏按钮
        vrButton: false, // 隐藏VR按钮，默认false
        geocoder: false, // 隐藏地名查找控件
        homeButton: false, // 隐藏Home按钮
        infoBox: true, // 隐藏点击要素之后显示的信息窗口
        sceneModePicker: false, // 隐藏场景模式选择控件
        selectionIndicator: true, // 显示实体对象选择框，默认true
        timeline: false, // 隐藏时间线控件
        navigationHelpButton: false, // 隐藏帮助按钮
        scene3DOnly: true, // 每个几何实例将只在3D中呈现，以节省GPU内存
        shouldAnimate: true, // 开启动画自动播放
        sceneMode: 3, // 初始场景模式 1：2D 2：2D循环 3：3D，默认3
        // 如场景中的元素没有随仿真时间变化，请考虑将设置maximumRenderTimeChange为较高的值，例如Infinity
        maximumRenderTimeChange: Infinity
      });
      state.viewer.cesiumWidget.creditContainer.style.display ='none';//隐藏ceisum标识

    }
  },
  actions: {
  },
  modules: {
  }
})
