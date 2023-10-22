import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import {AxesHelper, ColorRepresentation, CubeTexture, GridHelper, LineBasicMaterial} from "three";
import {Hilbert} from "./hilbert";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'


let material:LineBasicMaterial,sideLen=4, curves:Array<THREE.Line>=[],
    depth=1, colors:Array<number>=[],
    lines:Array<Array<THREE.Vector3>> = [],
maxDepth=6,seedVertices=0

let flowLine, flowText, nrmlText0, nrmlText1;
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
const clock = new THREE.Clock();
let ambientLight = new THREE.AmbientLight( 0xe7e7e7, 0.2 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

const spotLight = new THREE.SpotLight( 0x0000ff );
spotLight.position.set( 0, 10, 0 );

scene.add( spotLight );



new OrbitControls(camera, renderer.domElement);
// camera.position.set(0, 0, 18);

const gridHelper = new THREE.GridHelper(12, 12);
gridHelper.rotateX(Math.PI/2)
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

let axes:Array<AxesHelper> = []
for(let i=0; i<3; i++) {
    for(let j=0; j<3; j++) {
        for(let k=0; k<3; k++) {
            let axis = new THREE.AxesHelper(6);
            if (i==1 && j == 0 && k == 1) continue;
            // axis.position.set(
            //     25*(i-1),
            //         10*(j),
            //             25*(k-1)
            // )
            axis.position.x = 2*(9*i + 3*j + k - 13)
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

///////////////////////////////


// let h3 = new Hilbert([
//     new THREE.Vector3(-2,-2,0),
//     new THREE.Vector3(-2,2,0),
//     new THREE.Vector3(2,2,0),
//     new THREE.Vector3(2,-2,0),
// ], 2);
// let h4 = new Hilbert([
//     new THREE.Vector3(-2,-2,0),
//     new THREE.Vector3(-2,2,0),
//     new THREE.Vector3(2,2,0),
//     new THREE.Vector3(2,-2,0),
// ], 4);
// scene.add(h3.curve)
// scene.add(h4.curve)
// console.log(h3.curve.geometry.getAttribute('position'))
// console.log(h4.curve.geometry.getAttribute('position'))

// for(let k=0; k<7; k++) {
//     let currPoints:Array<THREE.Vector3> = hilbertTrans(h3.points, h4.points, k/10)
//     let flowGeo = new THREE.BufferGeometry().setFromPoints( currPoints )
//     let material:LineBasicMaterial = new THREE.LineBasicMaterial({
//         vertexColors: true
//     })
//     flowLine = new THREE.Line(flowGeo, material)
//     curves.push(flowLine)
//     flowLine.position.z = 3 + k/20
//     scene.add(flowLine)
// }

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

let sphere = new THREE.Mesh(
    new THREE.SphereGeometry(3, 50, 50),
    new THREE.MeshStandardMaterial({
        envMap: cubeRenderTarget.texture,
        // color: 'red',
        roughness: 0,
        metalness: 1,
    })
);
// scene.add(sphere)
sphere.position.z = -10

function hilbertTrans(from:Array<THREE.Vector3>, to:Array<THREE.Vector3>, howMuch:number):Array<THREE.Vector3>{
    let ret:Array<THREE.Vector3> = []
    for(let i = 0; i < from.length; i++) {
        ret.push(new THREE.Vector3(
            from[i].x + (to[i].x - from[i].x)*howMuch,
            from[i].y + (to[i].y - from[i].y)*howMuch,
            from[i].z + (to[i].z - from[i].z)*howMuch,
        ))
    }
    return ret;
}

let h3 = new Hilbert([
    new THREE.Vector3(-2,-2,0),
    new THREE.Vector3(-2,2,0),
    new THREE.Vector3(2,2,0),
    new THREE.Vector3(2,-2,0),
], 2);
scene.add(h3.curve);
h3.texture = cloudText;

function animate() {
    let time:number = clock.getElapsedTime()*1;

    // camera.position.y = 2*Math.sin(2*time)
    curves.map(c => {
        // c.position.x = 2*Math.sin(time);
        // c.position.y = 2*Math.cos(time)
        // c.position.z = Math.sin(time);
        return c;
    });

    let noize1 = perlin.noise(2*time,1,0)
    let startTime:number = 1

    if(time - startTime > 0 ) {
        h3.curve.geometry.dispose();
        scene.remove(h3.curve)
        let t = time - startTime
        // let depth = (1 + noize/1.333)
        let depth1 = (1 + noize1/1.333) + (4*Math.sin(t/3.5 - 3 ) / (t/3.5 - 3))
        // let depth = Math.min(2 + 3*Math.sin(t/4)*Math.sin(t), 6);
        scene.add(h3.update([
            new THREE.Vector3(-2,-2,0),
            new THREE.Vector3(-2,2,10*(0.5 + 0.5*Math.sin(t))),
            new THREE.Vector3(2,2,10*(0.5 + 0.5*Math.sin(t))),
            new THREE.Vector3(2,-2,0),
        ], depth1))
        //@ts-ignore
        h3.curve.material.dashOffset = -time/100
    }

    water.position.z = 4.8*Math.sin(time/3)
    camera.position.y = 2
    camera.position.z = 15*Math.sin(time/3)
    camera.position.x = 15*Math.cos(time/3)
    camera.rotation.y = Math.PI/2 - time/3

    // camera.rotation.x = Math.PI/8*Math.cos(time/3)
    cubeCamera.update( renderer, scene );
    // scene.rotation.y = 0.2*Math.sin(time)
    // scene.rotation.y = 0.2*time
    axesHelper.rotation.x = time
    for(let i=0; i<axes.length; i++) {
        // axes[i].position
        // axes[i].rotation.x += perlin.noise(time,i,0)/10
        // axes[i].rotation.y += perlin.noise(time,i,0)
        // axes[i].rotation.z += perlin.noise(time,i,0)
        axes[i].rotation.x = time
    }
    // for(let i=0; i<grids.length; i++) {
    //     grids[i].rotation.x += 0.2*perlin.noise(time,i,0)/10
    //     grids[i].rotation.y += 0.2*perlin.noise(time,i,0)
    //     grids[i].rotation.z += 0.2*perlin.noise(time,i,0)
    // }
    gridHelper.rotation.y = time
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
