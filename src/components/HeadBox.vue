<template>
  <v-container fluid>
    <div class="d-flex align-center">
      <v-img
          alt="smartSchool Logo"
          class="shrink mr-2"
          contain
          src='../assets/img/smartLogo.png'
          transition="scale-transition"
          width="40"
      />
      <span class="text-lg-h4">智慧校园综合服务系统</span>
    </div>

    <v-spacer></v-spacer>

    <v-btn
        absolute
        right
        top
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
    >
      <span class="mr-2">Latest Release</span>
      <v-icon>mdi-open-in-new</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
export default {
  name: "HeadBox"
}
</script>

<style scoped>

</style>
