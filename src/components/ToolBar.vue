<template>
  <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
  >
    <v-list-item class="px-2">
      <v-list-item-avatar>
        <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
      </v-list-item-avatar>

      <v-list-item-title>John Leider</v-list-item-title>

      <v-btn
          icon
          @click.stop="mini = !mini"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
    </v-list-item>

    <v-divider></v-divider>

    <v-list>
      <v-list-group
          v-for="item in items"
          :key="item.title"
          no-action
      >
        <template v-slot:activator>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item
            v-for="subItem in item.subItems"
            :key="subItem.title"
            @click="handleTool(subItem)"
        >

          <v-list-item-content>
            <v-list-item-title>{{ subItem.title }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-icon>{{ subItem.icon }}</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import eventBus from "../utils/eventBus";
export default {
  name: "ToolBar",
  data() {
    return {
      drawer: true,
      items: [
        {
          title: '天气服务', icon: 'mdi-home-city',
          subItems: [
            {title: '实时天气', icon: 'mdi-account',id:'weather'},
          ]
        },
        {
          title: '校园建筑', icon: 'mdi-home-city',
          subItems: [
            {title: '建筑类别筛选', icon: 'mdi-account'},
            {title: '建筑信息交互查看', icon: 'mdi-home-city'},
            {title: '公共设施查询', icon: 'mdi-home-city'}
          ]
        },
        {
          title: '三维导航', icon: 'mdi-account',
          subItems: [
            {title: '最短路径导航', icon: 'mdi-account'},
            {title: '外卖配送路径规划', icon: 'mdi-home-city'}
          ]
        },
        {
          title: '监控融合', icon: 'mdi-account-group-outline',
          subItems: [
            {title: '监控位置查询', icon: 'mdi-account'},
            {title: '三维视频融合', icon: 'mdi-home-city'},
            {title: '监控参数优化', icon: 'mdi-home-city'}
          ]
        },
        {
          title: '人员信息', icon: 'mdi-account',
          subItems: [
            {title: '人员管理', icon: 'mdi-account-cog',id:'manage'},
            {title: '本科生来源', icon: 'mdi-account-arrow-left',id:'origin'},
            {title: '毕业生流向', icon: 'mdi-account-arrow-right',id:'flow'},
            {title: '导师信息', icon: 'mdi-account-school',id:'teacher'}
          ]
        },
        {
          title: '动态校园', icon: 'mdi-alarm-check',
          subItems: [
            {title: '道路拥挤程度', icon: 'mdi-car-back',id:'road'},
            {title: '人流量', icon: 'mdi-account-group',id:'people'},
            {title: '活动管理', icon: 'mdi-dance-ballroom',id:'activity'}
          ]
        },
      ],
      mini:true
    }
  },
  methods:{
    handleTool(subItem){
      switch (subItem.id) {
        case 'weather':{
          eventBus.$emit('makeWeatherShow')
          break;
        }
        default:
          this.$bus.$emit('homeEvent',subItem.id);
          break;
      }
    }
  }
}
</script>

<style scoped>

</style>
