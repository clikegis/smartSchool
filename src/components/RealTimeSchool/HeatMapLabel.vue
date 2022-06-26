<template>
    <div class="heatMapLabel">
        <div class="label">300</div>
        <div class="canvasContainer">
            <canvas width="50" height="200" id="colorStrip"></canvas>
        </div>
        <div class="label">1</div>
    </div>
</template>

<script>
export default {
    name: 'WorkspaceJsonHeatMapLabel',

    data() {
        return {
            
        };
    },

    mounted() {
        let ctx = document.getElementById("colorStrip").getContext("2d");
        let grad = ctx.createLinearGradient(0,0,0,200);
        grad.addColorStop(0.05,"white");
        grad.addColorStop(0.2,"red");
        grad.addColorStop(0.8,"green");
        grad.addColorStop(1.0,"blue");
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,50,200);
    },

    methods: {
        
    },
};
</script>

<style scoped>
.heatMapLabel{
    width: 50px;
    height: 220px;
    display: flex;
    flex-direction: column;
}

.canvasContainer{
    width: 50px;
    height: 200px;
}

.label{
    font-size: 0.1rem;
    text-align: center;
    font-weight: bolder;
}
</style>