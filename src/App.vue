<template>
  <div id="app">
    <div class="mapContainer">
      <Map></Map>
    </div>
  </div>
</template>

<script>
import Map from './components/Map.vue'
export default{
  components:{
    Map
  }
}
</script>


<style>
#app{
  width: 100vw;
  height: 100vh;
}

.mapContainer{
  position: absolute;
  top: 0;
  left:0;
  width: 100%;
  height: 100%;
}
</style>
