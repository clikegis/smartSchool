import Vue from "vue";
import Vuex from "vuex";
import h337 from "heatmap.js";
import axios from "axios";
import addActivityInViewer from "../utils/addActivityInViewer";

var Cesium = require("../../node_modules/cesium/Source/Cesium.js");
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    viewer: null,
    postUrl: {
      peopleUrl: "/json/people.json",
      activityUrl: "/json/activity.json",
    },
    roadDS: null,
    peopleEntity: null,
    activityEntities: [],
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
        infoBox:false
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
    addRoad(state, time) {
      //加入道路
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
            attr = "dinlunjam";
            break;
          case "dinner":
            attr = "nightjam";
            break;
          case "usual":
            attr = "usualjam";
            break;
        }
        //更改道路颜色
        let entities = dataSource.entities.values;
        entities.forEach((entity, index) => {
          let jam = entity.properties[attr].valueOf();
          switch (jam) {
            case 1:
              entity.polyline.material = new Cesium.Color(
                60 / 255.0,
                179 / 255.0,
                113 / 255.0
              );
              break;
            case 2:
              entity.polyline.material = new Cesium.Color(
                255 / 255.0,
                140 / 255.0,
                0 / 255.0
              );
              break;
            case 3:
              entity.polyline.material = new Cesium.Color(1.0, 0.0, 0.0);
              break;
          }
        });
      });
    },
    destoryRoad(state) {
      state.viewer.dataSources.remove(state.roadDS);
    },
    async addPeopleHeatMap(state, { time, dom }) {
      //人流量热力图
      let res = await axios.get(state.postUrl.peopleUrl);
      let people = res.data;
      /* 处理数据 */
      let dataRaw = [];
      people.forEach((person) => {
        if (person[`${time}Not`] == "0") return;
        dataRaw.push({
          lat: parseFloat(person.POINT_Y),
          lon: parseFloat(person.POINT_X),
          value: person[`${time}value`],
        });
      });
      /* 初始化热力图设置 */
      // 设置随机数据点数量
      let len = dataRaw.length;
      // 构建随机数据点
      let points = [];
      // 设置最大值
      let max = 300;
      // 设置热力图宽度和高度
      let width = 400;
      let height = 400;
      // 设置纬度最低点和最高点
      let latMin = 30.457;
      let latMax = 30.463;
      // 设置经度最低点和最高点
      let lonMin = 114.609;
      let lonMax = 114.618;
      // 将每个点的元素（属性？）转换为创建h337对象即热力图实例所需的数据格式
      for (let i = 0; i < len; i++) {
        // 传进原始数据
        let dataItem = dataRaw[i];
        let point = {
          // 将数据点经纬度等比例设置成矩形中的x y坐标 值为原始数据的值
          x: Math.floor(((dataItem.lat - latMin) / (latMax - latMin)) * width),
          y: Math.floor(((dataItem.lon - lonMin) / (lonMax - lonMin)) * height),
          value: dataItem.value,
        };
        // 比较设置的最大值和原始数据值大小 取两者间的最大值
        max = Math.max(max, dataItem.value);
        // 将转换好后的数据存入数组
        points.push(point);
      }
      // 创建热力图实例
      let heatMapInstance = h337.create({
        container: dom,
      });
      // 设置传入实例的数据
      let data = {
        max: max,
        data: points,
      };
      // 新建热力图实例并传入设置好的数据
      heatMapInstance.setData(data);
      /* 把热力图铺到地球上 */
      // 设置画布为生成的热力图
      let canvas = document.getElementsByClassName("heatmap-canvas");
      // 控制台输出画布数据
      // 添加热力图实例
      state.peopleEntity = state.viewer.entities.add({
        name: "heatmap",
        // 设置矩形
        rectangle: {
          // 指定矩形区域
          coordinates: Cesium.Rectangle.fromDegrees(
            lonMin,
            latMin,
            lonMax,
            latMax
          ),
          // 设置矩形图片为据透明度的热力图
          material: new Cesium.ImageMaterialProperty({
            image: canvas[0],
            transparent: true,
          }),
        },
      });
    },
    destoryPeopleEntity(state) {
      state.viewer.entities.remove(state.peopleEntity);
    },
    async addActivity(state,{bus}) {
      //在地图中增加标注点
      //获取活动数据
      let res = await axios.get(state.postUrl.activityUrl);
      let activities = res.data;

      //将活动添加到地图上
      for (let activity of activities) {
        let entity = addActivityInViewer(
          parseInt(activity.type),
          activity.name,
          activity.id,
          parseFloat(activity.longitude),
          parseFloat(activity.latitude)
        );
        state.activityEntities.push(entity);
        state.viewer.entities.add(entity);
      }

      //绑定鼠标左键事件
      let handler = new Cesium.ScreenSpaceEventHandler(state.viewer.canvas); //获取地图对象
      handler.setInputAction((event) => {
        //设置监听方法
        var pick = state.viewer.scene.pick(event.position);
        if (!pick || !(pick.id instanceof Cesium.Entity) || !state.viewer.entities.contains(pick.id)) {
          //询问是否添加事件
          var cartesian=state.viewer.camera.pickEllipsoid(event.position,state.viewer.scene.globe.ellipsoid);
          var cartographic=Cesium.Cartographic.fromCartesian(cartesian);
          var lat=Cesium.Math.toDegrees(cartographic.latitude);
          var lng=Cesium.Math.toDegrees(cartographic.longitude);
          bus.$emit('askDialogShow',{position:[lng,lat]});
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      handler.setInputAction((event) => {
        //设置监听方法
        var pick = state.viewer.scene.pick(event.position);
        if (Cesium.defined(pick) && pick.id instanceof Cesium.Entity && state.viewer.entities.contains(pick.id)) {
          //弹出是否删除事件
          bus.$emit('deleteDialogShow',{id:pick.id});
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    addSingleActivity(state,activity){//增加活动
      let entity = addActivityInViewer(
        parseInt(activity.type),
        activity.name,
        activity.id,
        parseFloat(activity.longitude),
        parseFloat(activity.latitude)
      );
      state.activityEntities.push(entity);
      state.viewer.entities.add(entity);
    },
    deleteSingleActivity(state,{entity,id}){
      state.activityEntities = state.activityEntities.filter((hasEntity)=>{
        if(hasEntity.id == id){
          return false;
        }else{
          return true;
        }
      });
      state.viewer.entities.remove(entity);
    },
    destoryActivity(state){
      //移除所有活动
      for(let entity of state.activityEntities){
        state.viewer.entities.remove(entity);
      }
      state.activityEntities = [];
    }
  },
  actions: {},
  modules: {},
});
