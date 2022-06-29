import * as turf from 'turf'
import glsl from './glsl'

const Cesium = require("../../node_modules/cesium/Source/Cesium.js");

class LimitHeightAnalysis{
    constructor(viewer, degreesArray, height, style) {
        this.viewer = viewer;
        this.degreesArray = degreesArray;
        this.height = height;
        this.style = style || {};
        this.init();
    }

    init() {
        this.viewer.scene.invertClassification = true;
        this.viewer.scene.invertClassificationColor = this.style.color || new Cesium.Color(1, 1, 1, 1);
        this.addBottomPolygon();
        this.addPrimitive();
    }

    addBottomPolygon() {
        this.bottomPolygon = this.viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(this.degreesArray)),
                height: new Cesium.CallbackProperty(e => {
                    return this.height;
                }, false),
                material: Cesium.Color.YELLOW.withAlpha(0.2),
                outline: true,
                outlineColor: Cesium.Color.RED
            }
        })
    }

    addPrimitive() {
        let geometry = this.createGeometry();
        this.addClassificationPrimitive(geometry);
    }

    setHeight(height) {
        this.height = height || 100;
        this.removePrimitive();
        this.addPrimitive();
    }

    createGeometry() {
        return new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(this.degreesArray)
            ),
            height: this.height,
            extrudedHeight: 200000,
        });
    }

    addClassificationPrimitive(polygonGeometry) {
        this.Primitive = this.viewer.scene.primitives.add(
            new Cesium.ClassificationPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: Cesium.PolygonGeometry.createGeometry(polygonGeometry),
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                            Cesium.Color.RED.withAlpha(0.6) //颜色值
                        ),
                        show: new Cesium.ShowGeometryInstanceAttribute(true),
                    },
                }),
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
                asynchronous: !1,
            })
        );
    }

    removePrimitive() {
        this.viewer.scene.primitives.remove(this.Primitive)
    }

    remove() {
        this.removePrimitive();
        this.viewer.scene.invertClassification = false;
        this.viewer.entities.remove(this.bottomPolygon);
    }
}

function getHeading(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
}

function getPitch(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.asin(finalPosition.z));
}

class CameraLine {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.viewPosition = options.viewPosition; //观察点
        this.viewPositionEnd = options.viewPositionEnd; //结束点
        this.viewDistance = this.getDistance();
        this.viewHeading = this.getViewHeading();
        this.viewPitch = this.getViewPitch();
        this.horizontalViewAngle = options.horizontalViewAngle || 90.0;
        this.verticalViewAngle = options.verticalViewAngle || 60.0;
        this.drawSketch();
        this.drawFrustumOutline();
    }

    updateEndPosition(endPosition) {
        this.viewPositionEnd = endPosition;
    }

    getViewHeading() {
        this.viewHeading = getHeading(this.viewPosition, this.viewPositionEnd);
        return this.viewHeading;
    }

    getViewPitch() {
        this.viewPitch = getPitch(this.viewPosition, this.viewPositionEnd);
        return this.viewPitch;
    }

    getDistance() {
        this.viewDistance = Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd);
        return this.viewDistance;
    }

    getOptions() {
        return {
            viewPosition: this.viewPosition,
            viewPositionEnd: this.viewPositionEnd,
            viewDistance: this.viewDistance,
            viewHeading: this.viewHeading,
            viewPitch: this.viewPitch,
            horizontalViewAngle: this.horizontalViewAngle,
            verticalViewAngle: this.verticalViewAngle
        }
    }

    drawFrustumOutline() {
        this.frustumOutline = this.viewer.entities.add({
            name: 'frustumOutline',
            position: this.viewPosition,
            orientation: new Cesium.CallbackProperty(e => {
                return Cesium.Transforms.headingPitchRollQuaternion(
                    this.viewPosition,
                    Cesium.HeadingPitchRoll.fromDegrees(this.getViewHeading() - this.horizontalViewAngle, this.getViewPitch(), 0.0)
                )
            }, false),
            ellipsoid: {
                radii: new Cesium.CallbackProperty(e => {
                    const distance = this.getDistance();
                    return new Cesium.Cartesian3(distance, distance, distance);
                }, false),
                innerRadii: new Cesium.Cartesian3(0.01, 0.01, 0.01),
                minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
                maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
                minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
                maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
                fill: false,
                outline: true,
                outlineColor: Cesium.Color.AQUA
            }
        });
    }

    drawSketch() {
        this.sketch = this.viewer.entities.add({
            name: 'sketch',
            position: this.viewPosition,
            orientation: new Cesium.CallbackProperty(e => {
                return Cesium.Transforms.headingPitchRollQuaternion(
                    this.viewPosition,
                    Cesium.HeadingPitchRoll.fromDegrees(this.getViewHeading() - this.horizontalViewAngle, this.getViewPitch(), 0.0)
                )
            }, false),
            ellipsoid: {
                radii: new Cesium.CallbackProperty(e => {
                    const distance = this.getDistance();
                    return new Cesium.Cartesian3(distance, distance, distance);
                }, false),
                minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
                maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
                minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
                maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
                fill: false,
                outline: true,
                subdivisions: 256,
                stackPartitions: 64,
                slicePartitions: 64,
                outlineColor: Cesium.Color.AQUA
            }
        });
    }

    remove() {
        if (this.sketch) {
            this.viewer.entities.remove(this.sketch);
            this.sketch = null;
        }

        if (this.frustumOutline) {
            this.viewer.entities.remove(this.frustumOutline);
            this.frustumOutline = null;
        }
    }
}

class Visibility {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.viewPosition = options.viewPosition;
        this.viewPositionEnd = options.viewPositionEnd;
        this.viewDistance = options.viewDistance;
        this.viewHeading = options.viewHeading;
        if (this.viewHeading < 0) {
            this.viewHeading += 360;
        }
        this.viewPitch = options.viewPitch;
        this.horizontalViewAngle = options.horizontalViewAngle || 90.0;
        this.verticalViewAngle = options.verticalViewAngle || 90.0;
        this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.LIME; // Cesium.Color.GREEN;
        this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;
        this.enabled = (typeof options.enabled === "boolean") ? options.enabled : true;
        this.softShadows = (typeof options.softShadows === "boolean") ? options.softShadows : true;
        this.size = options.size || 2048;
        this.add();
    }

    add() {
        this.createLightCamera();
        this.createShadowMap();
        this.createPostStage();
        this.drawFrustumOutline();
        this.drawSketch();
    }

    getStyle() {
        return {
            viewHeading: this.viewHeading,
            viewDistance: this.viewDistance,
            horizontalViewAngle: this.horizontalViewAngle,
            verticalViewAngle: this.verticalViewAngle
        }
    }

    updateStyle(options) {
        this.viewHeading = options.viewHeading;
        this.viewDistance = options.viewDistance;
        this.horizontalViewAngle = options.horizontalViewAngle;
        this.verticalViewAngle = options.verticalViewAngle;
        this.clear();
        this.add();
    }

    remove() {
        this.clear();
    }

    clear() {
        if (this.sketch) {
            this.viewer.entities.removeById(this.sketch.id);
            this.sketch = null;
        }

        if (this.frustumOutline) {
            this.viewer.entities.remove(this.frustumOutline);
            this.frustumOutline = null;
        }

        if (this.postStage) {
            this.viewer.scene.postProcessStages.remove(this.postStage);
            this.postStage = null;
        }
    }

    createLightCamera() {
        this.lightCamera = new Cesium.Camera(this.viewer.scene);
        this.lightCamera.position = this.viewPosition;
        this.lightCamera.frustum.near = this.viewDistance * 0.001;
        this.lightCamera.frustum.far = this.viewDistance;
        const hr = Cesium.Math.toRadians(this.horizontalViewAngle);
        const vr = Cesium.Math.toRadians(this.verticalViewAngle);
        const aspectRatio =
            (this.viewDistance * Math.tan(hr / 2) * 2) /
            (this.viewDistance * Math.tan(vr / 2) * 2);
        this.lightCamera.frustum.aspectRatio = aspectRatio;
        if (hr > vr) {
            this.lightCamera.frustum.fov = hr;
        } else {
            this.lightCamera.frustum.fov = vr;
        }
        this.lightCamera.setView({
            destination: this.viewPosition,
            orientation: {
                heading: Cesium.Math.toRadians(this.viewHeading || 0),
                pitch: Cesium.Math.toRadians(this.viewPitch || 0),
                roll: 0
            }
        });
    }

    createShadowMap() {
        this.shadowMap = new Cesium.ShadowMap({
            context: (this.viewer.scene).context,
            lightCamera: this.lightCamera,
            enabled: this.enabled,
            isPointLight: true,
            pointLightRadius: this.viewDistance,
            cascadesEnabled: false,
            size: this.size,
            softShadows: this.softShadows,
            normalOffset: false,
            fromLightSource: false
        });
        this.viewer.scene.shadowMap = this.shadowMap;
    }

    createPostStage() {
        const fs = glsl
        const postStage = new Cesium.PostProcessStage({
            fragmentShader: fs,
            uniforms: {
                shadowMap_textureCube: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    return Reflect.get(this.shadowMap, "_shadowMapTexture");
                },
                shadowMap_matrix: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    return Reflect.get(this.shadowMap, "_shadowMapMatrix");
                },
                shadowMap_lightPositionEC: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    return Reflect.get(this.shadowMap, "_lightPositionEC");
                },
                shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    const bias = this.shadowMap._pointBias;
                    return Cesium.Cartesian4.fromElements(
                        bias.normalOffsetScale,
                        this.shadowMap._distance,
                        this.shadowMap.maximumDistance,
                        0.0,
                        new Cesium.Cartesian4()
                    );
                },
                shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    const bias = this.shadowMap._pointBias;
                    const scratchTexelStepSize = new Cesium.Cartesian2();
                    const texelStepSize = scratchTexelStepSize;
                    texelStepSize.x = 1.0 / this.shadowMap._textureSize.x;
                    texelStepSize.y = 1.0 / this.shadowMap._textureSize.y;
                    return Cesium.Cartesian4.fromElements(
                        texelStepSize.x,
                        texelStepSize.y,
                        bias.depthBias,
                        bias.normalShadingSmooth,
                        new Cesium.Cartesian4()
                    );
                },
                camera_projection_matrix: () => {
                    return this.lightCamera.frustum.projectionMatrix;
                },
                camera_view_matrix: () => {
                    return this.lightCamera.viewMatrix;
                },
                x_viewDistance: () => {
                    return this.viewDistance;
                },
                x_visibleAreaColor: this.visibleAreaColor,
                x_invisibleAreaColor: this.invisibleAreaColor,
            }
        });
        this.postStage = this.viewer.scene.postProcessStages.add(postStage);
    }

    drawFrustumOutline() {
        this.frustumOutline = this.viewer.entities.add({
            name: 'frustumOutline',
            position: this.viewPosition,
            orientation: new Cesium.CallbackProperty(e => {
                return Cesium.Transforms.headingPitchRollQuaternion(
                    this.viewPosition,
                    Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - 90, this.viewPitch, 0.0)
                )
            }, false),
            ellipsoid: {
                radii: new Cesium.CallbackProperty(e => {
                    return new Cesium.Cartesian3(this.viewDistance, this.viewDistance, this.viewDistance);
                }, false),

                innerRadii: new Cesium.Cartesian3(0.01, 0.01, 0.01),
                minimumClock: new Cesium.CallbackProperty(e => {
                    return Cesium.Math.toRadians(-this.horizontalViewAngle / 2);
                }, false),
                maximumClock: new Cesium.CallbackProperty(e => {
                    return Cesium.Math.toRadians(this.horizontalViewAngle / 2);
                }, false),
                minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
                maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
                fill: false,
                slicePartitions: 64,
                stackPartitions: 64,
                outline: true,
                outlineColor: Cesium.Color.AQUA
            }
        });
    }

    drawSketch() {
        this.sketch = this.viewer.entities.add({
            name: 'sketch',
            position: this.viewPosition,
            orientation: new Cesium.CallbackProperty(e => {
                return Cesium.Transforms.headingPitchRollQuaternion(
                    this.viewPosition,
                    Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - 90, this.viewPitch, 0.0)
                )
            }, false),
            ellipsoid: {
                radii: new Cesium.CallbackProperty(e => {
                    return new Cesium.Cartesian3(this.viewDistance, this.viewDistance, this.viewDistance);
                }, false),
                minimumClock: new Cesium.CallbackProperty(e => {
                    return Cesium.Math.toRadians(-this.horizontalViewAngle / 2);
                }, false),
                maximumClock: new Cesium.CallbackProperty(e => {
                    return Cesium.Math.toRadians(this.horizontalViewAngle / 2);
                }, false),
                minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
                maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
                fill: false,
                outline: true,
                subdivisions: 256,
                stackPartitions: 64,
                slicePartitions: 64,
                outlineColor: Cesium.Color.AQUA
            }
        });
    }
}

class VisibilityAnalysis {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.initEvents();
    }

    activate() {
        this.deactivate();
        this.clear();
        this.firstPosition = undefined;
        this.registerEvents();
    }

    deactivate() {
        this.unRegisterEvents();
        this.viewer._element.style.cursor = 'pointer';
        this.viewer.enableCursorStyle = true;
    }

    clear() {
        if (this.cameraLine) {
            this.cameraLine.remove();
            this.cameraLine = undefined;
        }
    }

    initEvents() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.DrawEndEvent = new Cesium.Event();
    }

    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    leftClickEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.position);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            if (!this.firstPosition) {
                this.firstPosition = this.getFirstPosition(position);
            } else {
                this.drawEnd();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    getFirstPosition(position) {
        const c = Cesium.Cartographic.fromCartesian(position);
        const lon = Cesium.Math.toDegrees(c.longitude);
        const lat = Cesium.Math.toDegrees(c.latitude);
        const height = c.height + 1;
        return Cesium.Cartesian3.fromDegrees(lon, lat, height);
    }

    createCameraLine(position) {
        this.cameraLine = new CameraLine(this.viewer, {
            viewPosition: this.firstPosition,
            viewPositionEnd: position
        })
    }

    mouseMoveEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.endPosition);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            if (!this.firstPosition) return;

            if (!this.cameraLine) {
                this.createCameraLine(position);
            } else {
                this.cameraLine.updateEndPosition(position);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    rightClickEvent() {
        this.handler.setInputAction(e => {
            if (!this.firstPosition) {
                this.deactivate()
                return;
            } else {
                this.clear();
                this.deactivate();
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    drawEnd() {
        this.Visibility = new Visibility(this.viewer, this.cameraLine.getOptions());
        this.DrawEndEvent.raiseEvent(this.Visibility);
        this.cameraLine.remove();
        this.deactivate();
    }
}

class BufferAnalysis {
    static pointBuffer(point, radius, options) {
        let pointF = turf.point(point);
        options = options || {
            units: 'meters',
            z: 0
        };
        let buffer = turf.buffer(pointF, radius || 100, options.units);
        let coordinates = buffer.geometry.coordinates;
        let points = coordinates[0];
        let degreesArrayHeights = this.pointsToDegreesArray(points, options.z || 0);
        return Cesium.Cartesian3.fromDegreesArrayHeights(degreesArrayHeights);
    }

    static polylineBuffer(points, radius, options) {
        let polylineF = turf.lineString(points);
        options = options || {
            units: 'meters',
            z: 0
        };
        let buffered = turf.buffer(polylineF, radius || 100, options.units);
        let coordinates = buffered.geometry.coordinates;
        points = coordinates[0];
        let degreesArrayHeights = this.pointsToDegreesArray(points, options.z || 0);
        return Cesium.Cartesian3.fromDegreesArrayHeights(degreesArrayHeights);
    }

    static polygonBuffer(points, radius, options) {
        return this.polylineBuffer(points, radius, options);
    }

    static pointsToDegreesArray(points, height) {
        let degreesArray = [];
        points.map(item => {
            degreesArray.push(item[0]);
            degreesArray.push(item[1]);
            degreesArray.push(height);
        });
        return degreesArray;
    }
}

class SightLine {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.initEvents();
    }

    activate() {
        this.deactivate();
        this.clear();
        this.positions = [];
        this.tempPositions = [];
        this.registerEvents();
        this.viewer.enableCursorStyle = false;
        this.viewer._element.style.cursor = 'default';
    }

    deactivate() {
        this.unRegisterEvents();
        this.viewer._element.style.cursor = 'pointer';
        this.viewer.enableCursorStyle = true;
    }

    clear() {
        if (this.polylineEntity) {
            this.viewer.entities.remove(this.polylineEntity);
            this.polylineEntity = undefined;
        }
        if (this.viewEntity) {
            this.viewer.entities.remove(this.viewEntity);
            this.viewEntity = undefined;
        }
        if (this.targetEntity) {
            this.viewer.entities.remove(this.targetEntity);
            this.targetEntity = undefined;
        }


        if (this.resultPolylines) {
            this.resultPolylines.forEach((item) => {
                this.viewer.entities.remove(item);
            })
        }
    }

    initEvents() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    }

    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    leftClickEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.position);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            this.positions.push(position);
            if (this.positions.length == 1) {
                this.handleFirstPosition();
            } else { //两点时结束
                this.drawEnd();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    handleFirstPosition() {
        this.generateView();
        this.generatePolyline();
    }

    generatePolyline() {
        this.polylineEntity = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(e => {
                    return this.tempPositions;
                }, false),
                width: 2,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
            }
        })
    }

    generateView() {
        this.viewEntity = this.viewer.entities.add({
            position: this.positions[0],
            label: {
                text: "观察位置",
                fillColor: Cesium.Color.WHITE,
                scale: 0.5,
                font: 'normal 34px MicroSoft YaHei',
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 1500, 0.4),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -20),
                outlineWidth: 3,
                outlineColor: Cesium.Color.BLACK
            },
            point: {
                color: Cesium.Color.DODGERBLUE,
                pixelSize: 5,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 4200, 0.4),
                disableDepthTestDistance: 500,
            },
        })
    }

    generateEndPoint() {
        this.targetEntity = this.viewer.entities.add({
            position: this.positions[1],
            label: {
                text: "目标位置",
                fillColor: Cesium.Color.WHITE,
                scale: 0.5,
                font: 'normal 34px MicroSoft YaHei',
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 1500, 0.4),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -20),
                outlineWidth: 3,
                outlineColor: Cesium.Color.BLACK
            },
            point: {
                color: Cesium.Color.DODGERBLUE,
                pixelSize: 5,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 4200, 0.4),
                disableDepthTestDistance: 500,
            },
        })
    }

    mouseMoveEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.endPosition);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            if (!this.polylineEntity) return;
            this.tempPositions = this.positions.concat([position]);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    rightClickEvent() {
        this.handler.setInputAction(e => {
            if (!this.polylineEntity) {
                this.deactivate()
                return;
            }
            if (this.positions.length < 2) {
                this.clear();
                this.deactivate();
                return;
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    drawEnd() {
        this.generateEndPoint();
        this.startnalysis();
        this.viewer.entities.remove(this.polylineEntity);
        this.deactivate();
    }

    startnalysis() {
        var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.positions[1], this.positions[0], new Cesium.Cartesian3()), new Cesium.Cartesian3());
        var ray = new Cesium.Ray(this.positions[0], direction);
        var result = this.viewer.scene.pickFromRay(ray, [this.viewEntity, this.targetEntity]); // 计算交互点，返回第一个
        this.resultPolylines = this.showIntersection(result, this.positions[1], this.positions[0]);
    }

    showIntersection(result, destPoint, viewPoint) {
        let resultPolylines = [];
        let resultLine;
        if (Cesium.defined(result) && Cesium.defined(result.object)) {
            resultLine = this.drawResultLine(result.position, viewPoint, Cesium.Color.CHARTREUSE);
            resultPolylines.push(resultLine);
            resultLine = this.drawResultLine(result.position, destPoint, Cesium.Color.RED);
            resultPolylines.push(resultLine);
        } else {
            resultLine = this.drawResultLine(viewPoint, destPoint, Cesium.Color.CHARTREUSE);
            resultPolylines.push(resultLine);
        }
        return resultPolylines;
    }

    drawResultLine(leftPoint, secPoint, color) {
        return this.viewer.entities.add({
            polyline: {
                positions: [leftPoint, secPoint],
                width: 2,
                material: color,
                depthFailMaterial: color
            }
        })
    }
}

function getCirclePoint(lon, lat, angle, radius) {
    let dx = radius * Math.sin(angle * Math.PI / 180.0);
    let dy = radius * Math.cos(angle * Math.PI / 180.0);
    let ec = 6356725 + (6378137 - 6356725) * (90.0 - lat) / 90.0;
    let ed = ec * Math.cos(lat * Math.PI / 180);
    let newLon = (dx / ed + lon * Math.PI / 180.0) * 180.0 / Math.PI;
    let newLat = (dy / ec + lat * Math.PI / 180.0) * 180.0 / Math.PI;
    return [newLon, newLat];
}

function generateCirclePoints(center, radius, steps) {
    let points = [];
    steps = steps || 360;
    let num = parseInt(360 / steps);
    for (let i = 0; i <= 360; i += num) {
        points.push(getCirclePoint(center[0], center[1], i, radius));
    }
    return points;
}

class Circle {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.initEvents();
    }

    activate() {
        this.deactivate();
        this.clear();
        this.positions = [];
        this.tempPositions = [];
        this.registerEvents();
        this.viewer.enableCursorStyle = false;
        this.viewer._element.style.cursor = 'default';
    }

    deactivate() {
        this.unRegisterEvents();
        this.viewer._element.style.cursor = 'pointer';
        this.viewer.enableCursorStyle = true;
    }

    clear() {
        if (this.circleEntity) {
            this.viewer.entities.remove(this.circleEntity);
            this.circleEntity = undefined;
        }
        if (this.viewEntity) {
            this.viewer.entities.remove(this.viewEntity);
            this.viewEntity = undefined;
        }

        if (this.resultPolylines) {
            this.resultPolylines.forEach((item) => {
                this.viewer.entities.remove(item);
            })
        }
    }

    initEvents() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    }

    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    leftClickEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.position);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            this.positions.push(position);
            if (this.positions.length == 1) {
                this.tempPositions.push(position);
                this.handleFirstPosition();
            } else { //两点时结束
                this.drawEnd();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    handleFirstPosition() {
        this.generateView();
        this.generateCircle();
    }

    generateCircle() {
        this.circleEntity = this.viewer.entities.add({
            position: this.positions[0],
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(e => {
                    return this.getRadius();
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(e => {
                    return this.getRadius();
                }, false),
                material: Cesium.Color.RED.withAlpha(0.6),
                classificationType: Cesium.ClassificationType.BOTH
            },
        })
    }

    getRadius() {
        let p1 = this.tempPositions[0];
        let p2 = this.tempPositions[0];
        if (this.tempPositions.length > 1) p2 = this.tempPositions[1];
        let distance = Cesium.Cartesian3.distance(p1, p2);
        return distance == 0 ? 0.000001 : distance;
    }

    generateView() {
        this.viewEntity = this.viewer.entities.add({
            position: this.positions[0],
            label: {
                text: "观察位置",
                fillColor: Cesium.Color.WHITE,
                scale: 0.5,
                font: 'normal 34px MicroSoft YaHei',
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
                scaleByDistance: new Cesium.NearFarScalar(500, 1, 1500, 0.4),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -20),
                outlineWidth: 3,
                outlineColor: Cesium.Color.BLACK
            },
            point: {
                color: Cesium.Color.DODGERBLUE,
                pixelSize: 5,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 4200, 0.4),
                disableDepthTestDistance: 500,
            },
        })
    }

    mouseMoveEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.endPosition);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            if (!this.circleEntity) return;
            this.tempPositions = this.positions.concat([position]);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    rightClickEvent() {
        this.handler.setInputAction(e => {
            if (!this.circleEntity) {
                this.deactivate()
                return;
            }
            if (this.positions.length < 2) {
                this.clear();
                this.deactivate();
                return;
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    drawEnd() {
        this.startnalysis();
        this.viewer.entities.remove(this.circleEntity);
        this.deactivate();
    }

    startnalysis() {
        const c = Cesium.Cartographic.fromCartesian(this.positions[0]);
        const center = [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude)]
        let circlePoints = generateCirclePoints(center, this.getRadius());
        let targetPositions = this.point2dToPoint3d(circlePoints);
        this.resultPolylines = [];
        let direction, ray, result, lines;
        for (let i = 0; i < targetPositions.length; i++) {
            direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(targetPositions[i], this.positions[0], new Cesium.Cartesian3()), new Cesium.Cartesian3());
            ray = new Cesium.Ray(this.positions[0], direction);
            result = this.viewer.scene.pickFromRay(ray, [this.viewEntity, this.targetEntity]);
            lines = this.showIntersection(result, targetPositions[i], this.positions[0]);
            this.resultPolylines = this.resultPolylines.concat(lines);
        }
    }

    point2dToPoint3d(point2ds) {
        let point3ds = [];
        for (let i = 0; i < point2ds.length; i++) {
            const item = point2ds[i];
            const cartesian3 = Cesium.Cartesian3.fromDegrees(item[0], item[1], 0);
            const c = this.viewer.scene.clampToHeight(cartesian3);
            point3ds.push(c);
        }
        return point3ds;
    }

    showIntersection(result, destPoint, viewPoint) {
        let resultPolylines = [];
        let resultLine;
        if (Cesium.defined(result) && Cesium.defined(result.object)) {
            resultLine = this.drawResultLine(result.position, viewPoint, Cesium.Color.CHARTREUSE);
            resultPolylines.push(resultLine);
            resultLine = this.drawResultLine(result.position, destPoint, Cesium.Color.RED);
            resultPolylines.push(resultLine);
        } else {
            resultLine = this.drawResultLine(viewPoint, destPoint, Cesium.Color.CHARTREUSE);
            resultPolylines.push(resultLine);
        }
        return resultPolylines;
    }

    drawResultLine(leftPoint, secPoint, color) {
        return this.viewer.entities.add({
            polyline: {
                positions: [leftPoint, secPoint],
                width: 2,
                material: color,
                depthFailMaterial: color
            }
        })
    }
}

// function cartesian3ToDegrees(position) {
//     let c = Cesium.Cartographic.fromCartesian(position);
//     return [Cesium.Math.toDegrees(c.longitude), Cesium.Math.toDegrees(c.latitude)];
// }

// function booleanClockwise(positions) {
//     let degreesArrary = [];
//     positions.map(position => {
//         degreesArrary.push(cartesian3ToDegrees(position));
//     });
//     //首尾闭合
//     degreesArrary.push(degreesArrary[0]);
//     let lineString = turf.lineString(degreesArrary);
//     console.log(1)
//     return turf.booleanClockwise(lineString)
// }

function getClippingPlanes(positions) {
    let pLength = positions.length;
    let clippingPlanes = []; // 存储ClippingPlane集合
    for (let i = 0; i < pLength; ++i) {
        let nextIndex = (i + 1) % pLength;
        let midpoint = Cesium.Cartesian3.add(positions[i], positions[nextIndex], new Cesium.Cartesian3());
        midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

        let up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
        let right = Cesium.Cartesian3.subtract(positions[nextIndex], midpoint, new Cesium.Cartesian3());
        right = Cesium.Cartesian3.normalize(right, right);

        let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
        normal = Cesium.Cartesian3.normalize(normal, normal);

        let originCenteredPlane = new Cesium.Plane(normal, 0.0);
        let distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);
        clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
    }
    return clippingPlanes;
}

class Excavate {
    constructor(viewer) {
        this.viewer = viewer;
    }

    add(positions, opitons) {
        if (!opitons) opitons = {};
        this.excavateDepth = opitons.excavateDepth || 200; //开挖深度
        this.bottomImage = opitons.bottomImage || 'img/excavate_bottom_min.jpg';
        this.sideImage = opitons.sideImage || 'img/excavate_side_min.jpg';
        this.clear();
        positions = positions.reverse();
        let clippingPlanes = getClippingPlanes(positions);
        this.viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: clippingPlanes,
            edgeWidth: 1.0,
            edgeColor: Cesium.Color.WHITE
        });
        console.log(positions)
        this.addBottomPolygon(positions);
        this.addSideWall(positions);
    }

    addBottomPolygon(positions) {
        this.bottomPolygon = this.viewer.entities.add({
            polygon: {
                hierarchy: positions,
                material: this.bottomImage,
                height: -this.excavateDepth
            },
        });
    }

    addSideWall(positions) {
        positions.push(positions[0]); //首尾闭合
        let minimumHeights = new Array(positions.length).fill(-this.excavateDepth);
        this.sideWall = this.viewer.entities.add({
            wall: {
                positions: positions,
                minimumHeights: minimumHeights,
                material: this.sideImage
            }
        });
    }

    clear() {
        this.viewer.entities.removeAll();
        this.viewer.imageryLayers.removeAll(true);
    }
}

class EntityDraw {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.initEvents();
    }

    activate(drawType) {
        this.deactivate();
        this.clear();
        this.drawType = drawType;
        this.positions = [];
        this.tempPositions = [];
        this.registerEvents();
        this.viewer.enableCursorStyle = false;
        this.viewer._element.style.cursor = 'default';
    }

    deactivate() {
        this.unRegisterEvents();
        this.drawType = undefined;
        this.drawEntity = undefined;

        this.viewer._element.style.cursor = 'pointer';
        this.viewer.enableCursorStyle = true;
    }

    clear() {
        if (this.drawEntity) {
            this.viewer.entities.remove(this.drawEntity);
            this.drawEntity = undefined;
        }
    }

    initEvents() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.DrawStartEvent = new Cesium.Event();
        this.DrawEndEvent = new Cesium.Event();
    }

    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    leftClickEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.position);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.position, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            this.positions.push(position);
            if (this.positions.length == 1) {
                this.handleFirstPosition();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    handleFirstPosition() {
        switch (this.drawType) {
            case "Point":
                this.generatePoint();
                this.drawEnd();
                break;
            case "Polyline":
                this.generatePolyline();
                break;
            case "Polygon":
                this.generatePolygon();
                break;
        }
    }

    generatePoint() {
        this.drawEntity = this.viewer.entities.add({
            position: this.positions[0],
            point: {
                pixelSize: 4,
                color: Cesium.Color.RED
            }
        })
    }

    generatePolyline() {
        this.drawEntity = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(e => {
                    return this.tempPositions;
                }, false),
                width: 2,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
            }
        })
    }

    generatePolygon() {
        this.drawEntity = this.viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.CallbackProperty(e => {
                    return new Cesium.PolygonHierarchy(this.tempPositions);
                }, false),
                material: Cesium.Color.RED.withAlpha(0.4),
                perPositionHeight: true
            },
            polyline: {
                positions: new Cesium.CallbackProperty(e => {
                    return this.tempPositions.concat(this.tempPositions[0]);
                }, false),
                width: 1,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
                depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }),
            }
        })
    }

    mouseMoveEvent() {
        this.handler.setInputAction(e => {
            this.viewer._element.style.cursor = 'default';
            let position = this.viewer.scene.pickPosition(e.endPosition);
            if (!position) {
                position = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (!position) return;
            if (!this.drawEntity) return;
            this.tempPositions = this.positions.concat([position]);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    rightClickEvent() {
        this.handler.setInputAction(e => {
            if (!this.drawEntity) {
                this.deactivate()
                return;
            }
            switch (this.drawType) {
                case "Polyline":
                    this.drawEntity.polyline.positions = this.positions;
                    this.minPositionCount = 2;
                    break;
                case "Polygon":
                    this.drawEntity.polygon.hierarchy = this.positions;
                    this.drawEntity.polyline.positions = this.positions.concat(this.positions[0]);
                    this.minPositionCount = 3;
                    break;
            }
            if (this.positions.length < this.minPositionCount) {
                this.clear();
                this.deactivate();
                return;
            }
            this.drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    drawEnd() {
        this.drawEntity.remove = () => {
            this.viewer.entities.remove(this.drawEntity);
        }
        this.DrawEndEvent.raiseEvent(this.drawEntity, this.positions, this.drawType);
        this.deactivate();
    }
}

export default { LimitHeightAnalysis, VisibilityAnalysis, BufferAnalysis, SightLine, Circle, Excavate, EntityDraw }