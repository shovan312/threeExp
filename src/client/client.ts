import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { Water } from 'three/examples/jsm/objects/Water2.js';
import {
    AxesHelper,
    ColorRepresentation,
    CubeTexture,
    GridHelper,
    LineBasicMaterial,
    OrthographicCamera,
    Texture, Vector2
} from "three";
import {Line} from "./helpers/general/line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {SVGLoader, SVGResult} from 'three/examples/jsm/loaders/SVGLoader';
import { Spiro } from './helpers/spiro/spiro';
import Stats from 'three/examples/jsm/libs/stats.module'
import {
    scene,
    clock,
    stats,
    camera,
    renderer,
    orbitControls,
    textureLoader,
    lights
} from "./setup";
import {loadGltf} from "./loaders/gltf";
import {fract} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {CameraControls} from "./controls/camera";
import {Light} from "./controls/light";

/////////////////////////
let gridHelper:GridHelper, axesHelper:AxesHelper, axes:Array<AxesHelper>;
makeBackgroundObjects();
////////////////////////
let flowText:Texture=new Texture(), nrmlText0:Texture=new Texture(), nrmlText1:Texture=new Texture(), cubeTexture:CubeTexture, rainbowText:Texture=new Texture();
loadTextures()
///////////////////////////////
makeWater()
makeGlassSphere()
////////////////

cubeTexture = new THREE.CubeTextureLoader().load([
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png'
])
cubeTexture.anisotropy = 0.1
scene.background = cubeTexture

/////////////

let statueLoaded:boolean = false;



let lightControls = new Light({i:lights[0], j:lights[1], k:lights[2], l:lights[3]})

///////////////

let controls = new CameraControls(orbitControls, camera);
const keysPressed = {}
document.addEventListener('keydown', (event) => {
        (keysPressed as any)[event.key.toLowerCase()] = true
}, false);

document.addEventListener('keyup', (event) => {
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);

//////////////
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

///////////



function getColor(uv:THREE.Vector2, time:number):THREE.Vector3{
    let col = new THREE.Vector3(0,0,0)
    // if(time > 1 && time < 1.02) console.log(uv.x)
    uv.add(new THREE.Vector2(-0.5, -0.5))
    for(let i=0; i<1; i++) {
        uv.multiplyScalar(i+1)
        let r = uv.length();
        r = Math.sin(40*r - 3*time)
        col.add(new THREE.Vector3(r,0,0));


        let k = 2
        uv.x = uv.x%(1/k)
        uv.y = uv.y%(1/k)
        let r2 = 0
        r2 = uv.add(new THREE.Vector2(0.5*Math.sin(time),0.5*Math.cos(time))).length()
        col.add(new THREE.Vector3(Math.sin(r2*16-time), Math.sin(r2*16-time), 0.7))
    }

    // let col = new THREE.Vector3(0,0,0)
    // uv.add(new THREE.Vector2(-0.5, -0.5)).multiplyScalar(2)

    return col.multiplyScalar(4);
}



//////////

function makeBackgroundObjects() {
    gridHelper = new THREE.GridHelper(12, 12);
    gridHelper.rotateX(Math.PI / 2)
    // scene.add(gridHelper);
    axesHelper = new THREE.AxesHelper(4);
    // scene.add(axesHelper);
    axes = []
    for (let i = -2; i < 3; i++) {
        for (let j = -2; j < 3; j++) {
            for (let k = -2; k < 3; k++) {
                // if (i==1 && j == 0 && k == 1) continue;
                let axis = new THREE.AxesHelper(6);
                axis.position.set(25 * (i - 1), 10 * (j), 25 * (k - 1))
                axes.push(axis);
                // scene.add(axis)
            }
        }
    }
}

function loadTextures() {
    flowText = textureLoader.load('./Water_1_M_Flow.jpg');
    nrmlText0 = textureLoader.load('./Water_1_M_Normal.jpg');
    nrmlText1 = textureLoader.load('./Water_2_M_Normal.jpg');
    rainbowText = textureLoader.load('./rainbow.jpg')

    cubeTexture = new THREE.CubeTextureLoader().load([
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png'
    ])

    cubeTexture.anisotropy = 0.1
    // scene.background = cubeTexture
}

function makeWater() {
    let waterGeometry = new THREE.PlaneGeometry( 400, 400 );
    let waterHeight = 0.1
    let water = new Water( waterGeometry, {
        // color: '#42daf5',
        scale: 2,
        textureWidth: 1024,
        textureHeight: 1024,
        flowMap: flowText,
        normalMap0: nrmlText0,
        normalMap1: nrmlText1
    } );
    waterGeometry.computeVertexNormals();
    scene.add( water );

    water.position.y = waterHeight;
    water.rotation.x = Math.PI * - 0.5;

    let water2 = new Water( waterGeometry, {
        // color: '#42daf5',
        scale: 2,
        textureWidth: 1024,
        textureHeight: 1024,
        flowMap: flowText,
        normalMap0: nrmlText0,
        normalMap1: nrmlText1
    } );
    scene.add( water2 );

    water2.position.y =waterHeight -0.1;
    water2.rotation.x = Math.PI *  0.5;
}

function makeGlassSphere() {
    const glassMaterial = new THREE.MeshPhysicalMaterial({
    } as THREE.MeshPhysicalMaterialParameters);
    glassMaterial.color = new THREE.Color( 0xffffff );
    glassMaterial.clearcoat = 0.8;
    glassMaterial.ior = 1.15;
    glassMaterial.specularIntensity = 0.6;
    glassMaterial.roughness = 0.0;
    glassMaterial.thickness = 0.5;
    glassMaterial.transmission = 0.08;
    glassMaterial.sheen = 0.0;
    glassMaterial.sheenColor = new THREE.Color( 0xffffff );

    let sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), glassMaterial);
    sphere.castShadow = true;
    scene.add(sphere);
    sphere.position.z = -2
    sphere.position.y = 2
}
