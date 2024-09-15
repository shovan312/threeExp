import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { AxesHelper, GridHelper } from "three";
import {getCube, getPointMeshArr, getGeometryPoints, pointCloud, getBallPoints, getRingPoints} from './helpers/general/points'
import {rearrangeArr, wave, burn, morph, byX, byRandom} from './helpers/general/transformations'
import Stats from 'three/examples/jsm/libs/stats.module'
import { scene, clock, stats, camera, renderer, orbitControls,lights,makeHelperObjects, keysPressed} from "./setup";
import {loadObj} from "./loaders/gltf";
import {CameraControls} from "./controls/camera";

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

let sCube:pointCloud = getCube(10, new THREE.Vector3(-4, 0, 0), new THREE.Vector3(0.1, 0.1, 0.1))
sCube.posArray = rearrangeArr(sCube.posArray, byX)
const sCubeMesh = getPointMeshArr([...sCube.posArray], 0.1)
sCubeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(sCube.colors, 3))
scene.add(sCubeMesh)

let mCube:pointCloud = getCube(30, new THREE.Vector3(0, 4, 0), new THREE.Vector3(0.1, 0.1, 0.1))
mCube.posArray = rearrangeArr(mCube.posArray, byRandom)
const mCubeMesh = getPointMeshArr(mCube.posArray, 0.1)
mCubeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(mCube.colors, 3))
// scene.add(mCubeMesh)

let lCube:pointCloud = getCube(30, new THREE.Vector3(6, 0, 0), new THREE.Vector3(0.1, 0.1, 0.1))
// let lCube = getGeometryPoints(new THREE.TorusGeometry(2,.1), new THREE.Vector3(4,0,0))
const lCubeMesh = getPointMeshArr(lCube.posArray, 0.1)
lCubeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(lCube.colors, 3))
// scene.add(lCubeMesh)

const s2mLattice = getPointMeshArr([], 0.1);
scene.add(s2mLattice)
const m2lLattice = getPointMeshArr([], 0.1);
scene.add(m2lLattice)
const l2cLattice = getPointMeshArr([], 0.1);
scene.add(l2cLattice)
const c2sLattice = getPointMeshArr([], 0.1);
scene.add(c2sLattice)

let loadedObj:THREE.Group = await loadObj('obj/Cat.obj')
const objMesh:THREE.Mesh = loadedObj.children[0] as THREE.Mesh;
objMesh.geometry.rotateX(Math.PI/4)
objMesh.geometry.scale(0.1,0.1,0.1)
const objPoints = getGeometryPoints(objMesh.geometry)
const objPointsMesh = getPointMeshArr(objPoints.posArray)
objPointsMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(objPoints.colors, 3))
scene.add(objPointsMesh)

console.log(sCubeMesh)

function animate() {
    let time:number = clock.getElapsedTime()*1;

    sCubeMesh.geometry.rotateX(0.1)

    // for(let i=1; i<mCube.posArray.length; i+=3) {
    //     mCube.posArray[i] += Math.sin(time)/10
    //     mCubeMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(mCube.posArray, 3))
    // }

    // const newArray = wave([...sCube.posArray], 0.7, 0.5, 1, time)
    // const newArray = burn([...sCube.posArray],time/10)
    // sCubeMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(newArray, 3))

    const s2mFlowPoints:number[] = morph(sCube.posArray, mCube.posArray, time)
    s2mLattice.geometry.setAttribute('position', new THREE.Float32BufferAttribute(s2mFlowPoints, 3))
    const s2mFlowCols:number[] = morph(sCube.colors, mCube.colors, time)
    s2mLattice.geometry.setAttribute('color', new THREE.Float32BufferAttribute(s2mFlowCols, 3))

    const m2lFlowPoints:number[] = morph(mCube.posArray, lCube.posArray, time)
    m2lLattice.geometry.setAttribute('position', new THREE.Float32BufferAttribute(m2lFlowPoints, 3))
    const m2lFlowCols:number[] = morph(mCube.colors, lCube.colors, time)
    m2lLattice.geometry.setAttribute('color', new THREE.Float32BufferAttribute(m2lFlowCols, 3))

    const l2cFlowPoints:number[] = morph(lCube.posArray, objPoints.posArray, time)
    l2cLattice.geometry.setAttribute('position', new THREE.Float32BufferAttribute(l2cFlowPoints, 3))
    const l2cFlowCols:number[] = morph(lCube.colors, objPoints.colors, time)
    l2cLattice.geometry.setAttribute('color', new THREE.Float32BufferAttribute(l2cFlowCols, 3))

    const c2sFlowPoints:number[] = morph(objPoints.posArray, sCube.posArray, time)
    c2sLattice.geometry.setAttribute('position', new THREE.Float32BufferAttribute(c2sFlowPoints, 3))
    const c2sFlowCols:number[] = morph(objPoints.colors, sCube.colors, time)
    c2sLattice.geometry.setAttribute('color', new THREE.Float32BufferAttribute(c2sFlowCols, 3))

    controls.updateCamera(camera, orbitControls, keysPressed, clock.getDelta())
    // lightControls.updateLights(keysPressed, time)

    camera.updateProjectionMatrix()
    stats.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()
