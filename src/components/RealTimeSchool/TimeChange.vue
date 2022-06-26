<template>
  <div class="timeChange">
    <!-- 时间切换按钮组 -->
    <div class="timeBtns">
      <v-radio-group v-model="time" row class="radios" @change="timeChange">
        <v-radio value="morning" label="早晨" color="green"></v-radio>
        <v-radio value="lunch" label="中午" color="yellow"></v-radio>
        <v-radio value="dinner" label="夜间" color="black"></v-radio>
        <v-radio value="usual" label="日常" color="blue"></v-radio>
      </v-radio-group>
    </div>
    <!-- 路况标签 -->
    <div class="colorLabels">
      <div class="oneLabel">
        <div class="level">1</div>
        <div class="greenLabel label" style="background:green"></div>
      </div>
      <div class="oneLabel">
        <div class="level">2</div>
        <div class="yellowLabel label" style="background:yellow"></div>
      </div>
      <div class="oneLabel">
        <div class="level">3</div>
        <div class="blueLabel label" style="background:red"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations} from 'vuex'
export default {
  name: "SmartSchoolTimeChange",
  data() {
    return {
      time: "morning",
    };
  },

  mounted() {},

  methods: {
    ...mapMutations(["addRoad","destoryRoad"]),
    timeChange(time){
      this.destoryRoad();
      this.addRoad(time);
    }
  },
};
</script>

<style scoped>
.timeChange {
  width: 21.5vw;
  height: 35vh;
  z-index: 1;
  background-color: rgb(255,255,255,0.9);
  border-radius: 2%;
}
.radios {
  margin-left: 0.3vw;
}
.colorLabels {
  height: 30vh;
  width: 21.5vw;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.oneLabel {
  width: 21.5vw;
  height: 10vh;
  display: flex;
  justify-content: space-around;
}
.level{
  text-align: center;
  font-weight: bolder;
}
.label{
  width: 15vw;
  height: 3vh;
}
</style>