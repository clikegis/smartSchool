<template>
  <div id="homePage">
    <v-app>
      <!--  页头    -->
      <v-app-bar app color="primary" dark>
        <HeadBox></HeadBox>
      </v-app-bar>

      <!--  主体    -->
      <v-main>
        <!--   地图     -->
        <div class="mapContainer">
          <Map></Map>
        </div>

        <!--   系统工具栏     -->
        <ToolBar> </ToolBar>

        <!--   天气容器     -->
        <div class="WeatherContainer">
          <CugWeatherDialog></CugWeatherDialog>
        </div>

        <!-- 道路拥挤度容器 -->
        <transition name="timeChangeContainerAni">
          <div class="timeChangeContainer" v-if="currentFun == 'road'">
            <TimeChange></TimeChange>
          </div>
        </transition>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import Map from "../../components/Map";
import HeadBox from "../../components/HeadBox";
import ToolBar from "../../components/ToolBar";
import CugWeatherDialog from "../../components/Weather/CugWeatherDialog";
import TimeChange from "../../components/RealTimeSchool/TimeChange.vue";
import { mapMutations } from 'vuex';
export default {
  name: "Home",
  data() {
    return {
      currentFun: "",
    };
  },
  components: {
    CugWeatherDialog,
    ToolBar,
    HeadBox,
    Map,
    TimeChange,
  },
  created() {
    this.$bus.$on("homeEvent", (currentFun) => {
      if (this.currentFun == currentFun) {
        //退出相应的功能
        this.destoryPrevious();
        return;
      }
      switch (currentFun) {
        case "road":
          //退出之前的功能
          //....
          this.currentFun = currentFun;
          //地图修改
          this.addRoad("morning");
          break;
        default:
          break;
      }
    });
  },
  methods:{
    ...mapMutations(["addRoad","destoryRoad"]),
    destoryPrevious(){
      switch (this.currentFun){
        case "road":
          this.destoryRoad();
          this.currentFun = "";
          break;
        default:
          break;
      }
    }
  }
};
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
.WeatherContainer {
  position: absolute;
  top: 0;
  right: 0;
}

/* 时间切换位置 */
.timeChangeContainer {
  position: absolute;
  right: 3vw;
  top: 5vh;
}

.timeChangeContainerAni-enter,
.timeChangeContainerAni-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

.timeChangeContainerAni-enter-active {
  transition: all 1s;
}

.timeChangeContainerAni-leave-active {
  transition: all 0.5s;
}

.timeChangeContainerAni-enter-to {
  opacity: 1;
}
</style>
