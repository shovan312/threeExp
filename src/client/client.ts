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
// import {rearrangeArr} from './helpers/general/transformations'
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
sceneBasicObjects.push(glassSphere)
///////////////////////////////
let lightControls = new Light({
i:lights[1], k:lights[0], j:lights[3], l:lights[2],
// C:lights[0], G:lights[1], E:lights[2], D:lights[3]
 })
let controls = new CameraControls(orbitControls, camera);
///////////////////////////////
sceneBasicObjects.forEach(object => scene.add(object))
// scene.background = cubeTexture;
scene.background = new THREE.Color(0x212121);
///////////////////////////////

let hilbert = new Hilbert([
new THREE.Vector3(-2,-2, 0),
new THREE.Vector3(-2,2, 0),
new THREE.Vector3(2,2, 0),
new THREE.Vector3(2,-2, 0),
], 3)
scene.add(hilbert.curve)
hilbert.curve.position.x = 15
hilbert.curve.rotation.y = Math.PI/2
hilbert.curve.scale.set(3,3,3)

let hilbert2 = hilbert.curve.clone()
hilbert2.position.x = -15
scene.add(hilbert2)

///////////////////////////////

let spiro = new Spiro(clockCoeff)
// spiro.wheels[0].position.z = -15
spiro.wheels[0].scale.set(1/2,1/2,1/2)
scene.add(spiro.wheels[0])

///////////////////////////////

const latticeMesh = getPointMesh(getCube(16).posArray);
scene.add(latticeMesh)
///////////////////////////////

let objLoaded:boolean = false;
const loadedObj = await loadObj('./obj/FinalBaseMesh.obj')
//@ts-ignore
let objMesh = loadedObj.children[0];
scene.add(objMesh)
objMesh.position.y = -10
objMesh.scale.set(0.5,0.5,0.5)
objMesh.material.wireframe = true

objLoaded = true

///////////////////////////////

let gltfLoaded:boolean = false;
const loadedGltf = await loadGltf('./gltf/mike/scene.gltf')
//@ts-ignore
let gltfMesh = loadedGltf.scene
scene.add(gltfMesh)
gltfMesh.position.y = 7
gltfMesh.position.x = 1.16
gltfMesh.scale.set(3,3,3)
gltfMesh.traverse ( ( o:any ) => {
        if ( o.isMesh ) {
        o.material.wireframe = true;;
        }
    } );

gltfLoaded = true

///////////////////////////////

let midiJson:Midi = await loadMidi('./midi/twinkle_twinkle.mid');
let midiController = new MidiController(midiJson)
let midiKeysPressed:any = {}

for(let i=0; i<midiJson.tracks.length; i++) {
    midiKeysPressed[''+i] = {}
}
// console.log(midiJson)
///////////////////////////////


function animate() {
    let time:number = clock.getElapsedTime()*1;

    gltfMesh.position.x = 10*Math.sin(time)
    objMesh.rotation.y = time/3

    spiro.drawTrail(time, true, 1/3, Math.PI)
    spiro.moveRadii(time, 1/3)
    spiro.wheels[0].position.z = -15 + 5*Math.sin(time)

    controls.updateCamera(camera, orbitControls, keysPressed, clock.getDelta())
    lightControls.updateLights(keysPressed, time)
    midiController.updateCursor(time, midiKeysPressed);
//     console.log(midiKeysPressed[0])

    for(let k in midiKeysPressed[0]) {
        if (midiKeysPressed[0][k] == true) {
            let scl = ((k as unknown as number) - 50)/20
            glassSphere.scale.set(scl,scl,scl)
            hilbert.curve.position.x += scl - 0.8
            hilbert2.position.x -= scl - 0.8
        }
    }
//     for(let k in midiKeysPressed[1]) {
//             if (midiKeysPressed[1][k] == true) {
//                 let scl = ((k as unknown as number) - 50)/20
//                 glassSphere.scale.set(scl,scl,scl)
//             }
//         }


    camera.updateProjectionMatrix()
    stats.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()
// renderer.setAnimationLoop(animate);
