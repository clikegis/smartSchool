<template>
  <div class="PeopleTimeChange">
    <!-- 时间切换按钮组 -->
    <div class="timeBtns">
      <v-radio-group v-model="time" row class="radios" @change="timeChange">
        <v-radio value="morning" label="早晨" color="green"></v-radio>
        <v-radio value="lunch" label="中午" color="yellow"></v-radio>
        <v-radio value="night" label="夜间" color="black"></v-radio>
      </v-radio-group>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
export default {
  name: "PeopleTimeChange",

  data() {
    return {
      time: "morning",
    };
  },

  mounted() {},

  methods: {
    timeChange(time) {
        this.$emit('peopleTimeChange',time)
    },
  },
};
</script>

<style scoped>
.PeopleTimeChange {
  background-color: rgb(255, 255, 255, 0.7);
  z-index: 1;
  border-radius: 2%;
  display: flex;
  justify-content: center;
  border: 3px solid border;
}
</style>