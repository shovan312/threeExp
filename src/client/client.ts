import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import {
    AxesHelper, CubeCamera,
    CubeTexture,
    SpotLight,
} from "three";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

let flowText, nrmlText0, nrmlText1;
const perlin = new ImprovedNoise();
/////////////////////////
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x515151);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 4, 10);

const clock = new THREE.Clock();
// let ambientLight = new THREE.AmbientLight( 0xe7e7e7, 0.2 );
// scene.add( ambientLight );

// const directionalLight = new THREE.DirectionalLight( 0xffffff, 5 );
// scene.add( directionalLight );

const spotLights:Array<SpotLight> = [];
for(let i=0; i<17; i++) {
    const spotLight = new THREE.SpotLight( 0xffffff , 10, 0, Math.PI/4);
    spotLight.position.set( 0, i*10/17, 2 );
    scene.add(spotLight)
    spotLights.push(spotLight);
}

// scene.add( spotLight );

new OrbitControls(camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(12, 12);
// gridHelper.rotateX(Math.PI/2)
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

let axes:Array<AxesHelper> = []
for(let i=0; i<3; i++) {
    for(let j=0; j<3; j++) {
        for(let k=0; k<3; k++) {
            let axis = new THREE.AxesHelper(6);
            if (i==1 && j == 0 && k == 1) continue;
            axis.position.set(
                25*(i-1),
                    10*(j),
                        25*(k-1)
            )
            // axis.position.x = 2*(9*i + 3*j + k - 13)
            axes.push(axis)
            scene.add(axis)
        }
    }
}

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256 );
cubeRenderTarget.texture.type = THREE.HalfFloatType;

const cubeCamera = new THREE.CubeCamera( 1, 1000, cubeRenderTarget );
const loader = new THREE.TextureLoader();
flowText = loader.load('./Water_1_M_Flow.jpg');
nrmlText0 = loader.load('./Water_1_M_Normal.jpg');
nrmlText1 = loader.load('./Water_2_M_Normal.jpg');
let glassRainbowText = loader.load('./glass-rainbow.jpg');
let paperText = loader.load('./paper.png');
let whitePaintText = loader.load('./white-paint.jpg');
let cloudText = loader.load('./cloud.png');
////////
const fbxLoader:FBXLoader = new FBXLoader();
function loadObj( path:string, name:string ):Promise<THREE.Group>{
    return new Promise(function( resolve, reject ){
        let progress = undefined;
        fbxLoader.setPath( path );
        fbxLoader.load( name, resolve, progress, reject );
    });
}
let manGroup:THREE.Group = await loadObj("anims/", 'StandingClap.fbx')
const manMesh:THREE.Mesh = manGroup.children[0] as THREE.Mesh;
scene.add(manGroup)
////////
manGroup.scale.setScalar(0.03)
    let anim = manGroup.animations;
    let mixer = new THREE.AnimationMixer(manGroup);
    const clip =anim[0];
    const action = mixer.clipAction(clip);
    action.enabled = true;
    // action.time = 0.0;
    action.play()


/////////////
// gui = new GUI();
let cubeTexture:CubeTexture = new THREE.CubeTextureLoader().load([
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png',
    'paperSquare.png'
])

cubeTexture.anisotropy = 0.1
scene.background = cubeTexture


let waterGeometry = new THREE.PlaneGeometry( 80, 80 );
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

water.position.y = -0;
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
waterGeometry.computeVertexNormals();
scene.add( water2 );

water2.position.y = -0.1;
water2.rotation.x = Math.PI *  0.5;

// let sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(40, 50, 50),
//     new THREE.MeshPhysicalMaterial({
//         envMap: camera.,
//         color: 0x11ffff,
//         roughness: 0.2,
//         metalness: 1,
//     })
// );
// // scene.add(sphere)
let mirrorSphereCamera : CubeCamera = new THREE.CubeCamera( 0.1, 5000, new THREE.WebGLCubeRenderTarget());

scene.add( mirrorSphereCamera );
let sphereGeom = new THREE.SphereGeometry(2, 50, 50);
var mirrorSphereMaterial = new THREE.MeshPhysicalMaterial( {
    envMap: mirrorSphereCamera.renderTarget.texture ,
    color: 0x11ffff,
    roughness: 0.2,
    metalness: 1,

} );
let mirrorSphere = new THREE.Mesh( sphereGeom, mirrorSphereMaterial );
// mirrorSphere.position.set(75,50,0);
mirrorSphereCamera.position.set(mirrorSphere.position.x,mirrorSphere.position.y,mirrorSphere.position.z);
scene.add(mirrorSphere);
mirrorSphere.position.z = 10
mirrorSphere.position.y = 4
mirrorSphere.position.x = 0


function animate() {
    let time:number = clock.getElapsedTime()*1;
    scene.rotateY(0.006)
    camera.lookAt(new THREE.Vector3(0,3,0))
    cubeCamera.update( renderer, scene );
    renderer.render(scene, camera);

    for(let i=0; i<spotLights.length; i++) {
        // spotLights[i].position.set(2*Math.cos(4*time + i/3),4*Math.sin(time), 2*Math.sin(4*time + i/3))
        // spotLights[i].lookAt(new THREE.Vector3(0,0,0))
        spotLights[i].position.z = 2*Math.sin(4*time + i/3)
        spotLights[i].position.x = 2*Math.cos(4*time + i/3)
    }
    mixer.update(1/100)
    // mirrorSphere.position.set(10*Math.sin(time/2), 4, 10*Math.cos(time/2))

    mirrorSphere.visible = false;
    mirrorSphereCamera.update(renderer, scene);
    mirrorSphere.visible = true;

    if(time > 5) {

    }
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
