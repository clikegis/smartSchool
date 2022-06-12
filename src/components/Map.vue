<template>
    <div class="map">
        <div id="cesiumContainer" ref="">

        </div>
    </div>
</template>

<script>
import {mapMutations} from 'vuex'
export default {
    name: 'Map',
    data() {
        return {
            
        };
    },

    mounted() {
        this.setViewer();
    },

    methods: {
        ...mapMutations(['setViewer']),
    },
};
</script>

<style>
.map{
    width: 100%;
    height: 100%;
}
#cesiumContainer{
    width: 100%;
    height: 100%;
}
</style>