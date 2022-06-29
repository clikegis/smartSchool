<template>
    <div class="spatialAnalysisDialog">
        <v-card class="block" v-show="options.buffer">
            <div class="row">
                <v-text-field
                        label="设置缓冲区半径（m）"
                        v-model="buffer.radius"
                        hide-details="auto"
                        class="title"
                >

                </v-text-field>
            </div>
            <div class="row">
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="buffer.option=1;setBuffer()"
                >
                    点
                </v-btn>
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="buffer.option=2;setBuffer()"
                >
                    线
                </v-btn>
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="buffer.option=3;setBuffer()"
                >
                    面
                </v-btn>
            </div>
            <div class="row">
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="buffer.option=0;setBuffer()"
                >
                    清空
                </v-btn>
            </div>
        </v-card>
        <v-card class="block" v-show="options.visibility">
            <div class="row">
                <span>视域方向</span>
            </div>
            <div class="row">
                <v-slider class="title" v-model="visibility.form.viewHeading" :max="360" :min="0"></v-slider>
            </div>
            <div class="row">
                <span>水平张角</span>
            </div>
            <div class="row">
                <v-slider class="title" v-model="visibility.form.horizontalViewAngle" :max="150" :min="1"></v-slider>
            </div>
            <div class="row">
                <span>垂直张角</span>
            </div>
            <div class="row">
                <v-slider class="title" v-model="visibility.form.verticalViewAngle" :max="150" :min="1"></v-slider>
            </div>
            <div class="row">
                <span>视域距离</span>
            </div>
            <div class="row">
                <v-slider class="title" v-model="visibility.form.viewDistance" :max="1000" :min="1"></v-slider>
            </div>
            <div class="row">
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="visibility.flag=true;setVisibility()"
                >
                    绘制
                </v-btn>
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="visibility.flag=false;setVisibility()"
                >
                    清空
                </v-btn>
            </div>
        </v-card>
        <v-card class="block" v-show="options.limitHeight">
            <div class="row">
                <span>限制高度</span>
            </div>
            <div class="row">
                <v-slider class="title" v-model="limitHeight.limit" :max="120" :min="1"></v-slider>
            </div>
            <div class="row">
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="limitHeight.flag=true;setLimitHeight()"
                >
                    绘制
                </v-btn>
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="limitHeight.flag=false;setLimitHeight()"
                >
                    清空
                </v-btn>
            </div>
        </v-card>
        <v-card class="block" v-show="options.sight">
            <div class="row">
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="sight.option=1;setSight()"
                >
                    线形
                </v-btn>
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="sight.option=2;setSight()"
                >
                    圆形
                </v-btn>
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="sight.option=0;setSight()"
                >
                    清空
                </v-btn>
            </div>
        </v-card>
        <v-card class="block" v-show="options.digTerrain">
            <div class="row">
                <v-text-field
                        label="设置填挖深度（m）"
                        v-model="digTerrain.depth"
                        hide-details="auto"
                        class="title"
                >

                </v-text-field>
            </div>
            <div class="row">
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="digTerrain.flag=true;setDigTerrain()"
                >
                    绘制
                </v-btn>
                <v-btn
                        color="primary"
                        elevation="2"
                        @click="digTerrain.flag=false;setDigTerrain()"
                >
                    清空
                </v-btn>
            </div>
        </v-card>
    </div>
</template>

<script>
    const Cesium = require("../../../node_modules/cesium/Source/Cesium.js");

    import { mapState } from 'vuex'
    import SpatialAnalysis from '../../utils/spatialAnalysis'
    export default {
        name: "SpatialAnalysisDialog",
        data() {
            return {
                buffer: {
                    radius: 10,
                    option: 0
                },
                visibility: {
                    entity: null,
                    flag: false,
                    field: null,
                    form: {
                        viewHeading: 0,
                        viewDistance: 0,
                        horizontalViewAngle: 0,
                        verticalViewAngle: 0
                    }
                },
                limitHeight: {
                    entity: null,
                    flag: false,
                    limit: 60,
                },
                sight: {
                    singleLine: null,
                    circle: null,
                    option: 0
                },
                digTerrain: {
                    entity: null,
                    flag: false,
                    depth: 200
                }


            };
        },
        watch: {
            'visibility.form': {
                deep: true,
                handler() {
                    if (this.visibility.field !== null)
                    {
                        this.visibility.field.updateStyle(this.visibility.form);
                    }
                }
            },
            'limitHeight.limit': {
                deep: true,
                handler() {
                    if(this.limitHeight.entity !== null)
                    {
                        this.limitHeight.entity.setHeight(Number(this.limitHeight.limit));
                    }
                }
            },
        },
        computed: {
            ...mapState(['viewer', 'handler', 'options'])
        },
        methods: {
            getPositions(movement) {
                let Cartesian3 = this.viewer.camera.pickEllipsoid(movement.endPosition || movement.position, Cesium.Ellipsoid.WGS84);
                if (Cartesian3 == undefined) return
                this.x = Number(Cartesian3.x).toFixed(2);
                this.y = Number(Cartesian3.y).toFixed(2);
                this.z = Number(Cartesian3.z).toFixed(2);
                let Cartographic = Cesium.Cartographic.fromCartesian(Cartesian3);
                this.lon = Cesium.Math.toDegrees(Cartographic.longitude);
                this.lat = Cesium.Math.toDegrees(Cartographic.latitude);
                this.height = Cartographic.height;
                return [Cesium.Math.toDegrees(Cartographic.longitude), Cesium.Math.toDegrees(Cartographic.latitude)];
            },
            addBuffer(buffer) {
                this.viewer.entities.add({
                    polygon: {
                        hierarchy: new Cesium.PolygonHierarchy(buffer),
                        material: Cesium.Color.RED.withAlpha(0.6),
                        classificationType: Cesium.ClassificationType.BOTH
                    },
                    polyline: {
                        positions: buffer,
                        width: 2,
                        material: Cesium.Color.RED.withAlpha(0.4),
                    }
                });
            },
            setBuffer() {
                if (this.buffer.option === 0) {
                    this.viewer.entities.removeAll()
                }
                if (this.buffer.option === 1) {
                    this.handler.setInputAction(clickEvent => {
                        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        let point = this.getPositions(clickEvent);
                        this.viewer.entities.add({
                            position: Cesium.Cartesian3.fromDegrees(point[0], point[1], 0),
                            point: {
                                pixelSize: 3,
                                color: Cesium.Color.YELLOW,
                                outlineWidth: 3,
                                outlineColor: Cesium.Color.YELLOW.withAlpha(0.4),
                            }
                        });
                        this.addBuffer(SpatialAnalysis.BufferAnalysis.pointBuffer(point, this.buffer.radius));
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                }
                if (this.buffer.option === 2) {
                    let points = [];
                    this.handler.setInputAction(clickEvent => {
                        points.push(this.getPositions(clickEvent))
                        if (points.length > 1) {
                            let positions = [...points[points.length - 2], ...points[points.length - 1]];
                            this.viewer.entities.add({
                                polyline: {
                                    positions: Cesium.Cartesian3.fromDegreesArray(positions),
                                    width: 2,
                                    material: Cesium.Color.YELLOW,
                                }
                            })
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    this.handler.setInputAction(clickEvent => {
                        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                        this.addBuffer(SpatialAnalysis.BufferAnalysis.polylineBuffer(points, this.buffer.radius));
                    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                }
                if (this.buffer.option === 3) {
                    let points = [];
                    let positions = []
                    this.handler.setInputAction(clickEvent => {

                        points.push(this.getPositions(clickEvent))
                        positions = [...positions, ...this.getPositions(clickEvent)];
                        if (points.length > 1 && points.length < 3) {
                            this.viewer.entities.add({
                                id: 'area_line',
                                polyline: {
                                    positions: Cesium.Cartesian3.fromDegreesArray(positions),
                                    width: 2,
                                    material: Cesium.Color.YELLOW,
                                }
                            })
                        } else if (points.length >= 3) {
                            let areas = Cesium.Cartesian3.fromDegreesArray([...positions, positions[0], positions[1]]);
                            this.viewer.entities.removeById('area');
                            this.viewer.entities.add({
                                id: 'area',
                                polygon: {
                                    hierarchy: new Cesium.PolygonHierarchy(areas),
                                    material: Cesium.Color.YELLOW.withAlpha(0.6),
                                    classificationType: Cesium.ClassificationType.BOTH
                                },
                                polyline: {
                                    positions: areas,
                                    width: 2,
                                    material: Cesium.Color.YELLOW.withAlpha(0.4),
                                }
                            });
                            this.viewer.entities.removeById('area_line');
                        }
                    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    this.handler.setInputAction(clickEvent => {
                        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                        if (points.length >= 3) {
                            let areas = Cesium.Cartesian3.fromDegreesArray([...positions, positions[0], positions[1]]);
                            this.viewer.entities.removeById('area');
                            this.viewer.entities.add({
                                polygon: {
                                    hierarchy: new Cesium.PolygonHierarchy(areas),
                                    material: Cesium.Color.YELLOW.withAlpha(0.6),
                                    classificationType: Cesium.ClassificationType.BOTH
                                },
                                polyline: {
                                    positions: areas,
                                    width: 2,
                                    material: Cesium.Color.YELLOW.withAlpha(0.4),
                                }
                            });
                            let area_points = [...points, points[0]]
                            this.addBuffer(SpatialAnalysis.BufferAnalysis.polygonBuffer(area_points, this.buffer.radius));
                        } else {
                            this.viewer.entities.removeById('area_line');
                        }
                    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                }
            },
            setVisibility() {
                if(this.visibility.flag)
                {
                    this.visibility.entity = new SpatialAnalysis.VisibilityAnalysis(this.viewer);
                    this.visibility.entity.DrawEndEvent.addEventListener(event => {
                        this.visibility.field = event;
                        this.visibility.form = event.getStyle();
                    });
                    this.visibility.entity.activate();
                }
                else
                {
                    if(this.visibility.field !== null)
                    {
                        this.visibility.field.remove();
                        this.visibility.field = null;
                    }
                    this.visibility.entity = null;
                }
            },
            setLimitHeight() {
                if(this.limitHeight.flag)
                {
                    let degreesArray = [
                        114.60898208096732, 30.464698423436272,
                        114.61298208096732, 30.464698423436272,
                        114.61298208096732, 30.460698423436272,
                        114.60898208096732, 30.460698423436272,
                    ];
                    this.limitHeight.entity = new SpatialAnalysis.LimitHeightAnalysis(this.viewer, degreesArray, this.limitHeight.limit)
                }
                else
                {
                    this.limitHeight.entity.remove();
                    this.limitHeight.entity = null;
                }
            },
            setSight() {
                if (this.sight.option === 0) {
                    if(this.sight.singleLine !== null)
                    {
                        this.sight.singleLine.deactivate();
                        this.sight.singleLine.clear();
                    }
                    if(this.sight.Circle !== null)
                    {
                        this.sight.Circle.deactivate();
                        this.sight.Circle.clear();
                    }
                    this.viewer.entities.removeAll();
                    this.viewer.scene.postProcessStages.removeAll();
                }
                if(this.sight.option === 1)
                {
                    this.sight.singleLine = new SpatialAnalysis.SightLine(this.viewer);
                    this.sight.singleLine.activate();
                }
                if(this.sight.option === 2)
                {
                    this.sight.Circle = new SpatialAnalysis.Circle(this.viewer);
                    this.sight.Circle.activate();
                }
            },
            setDigTerrain() {
                if(this.digTerrain.flag)
                {
                    this.digTerrain.entity = new SpatialAnalysis.Excavate(this.viewer)
                    this.digTerrain.entity.clear()
                    let entityDraw = new SpatialAnalysis.EntityDraw(this.viewer);
                    entityDraw.DrawEndEvent.addEventListener((result, positions) => {
                        result.remove()
                        this.digTerrain.entity.add(positions, {
                            excavateDepth: this.digTerrain.depth,
                            bottomImage: 'img/excavate_bottom_min.jpg',
                            sideImage: 'img/excavate_kuangqu.jpg'
                        });
                    })
                    entityDraw.activate('Polygon');
                }
                else
                {
                    this.viewer.entities.removeAll();
                }
            }
        }
    }
</script>

<style scoped>
    .spatialAnalysisDialog {
        position: absolute;
        left: 15%;
        top: 20%;
        width: 300px;
    }

    .block {
        width: 100%;
        margin: 0 auto;
    }

    .row {
        height: 50px;
        width: 100%;
        margin: auto;
    }

    .row * {
        margin: auto;
        font-size: 15px;
    }

    .title {
        margin: auto 10px;
    }
</style>