import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import {AxesHelper, ColorRepresentation, CubeTexture, GridHelper, LineBasicMaterial} from "three";
import {Hilbert} from "./hilbert";
import {Line} from "./line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
const MeshLine = require('three.meshline').MeshLine;
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;
import {complex} from 'ts-complex-numbers';

// P = sum(an*(e^int))
type coefficients = Array<{
    n: number,
    an: complex
}>

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
camera.position.set(0, 0, 38);

const clock = new THREE.Clock();
let ambientLight = new THREE.AmbientLight( 0xe7e7e7, 0.2 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

const spotLight = new THREE.SpotLight( 0x0000ff );
spotLight.position.set( 0, 10, 0 );

scene.add( spotLight );

new OrbitControls(camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(12, 12);
gridHelper.rotateX(Math.PI/2)
// scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

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
            // scene.add(axis)
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

const svgLoader = new SVGLoader();
svgLoader.load(
	// resource URL
	'svg/shovan.svg',
	// called when the resource is loaded
	function ( data ) {

		const paths = data.paths;
        console.log(data)
		const group = new THREE.Group();

		for ( let i = 0; i < paths.length; i ++ ) {

			const path = paths[ i ];

            for(let i=0; i<path.subPaths[0].curves.length; i++) {
                const curve1:THREE.Curve<THREE.Vector2> = path.subPaths[0].curves[i]
                const pointsArr = curve1.getPoints(19);
                let geometry = new THREE.BufferGeometry().setFromPoints(pointsArr);
                
                const svgLine = new Line(pointsArr.map(vec2 => new THREE.Vector3(vec2.x/10, vec2.y/10, 0)), glassRainbowText);
                // scene.add(svgLine.curve)
            }

			const material = new THREE.MeshBasicMaterial( {
				color: path.color,
				side: THREE.DoubleSide,
				depthWrite: false
			} );

			const shapes = SVGLoader.createShapes( path );

			for ( let j = 0; j < shapes.length; j ++ ) {

				const shape = shapes[ j ];
				const geometry = new THREE.ShapeGeometry( shape );
				const mesh = new THREE.Mesh( geometry, material );
				group.add( mesh );

			}
		}
		// scene.add( group );

	}
);
///////////////////////////////

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
// scene.add( water );

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
// waterGeometry.computeVertexNormals();
// scene.add( water2 );

water2.position.y = -0.1;
water2.rotation.x = Math.PI *  0.5;

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

sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), glassMaterial);
sphere.position.set(2,2,3)
sphere.castShadow = true;
// scene.add(sphere);

const spiroCoeff:coefficients = [
    {n:3, an:new complex(8,0)},
    {n:-13, an:new complex(8/2,0)},
    {n:11, an:new complex(0, 8/3)},
]

// const spiroCoeff:coefficients = [
//     {n:-7, an:new complex(-0.0827113100467,0)},
//     {n:-3, an:new complex(-0.4503171322,0)},
//     {n:1, an:new complex(-4.0528541922,0)},
//     {n:5, an:new complex(-0.16211416769,0)},
//     {n:9, an:new complex(-0.05003523694,0)},
// ]

const spiroPoints:Array<THREE.Vector3> = getSpiroPoints(spiroCoeff);
const spiroLine = new Line(spiroPoints, glassRainbowText);
scene.add(spiroLine.curve)


function animate() {
    let time:number = clock.getElapsedTime()*1;
    
    cubeCamera.update( renderer, scene );
    axesHelper.rotation.x = time
    for(let i=0; i<axes.length; i++) {
        // axes[i].position
        axes[i].rotation.x += perlin.noise(time,i,0)/10
        axes[i].rotation.y += perlin.noise(time,i,0)
        axes[i].rotation.z += perlin.noise(time,i,0)
        axes[i].rotation.x = time
    }
    gridHelper.rotation.y = time

    // spiroLine.curve.rotateY(0.02)
    //@ts-ignore
    spiroLine.curve.material.dashOffset = time/100

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function getSpiroPoints(coefficients:coefficients):Array<THREE.Vector3>{
    let spiroPoints = []
    let thetaStart = 0;
    let thetaEnd = 2*Math.PI;
    let thetaResolution = 500;

    for(let i=0; i<=thetaResolution; i++) {
        let r = new complex(0,0)
        for(let j=0; j<coefficients.length; j++) {
            const theta = thetaStart + i * (thetaEnd - thetaStart) / thetaResolution
            const z = coefficients[j].an
            
            const I = new complex(0,1)
            r = r.add(z.mult(I.scalarMult(coefficients[j].n).scalarMult(theta).exp()))
        }
        spiroPoints.push(new THREE.Vector3(r.real, r.img, 0))
    }
    return spiroPoints;
}
