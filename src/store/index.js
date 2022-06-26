import Vue from "vue";
import Vuex from "vuex";

var Cesium = require("../../node_modules/cesium/Source/Cesium.js");
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewer: null,
    roadDS:null
  },
  mutations: {
    setViewer(state) {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTIxMTVmYS1jZDIyLTQxZmQtOTcyYy0wZDAwZGZiOTA2ZjUiLCJpZCI6NzIwMzksImlhdCI6MTYzNjM3MDg5M30.ENhe-Zsp8SPmi71BziPAP2Ov8nqHZmVpQJUYImiXr0Y";
      state.viewer = new Cesium.Viewer("cesiumContainer", {
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
        maximumRenderTimeChange: Infinity,
      });
      state.viewer.cesiumWidget.creditContainer.style.display = "none"; //隐藏ceisum标识
    },
    load3DTiles(state) {
      //加载3dtiles模型
      var schoolTileset = new Cesium.Cesium3DTileset({
        url: "/api/tileset.json",
        maximumScreenSpaceError: 2,
        maximumNumberOfLoadedTiles: 100000,
      });

      schoolTileset.readyPromise.then((school) => {
        state.viewer.scene.primitives.add(school);
        var boundingSphere = school.boundingSphere;
        state.viewer.camera.viewBoundingSphere(
          boundingSphere,
          new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius)
        );
        state.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

        //调整模型高度
        var heightOffset = -10.0;
        var cartographic = Cesium.Cartographic.fromCartesian(
          boundingSphere.center
        );
        var surface = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        );
        //偏移后的坐标
        var offset = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          heightOffset
        );
        var translation = Cesium.Cartesian3.subtract(
          offset,
          surface,
          new Cesium.Cartesian3()
        );
        school.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
      });
    },
    addRoad(state, time) {//加入道路
      //先在视图中加入道路geojson数据
      let promise = Cesium.GeoJsonDataSource.load(
        "/geojson/roadsProj.geojson",
        {
          clampToGround: true,
        }
      );
      promise.then((dataSource) => {
        state.viewer.dataSources.add(dataSource);
        state.roadDS = dataSource;
        //判断time
        let attr = "";
        switch (time) {
          case "morning":
            attr = "morningjam";
            break;
          case "lunch":
            attr="dinlunjam";
            break;
          case "dinner":
            attr = "nightjam";
            break;
          case "usual":
            attr="usualjam";
            break;
        }
        //更改道路颜色
        let entities = dataSource.entities.values;
        entities.forEach((entity,index)=>{
          let jam = entity.properties[attr].valueOf();
          switch(jam){
            case 1:            
              entity.polyline.material = new Cesium.Color(	60/255.0,179/255.0,113/255.0);
              break;
            case 2:
              entity.polyline.material = new Cesium.Color(	255/255.0,140/255.0,0/255.0);
              break;
            case 3:
              entity.polyline.material = new Cesium.Color(1.0,0.0,0.0);
              break;
          }
        });
      });
    },
    destoryRoad(state){
      state.viewer.dataSources.remove(state.roadDS);
    }
  },
  actions: {},
  modules: {},
});
