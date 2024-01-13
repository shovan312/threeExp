import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { AxesHelper,ColorRepresentation,CubeTexture,GridHelper,LineBasicMaterial,
OrthographicCamera,Texture, Vector2 } from "three";
import {Line} from "./helpers/general/line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {SVGLoader, SVGResult} from 'three/examples/jsm/loaders/SVGLoader';
import { Spiro } from './helpers/spiro/spiro';
import {clockCoeff} from './helpers/spiro/coefficients'
import {getCube, getPointMesh} from './helpers/general/points'
import {rearrangeArr, wave, burn, morph} from './helpers/general/transformations'
import Stats from 'three/examples/jsm/libs/stats.module'
import { scene, clock, stats, camera, renderer, orbitControls, textureLoader,lights,makeHelperObjects, loadTextures,
 makeGlassSphere, makeWater, keysPressed} from "./setup";
import {loadGltf, loadObj} from "./loaders/gltf";
import {fract} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {CameraControls} from "./controls/camera";
import {Light} from "./controls/light";
import {Hilbert} from "./helpers/hilbert/hilbert"
import {loadMidi, MidiController} from "./controls/midi"
import {Midi} from "@tonejs/midi";
//@ts-ignore
import vertexShader from './shaders/vertexbasic.glsl'
//@ts-ignore
import fragmentShader from './shaders/raymarching.glsl'


/////////////////////////
let sceneBasicObjects:THREE.Object3D[] = []
////////////////////////
let flowText:Texture,nrmlText0:Texture,nrmlText1:Texture,rainbowText:Texture,cubeTexture:Texture;
[flowText, nrmlText0, nrmlText1, rainbowText, cubeTexture] = loadTextures()
/////////////////////////
let gridHelper:GridHelper,
axesHelper:AxesHelper,
axes:Array<AxesHelper>;
[gridHelper, axesHelper, axes] = makeHelperObjects();

sceneBasicObjects.push(gridHelper)
///////////////////////////////
let water:THREE.Object3D, water2:THREE.Object3D;
[water, water2] = makeWater(flowText, nrmlText0, nrmlText1)
// sceneBasicObjects.push(water, water2)

let glassSphere:THREE.Object3D = makeGlassSphere()
// sceneBasicObjects.push(glassSphere)
///////////////////////////////
let lightControls = new Light({
i:lights[1], k:lights[0], j:lights[3], l:lights[2]
 })
let controls = new CameraControls(orbitControls, camera);
///////////////////////////////
sceneBasicObjects.forEach(object => scene.add(object))
scene.background = cubeTexture;
// scene.background = new THREE.Color(0x212121);
///////////////////////////////

let monoRes = 200
let monoGeo = new THREE.PlaneGeometry(10, 10, monoRes-1, monoRes-1);
let monoMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});
monoMat.uniforms.uTime = {value: 0}
monoMat.uniforms.uMouse = {value: new THREE.Vector2(1/2,1/2)}


let monoMesh = new THREE.Mesh(monoGeo, monoMat);
scene.add(monoMesh)
monoMesh.position.z = 0.02

document.onmousemove = function (e) {
    monoMat.uniforms.uMouse = {value: new THREE.Vector2(e.pageX/window.innerWidth, e.pageY/window.innerHeight)}
//     console.log(monoMat.uniforms.uMouse.value.x, monoMat.uniforms.uMouse.value.y)
}


function animate() {
    let time:number = clock.getElapsedTime()*1;

//     controls.updateCamera(camera, orbitControls, keysPressed, clock.getDelta())
    lightControls.updateLights(keysPressed, time)

    monoMat.uniforms.uTime.value = time;
//     console.log(monoMat.uniforms.uMouse.x)
    camera.updateProjectionMatrix()
    stats.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()
// renderer.setAnimationLoop(animate);

function map(p:THREE.Vector3, time:number):number {
    return p.length() - 1 + Math.sin(time)/2
}

function getColor(uv:THREE.Vector2, time:number):THREE.Color{
    let ro = new THREE.Vector3(0,0,-3)
    let rd = new THREE.Vector3(uv.x,uv.y,1)
    rd.normalize()
//     if (time > 0.3 && time < 0.4 && uv.x < -0.97 && uv.y < -0.97) console.log(rd)

    let col = new THREE.Vector3(0,0,0)

    let t=0;

    //RayMarching
    for(let i=0; i<40; i++) {
        let p = ro.clone().add(rd.clone().multiplyScalar(t))

        let d = map(p, time)
//         if (time > 0.3 && time < 0.4 &&
//             Math.abs(uv.x) < 0.01 && Math.abs(uv.y) < 0.01 &&
// //             uv.x < -0.97 && uv.y < -0.97 &&
//             i < 9
//             ) {console.log(i, ro)}
        t += d;
        if (t > 20) break;
        if (d < 0.001) break;
    }

    col = new THREE.Vector3(t*0.2,t*0.2,t*0.2)

    let ret = new THREE.Color(col.x, col.y, col.z)
    return ret.convertSRGBToLinear();
}