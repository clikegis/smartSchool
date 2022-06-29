const Cesium = require("../../node_modules/cesium/Source/Cesium.js");

export default (type, name,id,longitude, latitude) => {
  let color;
  switch (type) {
    case 0:
      color = [1.0, 0.0, 0.0];
      break;
    case 1:
      color = [255.0 / 255.0, 128.0 / 255.0, 0.0];
      break;
    case 2:
      color = [0.0, 128.0 / 255.0, 255.0 / 255.0];
      break;
    case 3:
      color = [51.0 / 255.0, 255.0 / 255.0, 123.0 / 255.0];
      break;
  }
  let entity = new Cesium.Entity({
    id:id,
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude,20),
    point: {
      pixelSize: 20,
      color: new Cesium.Color(...color, 1.0),
      heightReference:Cesium.HeightReference.clampToGround
    },
    label: {
      text: name,
      font: "14pt Source Han Sans CN", //字体样式
      fillColor: Cesium.Color.WHITE, //字体颜色
      style: Cesium.LabelStyle.FILL, //label样式
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直位置
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT, //水平位置
      pixelOffset: new Cesium.Cartesian2(10, 0), //偏移
    },
  });
  return entity;
};
