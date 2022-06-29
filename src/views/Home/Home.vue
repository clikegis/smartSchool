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
        <ToolBar @log="formLogin = true" @showUserInfo="showUserInfo">
        </ToolBar>

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

        <!-- 人流量 -->
        <transition name="peopleTimeChangeContainerAni">
          <div class="peopleTimeChangeContainer" v-if="currentFun == 'people'">
            <PeopleTimeChange
              @peopleTimeChange="peopleTimeChange"
            ></PeopleTimeChange>
          </div>
        </transition>

        <div class="HeatMapLabelContainer" v-if="currentFun == 'people'">
          <HeatMapLabel></HeatMapLabel>
        </div>

        <!-- 活动对话框 -->
        <!-- 是否添加 -->
        <v-row justify="center">
          <v-dialog v-model="askActiyity" persistent max-width="290">
            <v-card>
              <v-card-title class="text-h5">
                需要在该位置添加活动吗?
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="askActiyity = false">
                  取消
                </v-btn>
                <v-btn color="green darken-1" text @click="addDialogShow()">
                  同意
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>

        <!-- 是否删除 -->
        <v-row justify="center">
          <v-dialog v-model="deleteActivity" persistent max-width="290">
            <v-card>
              <v-card-title class="text-h5"> 需要删除该活动吗? </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green darken-1"
                  text
                  @click="deleteActivity = false"
                >
                  取消
                </v-btn>
                <v-btn color="green darken-1" text @click="justDelete">
                  同意
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>

        <!-- 表单对话框 -->
        <v-row justify="center">
          <v-dialog v-model="formActivity" persistent max-width="600px">
            <v-card>
              <v-card-title>
                <span class="text-h5">增加活动</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="活动名称"
                        required
                        v-model="form.name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        v-model="form.type"
                        :items="[
                          '施工活动',
                          '娱乐活动',
                          '体育活动',
                          '讲座活动',
                        ]"
                        label="类型*"
                        required
                      ></v-select>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-menu
                        ref="menu"
                        v-model="startDateShow"
                        :close-on-content-click="false"
                        :return-value.sync="form.startDate"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.startDate"
                            label="开始日期"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="form.startDate"
                          no-title
                          scrollable
                        >
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            color="primary"
                            @click="startDateShow = false"
                          >
                            Cancel
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.menu.save(form.startDate)"
                          >
                            OK
                          </v-btn>
                        </v-date-picker>
                      </v-menu>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-menu
                        ref="menu2"
                        v-model="startTimeShow"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        :return-value.sync="form.startTime"
                        transition="scale-transition"
                        offset-y
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.startTime"
                            label="开始时间"
                            prepend-icon="mdi-clock-time-four-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-time-picker
                          v-if="startTimeShow"
                          v-model="form.startTime"
                          full-width
                          @click:minute="$refs.menu2.save(form.startTime)"
                        ></v-time-picker>
                      </v-menu>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-menu
                        ref="menu3"
                        v-model="endDateShow"
                        :close-on-content-click="false"
                        :return-value.sync="form.endDate"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.endDate"
                            label="结束日期"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="form.endDate"
                          no-title
                          scrollable
                        >
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            color="primary"
                            @click="endDateShow = false"
                          >
                            Cancel
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.menu3.save(form.endDate)"
                          >
                            OK
                          </v-btn>
                        </v-date-picker>
                      </v-menu>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-menu
                        ref="menu4"
                        v-model="endTimeShow"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        :return-value.sync="form.endTime"
                        transition="scale-transition"
                        offset-y
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.endTime"
                            label="结束时间"
                            prepend-icon="mdi-clock-time-four-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-time-picker
                          v-if="endTimeShow"
                          v-model="form.endTime"
                          full-width
                          @click:minute="$refs.menu4.save(form.endTime)"
                        ></v-time-picker>
                      </v-menu>
                    </v-col>

                    <v-col sm="6">
                      <v-text-field
                        label="经度"
                        v-model="form.longitude"
                        disabled
                      ></v-text-field>
                    </v-col>
                    <v-col sm="6">
                      <v-text-field
                        label="纬度"
                        v-model="form.latitude"
                        disabled
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="submitActivity">
                  保存
                </v-btn>
                <v-btn color="blue darken-1" text @click="formActivity = false">
                  取消
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>

        <!-- 密码用户名对话款 -->
        <v-row justify="center">
          <v-dialog v-model="formLogin" persistent max-width="600px">
            <v-card>
              <v-card-title>
                <span class="text-h5">登录对话框</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="用户名"
                        required
                        v-model="userForm.username"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-text-field
                        label="密码"
                        required
                        v-model="userForm.password"
                        type="password"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="submitLogin">
                  登录
                </v-btn>
                <v-btn color="blue darken-1" text @click="formLogin = false">
                  取消
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>

        <!-- 登录成功提示 -->
        <v-row v-if="logSuccess">
          <v-snackbar
            :timeout="-1"
            :value="true"
            absolute
            top
            color="success"
            outlined
            centered
          >
            <strong>登录成功</strong>
          </v-snackbar>
        </v-row>

        <!-- 用户信息展示框 -->
        <v-row justify="center">
          <v-dialog v-model="userInfoShow" persistent max-width="600px">
            <v-card>
              <v-card-title>
                <span class="text-h5">用户信息</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="用户名"
                        disabled
                        v-model="userForm.username"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="密码"
                        v-model="userForm.password"
                        type="password"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="真实姓名"
                        disabled
                        v-model="userForm.name"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="性别"
                        disabled
                        v-model="userForm.sexy"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="电话"
                        v-model="userForm.phone"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        label="年级"
                        required
                        v-model="userForm.grade"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-text-field
                        label="住宿地址"
                        required
                        v-model="userForm.position"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="submitChange">
                  提交
                </v-btn>
                <v-btn color="blue darken-1" text @click="userInfoShow = false">
                  取消
                </v-btn>
                <v-btn color="error" text @click="exitLogin()">
                  退出登录
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>

        <!-- 修改成功提示 -->
        <v-row v-if="userInfoChangeSuccess">
          <v-snackbar
            :value="true"
            absolute
            top
            color="success"
            outlined
            centered
          >
            <strong>修改成功</strong>
          </v-snackbar>
        </v-row>
      </v-main>
    </v-app>
    <div id="heatMap" v-show="false"></div>
  </div>
</template>

<script>
import Map from "../../components/Map";
import HeadBox from "../../components/HeadBox";
import ToolBar from "../../components/ToolBar";
import CugWeatherDialog from "../../components/Weather/CugWeatherDialog";
import TimeChange from "../../components/RealTimeSchool/TimeChange.vue";
import PeopleTimeChange from "../../components/RealTimeSchool/PeopleTimeChange.vue";
import HeatMapLabel from "../../components/RealTimeSchool/HeatMapLabel.vue";
import { mapMutations } from "vuex";
export default {
  name: "Home",
  data() {
    return {
      currentFun: "",
      askActiyity: false,
      formActivity: false,
      deleteActivity: false,
      startDateShow: false,
      startTimeShow: false,
      endDateShow: false,
      endTimeShow: false,
      form: {
        name: "",
        type: "",
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        longitude: "",
        latitude: "",
      },
      currentEntity: "",
      currentId: "",
      formLogin: false,
      userForm: {
        id: "",
        username: "1",
        password: "2",
        sexy: "3",
        phone: "4",
        grade: "5",
        name: "5",
        position: "f",
      },
      logSuccess: false,
      userInfoShow: false,
      userInfoChangeSuccess: false,
    };
  },
  components: {
    CugWeatherDialog,
    ToolBar,
    HeadBox,
    Map,
    TimeChange,
    PeopleTimeChange,
    HeatMapLabel,
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
          this.destoryPrevious();
          this.currentFun = currentFun;
          //地图修改
          this.addRoad("lunch");
          break;
        case "people":
          this.destoryPrevious();
          this.currentFun = currentFun;
          this.addPeopleHeatMap({
            time: "morning",
            dom: document.querySelector("#heatMap"),
          });
          break;
        case "activity":
          this.destoryPrevious();
          this.currentFun = currentFun;
          this.addActivity({ bus: this.$bus });
        default:
          break;
      }
    });
  },
  methods: {
    ...mapMutations([
      "addRoad",
      "destoryRoad",
      "addPeopleHeatMap",
      "destoryPeopleEntity",
      "addActivity",
      "addSingleActivity",
      "deleteSingleActivity",
      "destoryActivity",
    ]),
    destoryPrevious() {
      switch (this.currentFun) {
        case "road":
          this.destoryRoad();
          this.currentFun = "";
          break;
        case "people":
          this.destoryPeopleEntity();
          this.currentFun = "";
          break;
        case "activity":
          this.destoryActivity();
          this.currentFun = "";
          break;
        default:
          break;
      }
    },
    peopleTimeChange(time) {
      this.destoryPeopleEntity();
      this.addPeopleHeatMap({
        time: time,
        dom: document.querySelector("#heatMap"),
      });
    },
    addDialogShow() {
      //展示表单对话框
      this.askActiyity = false;
      this.formActivity = true;
    },
    submitActivity() {
      //提交表单
      //向数据库中增加数据获得id
      //....
      let type;
      switch (this.form.type) {
        case "施工活动":
          type = 0;
          break;
        case "娱乐活动":
          type = 1;
          break;
        case "体育活动":
          type = 2;
          break;
        case "讲座活动":
          type = 3;
          break;
        default:
          break;
      }
      //向地图中增加数据
      this.addSingleActivity({
        type: type,
        name: this.form.name,
        id: Math.random * 100 + "",
        longitude: this.form.longitude,
        latitude: this.form.latitude,
      });

      //情空表单
      (this.form = {
        name: "",
        type: "",
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        longitude: "",
        latitude: "",
      }),
        (this.formActivity = false);
    },
    justDelete() {
      //删除
      //从数据库中删除
      //...
      this.deleteActivity = false;
      this.deleteSingleActivity({
        entity: this.currentEntity,
        id: this.currentId,
      });
    },
    submitLogin() {
      let success = true;
      let name = "default";
      //向数据库验证
      //...
      if (success) {
        //登录成功
        this.logSuccess = true;
        this.formLogin = false;

        //通知子组件
        this.$bus.$emit("loginSuccess", name);
        setTimeout(() => {
          this.logSuccess = false;
        }, 2000);
      } else {
        //登录失败
        alert("登陆失败,请重试！");
        this.userForm = {
          username: "",
          password: "",
        };
      }
    },
    showUserInfo() {
      this.userInfoShow = true;
    },
    submitChange() {
      //向数据库提交修改
      //...
      let success = true;
      if (success) {
        this.userInfoShow = false;
        this.userInfoChangeSuccess = true;
        setTimeout(() => {
          this.userInfoChangeSuccess = false;
        }, 2000);
      } else {
        alert("提交失败");
      }
    },
    exitLogin(){//退出登录
      this.$bus.$emit('exitLogin');
      this.userInfoShow = false;
      this.userForm = {
        id: "",
        username: "",
        password: "",
        sexy: "",
        phone: "",
        grade: "",
        name: "",
        position: "",
      };
    }
  },
  mounted() {
    this.$bus.$on("askDialogShow", ({ position }) => {
      this.askActiyity = true;
      this.form.longitude = position[0];
      this.form.latitude = position[1];
    });
    this.$bus.$on("deleteDialogShow", ({ id }) => {
      this.deleteActivity = true;
      this.currentEntity = id;
      this.currentId = id.id;
    });
  },
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

#heatMap {
  width: 400px;
  height: 400px;
}

/* 人流量 */
.peopleTimeChangeContainer {
  position: absolute;
  right: 3vw;
  top: 5vh;
}
/* 热力图标签 */
.HeatMapLabelContainer {
  position: absolute;
  right: 3vw;
  bottom: 5vh;
}
</style>
