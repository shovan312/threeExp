import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { AxesHelper,ColorRepresentation,CubeTexture,GridHelper,LineBasicMaterial,
OrthographicCamera,Texture, Vector2 } from "three";
import {Line} from "./helpers/general/line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {SVGLoader, SVGResult} from 'three/examples/jsm/loaders/SVGLoader';
import { Spiro } from './helpers/spiro/spiro';
import Stats from 'three/examples/jsm/libs/stats.module'
import { scene, clock, stats, camera, renderer, orbitControls, textureLoader,lights,makeHelperObjects, loadTextures,
 makeGlassSphere, makeWater, keysPressed} from "./setup";
import {loadGltf} from "./loaders/gltf";
import {fract} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {CameraControls} from "./controls/camera";
import {Light} from "./controls/light";
import {Hilbert} from "./helpers/hilbert/hilbert"
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

// sceneBasicObjects.push(gridHelper, axesHelper, ...axes)
///////////////////////////////
let water:THREE.Object3D, water2:THREE.Object3D;
[water, water2] = makeWater(flowText, nrmlText0, nrmlText1)
sceneBasicObjects.push(water, water2)

let glassSphere:THREE.Object3D = makeGlassSphere()
// sceneBasicObjects.push(glassSphere)
///////////////////////////////
let lightControls = new Light({i:lights[0], j:lights[1], k:lights[2], l:lights[3]})
let controls = new CameraControls(orbitControls, camera);
///////////////////////////////
sceneBasicObjects.forEach(object => scene.add(object))
scene.background = cubeTexture;
///////////////////////////////

let hilbert = new Hilbert([
new THREE.Vector3(-2,-2, 0),
new THREE.Vector3(-2,2, 0),
new THREE.Vector3(2,2, 0),
new THREE.Vector3(2,-2, 0),
], 3)
scene.add(hilbert.curve)

function animate() {
    let time:number = clock.getElapsedTime()*1;



    controls.updateCamera(camera, orbitControls, keysPressed, clock.getDelta())
    lightControls.updateLights(keysPressed, time)

    camera.updateProjectionMatrix()
    stats.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()
// renderer.setAnimationLoop(animate);
