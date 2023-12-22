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
    Texture
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
    camera2,
    secondaryScene,
    lights
} from "./setup";
import {loadGltf} from "./gltf";
import {fract} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";

/////////////////////////
let gridHelper:GridHelper, axesHelper:AxesHelper, axes:Array<AxesHelper>;
makeBackgroundObjects();
////////////////////////
let flowText:Texture=new Texture(), nrmlText0:Texture=new Texture(), nrmlText1:Texture=new Texture(), cubeTexture:CubeTexture, rainbowText:Texture=new Texture();
loadTextures()
///////////////////////////////
makeWater()
// makeGlassSphere()
////////////////

// scene.add(new THREE.AxesHelper(20))
const gasStation = await loadGltf('gltf/gasStation/scene.gltf');

const planeWidth = 1.9, planeHeight = 2.4
if(!(camera2 instanceof OrthographicCamera)) {
    camera2.aspect = planeWidth/planeHeight
    camera2.updateProjectionMatrix()
}
const renderTarget = new THREE.WebGLRenderTarget(planeWidth*512, planeHeight*512);
const planeGeo  = new THREE.PlaneGeometry(planeWidth,planeHeight,2,2)

const planeMat = new THREE.MeshPhysicalMaterial({
    map: renderTarget.texture,
    // wireframe:true
})
// planeMat.vertexColors = true
const plane = new THREE.Mesh(planeGeo, planeMat)
plane.position.z = 0.82
plane.position.y = 1.15
camera2.position.set(plane.position.x,  plane.position.y , plane.position.z)

// scene.add(new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,plane.position.y,0), 100))

scene.add(plane)
//////////////

cubeTexture = new THREE.CubeTextureLoader().load([
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png'
])
cubeTexture.anisotropy = 0.1
secondaryScene.background = cubeTexture
// makeGlassSphere()
secondaryScene.add(new AxesHelper(10))

/////////////
let monoRes = 20
let monoGeo = new THREE.PlaneGeometry(10, 10, monoRes-1, monoRes-1);
let monoMat = new THREE.MeshPhysicalMaterial({
    vertexColors:true,
    side:THREE.DoubleSide
});
let monoMesh = new THREE.Mesh(monoGeo, monoMat);
secondaryScene.add(monoMesh)

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
secondaryScene.add(new THREE.AmbientLight())


///////////////

document.addEventListener('keydown', (e) => keyPressed(e));
function keyPressed(e:KeyboardEvent) {
    if (e.code === "KeyW") wPressed = !wPressed
    if (e.code === "KeyS") sPressed = !sPressed
    if (e.code === "KeyD") dPressed = !dPressed
    if (e.code === "KeyC") {
        cPressed = !cPressed
    }
}
let wPressed:boolean = false;
let dPressed:boolean = false
let cPressed:boolean = false
let sPressed:boolean = false;
let gltfLoaded:boolean = false;
let twoPiTime:number = 0;
let camSBool:boolean = true;


function animate() {
    let time:number = clock.getElapsedTime()*1;

    if(gltfLoaded == false && gasStation != undefined) {
        gltfLoaded = true;
        // @ts-ignore
        scene.add(gasStation.scene as THREE.Group)
    }



    // monoMesh.rotation.y += 0.005
    let monoCol = monoGeo.getAttribute('color').array
    for(let i=0; i<monoCol.length; i+=3) {
        const ind = Math.floor(i/3)
        const uv = new THREE.Vector2(Math.floor(ind/monoRes) / monoRes, ind%monoRes / monoRes)
        uv.add(new THREE.Vector2(-0.5, -0.5)).multiplyScalar(2)
        let r = uv.length();
        let col = new THREE.Vector3(-1,0,-1)
        col.add(new THREE.Vector3(Math.sin(r*16 - time*3), 0 ,Math.sin(r*16 - time*2)))

        let k = 3
        uv.x = uv.x%(1/k)
        uv.y = uv.y%(1/k)
        let r2 = uv.add(new THREE.Vector2(0.5*Math.sin(time),0.5*Math.cos(time))).length()
        col.add(new THREE.Vector3(Math.sin(r2*16-time), Math.sin(r2*16-time), 0.7))

        monoCol[i + 0] = 10*col.x
        monoCol[i + 1] = 10*col.y
        monoCol[i + 2] = 10*col.z
    }
    monoGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(monoCol), 3))

    if(scene.rotation.y < 2*Math.PI) {
        scene.rotation.y += 0.005
        twoPiTime = time

        let t = 2*Math.PI - scene.rotation.y
        camera.position.y = Math.max(plane.position.y + 0.5, 2.3*t )
        camera.position.z = Math.max(15.39, 10*t)
    }
    else {
        plane.position.set(plane.position.x,plane.position.y,Math.max(0.83, Math.min((time-twoPiTime)*1.3, 14)))

        camera.position.x = 0.259
        camera.position.y = plane.position.y + 0.5
        orbitControls.zoomSpeed=0.02
    }

    if (sPressed) {
        if (camSBool) {
            // camera.position.z = 8.5
            camSBool=false
        }
        renderer.render(secondaryScene, camera)
    }
    else {
        if(scene.rotation.y > Math.PI/2) {
            renderer.setRenderTarget(renderTarget);
            renderer.render(secondaryScene, camera2);
            renderer.setRenderTarget(null);
        }
        renderer.render(scene, camera)
    }

    camera2.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z)
    camera2.position.set(plane.position.x, plane.position.y, plane.position.z+10)

    camera.updateProjectionMatrix()

    stats.update()
    requestAnimationFrame(animate)
}
animate()
// renderer.setAnimationLoop(animate);

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
    secondaryScene.add(sphere);
    sphere.position.z = -2
    sphere.position.y = 2
}
