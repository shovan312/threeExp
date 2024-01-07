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
import {Line} from "./line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {SVGLoader, SVGResult} from 'three/examples/jsm/loaders/SVGLoader';
import { Spiro } from './spiro';
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
import {loadGltf} from "./gltf";
import {fract} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {Controls} from "./controls";
import {LightControls} from "./lightcontrols";

/////////////////////////
let gridHelper:GridHelper, axesHelper:AxesHelper, axes:Array<AxesHelper>;
makeBackgroundObjects();
////////////////////////
let
    flowText:Texture=new Texture(),
    nrmlText0:Texture=new Texture(),
    nrmlText1:Texture=new Texture(),
    cubeTexture:CubeTexture,
    rainbowText:Texture=new Texture(),
    glassRainbowText:Texture=new Texture(),
    disturbText:Texture=new Texture()
loadTextures()
///////////////////////////////
makeWater()
// makeGlassSphere()
////////////////

let statueObj = await loadGltf('gltf/poly/scene.gltf')
let statue:THREE.Group = new THREE.Group();
let statueGeo:THREE.BufferGeometry = new THREE.BufferGeometry();
let statueMat:THREE.Material|THREE.Material[] = new THREE.Material();

///////////////

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
// makeGlassSphere()
scene.add(new AxesHelper(10))

/////////////
let monoRes = 200
let monoGeo = new THREE.PlaneGeometry(10, 10, monoRes-1, monoRes-1);
let monoMat = new THREE.MeshPhysicalMaterial({
    vertexColors:true,
    side:THREE.DoubleSide
});
let monoMesh = new THREE.Mesh(monoGeo, monoMat);
// scene.add(monoMesh)
// adding a color attribute

const monoPosLen = monoGeo.getAttribute('position').count;
const mono_color_array = [];
let i = 0;
while(i < monoPosLen){
    mono_color_array.push(i/monoPosLen,0,0);
    i += 1;
}
const mono_color_attribute = new THREE.BufferAttribute(new Float32Array(mono_color_array), 3);
monoGeo.setAttribute('color', mono_color_attribute);
// scene.add(new THREE.AmbientLight(0xffffff))

///////////////

let statueLoaded:boolean = false;

let nearLight = new THREE.SpotLight(0xff0000, 100, 0, Math.PI/3)
nearLight.map = disturbText;
nearLight.position.y = 10
nearLight.position.z = 5
nearLight.castShadow=true
scene.add(nearLight)
let nearLightHelper = new THREE.SpotLightHelper(nearLight)
// scene.add(nearLightHelper)

let rightLight = new THREE.SpotLight(0x00ff00, 100, 0, Math.PI/3)
rightLight.map = disturbText;
rightLight.position.y = 10
rightLight.position.x = 5
scene.add(rightLight)
let rightLightHelper = new THREE.SpotLightHelper(rightLight)
// scene.add(rightLightHelper)

let farLight = new THREE.SpotLight(0xff00ff, 100, 0, Math.PI/3)
farLight.map = disturbText;
farLight.position.y = 10
farLight.position.z = -5
scene.add(farLight)
let farLightHelper = new THREE.SpotLightHelper(farLight)
// scene.add(farLightHelper)

let leftLight = new THREE.SpotLight(0xff7700, 100, 0, Math.PI/3)
leftLight.map = disturbText;
leftLight.position.y = 10
leftLight.position.x = -5
scene.add(leftLight)
let leftLightHelper = new THREE.SpotLightHelper(leftLight)
// scene.add(leftLightHelper)

let topLight = new THREE.SpotLight(0xffffff, 100, 0, Math.PI/6)
topLight.map = disturbText;
topLight.position.y = 15
scene.add(topLight)
let topLightHelper = new THREE.SpotLightHelper(topLight)
// scene.add(topLightHelper)

let insideLight = new THREE.PointLight(0xffffff, 10)
scene.add(insideLight)

let lightControls = new LightControls({i:farLight, j:leftLight, k:nearLight, l:rightLight, o:topLight})

let room = new THREE.Mesh(new THREE.BoxGeometry(9,9,9), new THREE.MeshPhysicalMaterial({side:THREE.BackSide}))
room.position.y = 3
room.receiveShadow=true
scene.add(room)

///////////////

const keysPressed = {}
document.addEventListener('keydown', (event) => {
        (keysPressed as any)[event.key.toLowerCase()] = true
}, false);
document.addEventListener('keyup', (event) => {
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);

let controls = new Controls(orbitControls, camera);


//////////////
function animate() {
    let time:number = clock.getElapsedTime()*1;

    if(statueObj!=undefined  && !statueLoaded) {
        //@ts-ignore
        statue = statueObj.scene as THREE.Group
        statue.castShadow=true
        scene.add(statue)
        // statue.position.set(3,3.5,18)
        statue.position.set(0,3.5,0)
        statue.scale.set(60,60,60)
        statueLoaded = true

        // statueGeo = (statue.children[0].children[0].children[0] as THREE.Mesh).geometry
        // statueMat = (statue.children[0].children[0].children[0] as THREE.Mesh).material as THREE.Material

        //@ts-ignore
        // statueMat.wireframe = true
    }
    if(statueLoaded) {
        if(3*Math.PI/2 + time/5 < 7/2*Math.PI) {
            insideLight.position.y = 5 + 5*Math.sin(3*Math.PI/2 + time/5)
            statue.position.y = 5 + 5*Math.sin(3*Math.PI/2 + time/5)
        }
        statue.rotation.y += 0.01
    }

    // let statuePos = statueGeo.getAttribute('position').array as Float32Array
    // let statueNormal = statueGeo.getAttribute('normal').array
    // for(let i=0; i<statuePos.length; i+=3) {
    //     let currPos = new THREE.Vector3(statuePos[i], statuePos[i+1], statuePos[i+2])
    //     let currNormal = new THREE.Vector3(statueNormal[i], statueNormal[i+1], statueNormal[i+2])
    //
    //
    //     statuePos[i] = currPos.x
    //     statuePos[i+1] = currPos.y
    //     statuePos[i+2] = currPos.z
    // }
    // statueGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(statuePos), 3))

    let monoCol = monoGeo.getAttribute('color').array
    for(let i=0; i<monoCol.length; i+=3) {
        const ind = Math.floor(i/3)
        const uv = new THREE.Vector2(ind%monoRes / (monoRes-1), Math.floor(ind/monoRes) / (monoRes-1))

        // if(time > 1 && time < 1.02) console.log(ind, uv)

        let col = getColor(uv, time);

        monoCol[i + 0] = col.x
        monoCol[i + 1] = col.y
        monoCol[i + 2] = col.z
    }
    monoGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(monoCol), 3))

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
    glassRainbowText = textureLoader.load('./glass-rainbow.jpg')
    disturbText = textureLoader.load('./disturb.jpg')

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

