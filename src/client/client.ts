import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { AxesHelper,ColorRepresentation,CubeTexture,GridHelper,LineBasicMaterial,
OrthographicCamera,Texture, Vector2 } from "three";
import {getCube, getPointMesh, getGeometryPoints, pointCloud, getBallPoints, getRingPoints} from './helpers/general/points'
import {rearrangeArr, wave, burn, morphArr, morph} from './helpers/general/transformations'
import Stats from 'three/examples/jsm/libs/stats.module'
import { scene, clock, stats, camera, renderer, orbitControls,lights,makeHelperObjects, keysPressed} from "./setup";
import {loadGltf, loadObj} from "./loaders/gltf";
import {CameraControls} from "./controls/camera";
import {Light} from "./controls/light";

/////////////////////////
let sceneBasicObjects:THREE.Object3D[] = []
////////////////////////
let gridHelper:GridHelper,
axesHelper:AxesHelper,
axes:Array<AxesHelper>;
[gridHelper, axesHelper, axes] = makeHelperObjects();

sceneBasicObjects.push(gridHelper)
let controls = new CameraControls(orbitControls, camera);
///////////////////////////////
sceneBasicObjects.forEach(object => scene.add(object))
scene.background = new THREE.Color(0x212121);

///////////////////////////////

let sCube:pointCloud = getCube(10, new THREE.Vector3(-40, 0, 0), new THREE.Vector3(0.1, 0.1, 0.1))
const sCubeMesh = getPointMesh(sCube.posArray, 0.1)
sCubeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(sCube.colors, 3))
// scene.add(sCubeMesh)

// let mCube:pointCloud = getCube(30, new THREE.Vector3(0, 40, 0), new THREE.Vector3(0.1, 0.1, 0.1))
let mCube:pointCloud = getBallPoints(4, .4, new THREE.Vector3(0,5,0))
const mCubeMesh = getPointMesh(mCube.posArray, 0.1)
mCubeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(mCube.colors, 3))
// scene.add(mCubeMesh)

// let lCube:pointCloud = getCube(30, new THREE.Vector3(60, 0, 0), new THREE.Vector3(0.1, 0.1, 0.1))
let lCube = getGeometryPoints(new THREE.TorusGeometry(2,.1), new THREE.Vector3(10,0,0))
const lCubeMesh = getPointMesh(lCube.posArray, 0.1)
lCubeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(lCube.colors, 3))
// scene.add(lCubeMesh)

const s2mLattice = getPointMesh(new Float32Array(0), 0.1);
scene.add(s2mLattice)
const m2lLattice = getPointMesh(new Float32Array(0), 0.1);
scene.add(m2lLattice)
const l2sLattice = getPointMesh(new Float32Array(0), 0.1);
scene.add(l2sLattice)

// let loadedObj:THREE.Group = await loadObj('obj/Cat.obj')
// const objMesh:THREE.Mesh = loadedObj.children[0] as THREE.Mesh;
// const objPoints = getGeometryPoints(objMesh.geometry)
// const objPointsMesh = getPointMesh(objPoints)
// console.log(objPoints)
// scene.add(objPointsMesh)


function animate() {
    let time:number = clock.getElapsedTime()*1;

    // const newArray:Float32Array = wave(lCube.posArray, 0.7, 0.5, 1, time)
    // const newArray:Float32Array = burn(lCube.posArray,time/10)
    // lCubeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(newArray, 3))

    const s2mFlowPoints:Float32Array = morph(sCube.posArray, mCube.posArray, time)
    s2mLattice.geometry.setAttribute('position', new THREE.BufferAttribute(s2mFlowPoints, 3))
    const s2mFlowCols:number[] = morphArr(sCube.colors, mCube.colors, time)
    s2mLattice.geometry.setAttribute('color', new THREE.Float32BufferAttribute(s2mFlowCols, 3))

    const m2lFlowPoints:Float32Array = morph(mCube.posArray, lCube.posArray, time)
    m2lLattice.geometry.setAttribute('position', new THREE.BufferAttribute(m2lFlowPoints, 3))
    const m2lFlowCols:number[] = morphArr(mCube.colors, lCube.colors, time)
    m2lLattice.geometry.setAttribute('color', new THREE.Float32BufferAttribute(m2lFlowCols, 3))

    const l2sFlowPoints:Float32Array = morph(lCube.posArray, sCube.posArray, time)
    l2sLattice.geometry.setAttribute('position', new THREE.BufferAttribute(l2sFlowPoints, 3))
    const l2sFlowCols:number[] = morphArr(lCube.colors, sCube.colors, time)
    l2sLattice.geometry.setAttribute('color', new THREE.Float32BufferAttribute(l2sFlowCols, 3))

    controls.updateCamera(camera, orbitControls, keysPressed, clock.getDelta())
    // lightControls.updateLights(keysPressed, time)

    camera.updateProjectionMatrix()
    stats.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()
