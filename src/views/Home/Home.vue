<template>
  <div id="homePage">
    <v-app>
      <!--  页头    -->
      <v-app-bar
          app
          color="primary"
          dark
      >
        <HeadBox></HeadBox>
      </v-app-bar>

     <!--  主体    -->
      <v-main>
        <!--   地图     -->
        <div class="mapContainer">
          <Map></Map>
        </div>

        <!--   系统工具栏     -->
        <ToolBar
        >
        </ToolBar>

        <!--   天气容器     -->
        <div class="WeatherContainer">
          <CugWeatherDialog></CugWeatherDialog>
        </div>

      </v-main>

    </v-app>
  </div>
</template>

<script>
import Map from '../../components/Map';
import HeadBox from "../../components/HeadBox";
import ToolBar from "../../components/ToolBar";
import CugWeatherDialog from "../../components/Weather/CugWeatherDialog";
export default {
  name: "Home",
  components: {
    CugWeatherDialog,
    ToolBar,
    HeadBox,
    Map
  },

}
</script>

<style scoped>
.mapContainer {
  position: absolute;
  margin: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.WeatherContainer{
  position: absolute;
  top: 0;
  right: 0;
}


</style>
