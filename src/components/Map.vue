<template>
    <div class="map">
        <div id="cesiumContainer" ref="">

        </div>
        <SpatialAnalysis v-show="true"></SpatialAnalysis>
    </div>
</template>

<script>
import {mapMutations } from 'vuex'
import SpatialAnalysis from './SpatialAnalysis/SpatialAnalysisDialog'
export default {
    name: 'Map',
    data() {
        return {
            
        };
    },
    components:{
        SpatialAnalysis
    },

    mounted() {
        this.setViewer();
        /* 加载校园3dTiles数据 */
        this.load3DTiles();
    },



    methods: {
        ...mapMutations(['setViewer','load3DTiles']),
    },
};
</script>

<style>
.map{
    position: relative;
    width: 100%;
    height: 100%;
}
#cesiumContainer{
    width: 100%;
    height: 100%;
}
</style>