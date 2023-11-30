import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { Water } from 'three/examples/jsm/objects/Water2.js';
import {AxesHelper, ColorRepresentation, CubeTexture, GridHelper, LineBasicMaterial} from "three";
import {Hilbert} from "./hilbert";
import {Line} from "./line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
const MeshLine = require('three.meshline').MeshLine;
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;
import {complex} from 'ts-complex-numbers';
import { Spiro } from './spiro';

// P = sum(an*(e^int))
type coefficients = Array<{
    n: number,
    an: complex
}>


let svgCoeffs:coefficients
let svgSpirograph:Spiro;

let  flowText, nrmlText0, nrmlText1;
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
camera.position.set(0, 0, 58);

// const camera = new THREE.OrthographicCamera(
//     -1*window.innerWidth / window.innerHeight,1*window.innerWidth / window.innerHeight,1,-1,
//     0.1,
//     1000
// );
// camera.zoom = 0.06
// camera.position.set(0, 0, 180);

const clock = new THREE.Clock();
let ambientLight = new THREE.AmbientLight( 0xe7e7e7, 0.2 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

const spotLight = new THREE.SpotLight( 0x0000ff );
spotLight.position.set( 0, 10, 0 );

scene.add( spotLight );

const orbitControls = new OrbitControls(camera, renderer.domElement);

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
let gui = new GUI();


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
	'svg/bottle.svg',
	function ( data ) {
		const paths = data.paths;
		const group = new THREE.Group();

		for ( let pathNum = 0; pathNum < paths.length; pathNum ++ ) {
			const path = paths[pathNum];
            const curveDivisions = 20;
            const scale = -1/6;
            let allPoints = []
            for(let j=0; j<path.subPaths[0].curves.length; j++) {
                const curve:THREE.Curve<THREE.Vector2> = path.subPaths[0].curves[j]
                const pointsArr:THREE.Vector2[] = curve.getPoints(curveDivisions - 1).map(vec => new THREE.Vector2(vec.x*scale, vec.y*scale));
                let geometry = new THREE.BufferGeometry().setFromPoints(pointsArr);
                // scene.add(svgLine.curve)
                allPoints.push(...pointsArr)
            }

            allPoints = allPoints.map(point => new THREE.Vector3(point.x, point.y, 0))
            const svgLine = new Line(allPoints, undefined, new THREE.Color(0xff0000)); 
            const com=getCenterOfMass(allPoints);
            svgLine.curve.position.set(-com.x, -com.y, -com.z)

            ///////
            svgCoeffs = getCoeffs(allPoints,6)
            svgCoeffs.sort((x, y) => -Math.abs(x.an.mag()) + Math.abs(y.an.mag()))
            svgSpirograph = new Spiro(svgCoeffs)

            //SVG image
			// const material = new THREE.MeshBasicMaterial( {
			// 	color: path.color,
			// 	side: THREE.DoubleSide,
			// 	depthWrite: false
			// } );
			// const shapes = SVGLoader.createShapes( path );
			// for ( let j = 0; j < shapes.length; j ++ ) {
			// 	const shape = shapes[ j ];
			// 	const geometry = new THREE.ShapeGeometry( shape );
			// 	const mesh = new THREE.Mesh( geometry, material );
			// 	group.add( mesh );
			// }
		}
		// scene.add( group );
	}
);

///////////////////////////////

let waterGeometry = new THREE.PlaneGeometry( 400, 400 );
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
    {n:5, an:new complex(10, 8/3)},
    {n:1, an:new complex(8,0)},
    {n:-7, an:new complex(4,10/3)},
    // {n:13, an:new complex(5/3, 2/3)},
    // {n:-29, an:new complex(0.8, 0)},
    // {n:49, an:new complex(0.1, 0.2)}
]

//square
// const spiroCoeff:coefficients = [
//     {n:-7, an:new complex(-0.0827113100467,0)},
//     {n:-3, an:new complex(-0.4503171322,0)},
//     {n:1, an:new complex(-4.0528541922,0)},
//     {n:5, an:new complex(-0.16211416769,0)},
//     {n:9, an:new complex(-0.05003523694,0)},
// ]

let spirograph = new Spiro(spiroCoeff)
const spiroPoints:Array<THREE.Vector3> = spirograph.getSpiroPoints(spiroCoeff);

document.addEventListener('keydown', (e) => keyPressed(e));
function keyPressed(e:KeyboardEvent) {
    if(e.code === "KeyW") {
        wPressed = (wPressed && false) || (!wPressed && true)
    }
    if(e.code === "KeyS") {
        sPressed =  (sPressed && false) || (!sPressed && true)
    }
    if(e.code === "KeyD") {
        dPressed = true
    }
}
let wPressed:boolean = false;
let sPressed:boolean = false;
let dPressed:boolean = false
let svgLoaded:boolean = false;
function animate() {
    let time:number = clock.getElapsedTime()*1;
    gridHelper.rotation.y = time
    cubeCamera.update( renderer, scene );
    // axesHelper.rotation.x = time
    // for(let i=0; i<axes.length; i++) {
    //     axes[i].rotation.x += perlin.noise(time,i,0)/10
    //     axes[i].rotation.y += perlin.noise(time,i,0)
    //     axes[i].rotation.z += perlin.noise(time,i,0)
    //     axes[i].rotation.x = time
    // }

    if (svgSpirograph == undefined) {
        renderer.render(scene, camera);
    }
    else {
        if (!svgLoaded) {
            scene.add(svgSpirograph.wheels[0])
            svgLoaded = true
        }
        let k=1/2
        svgSpirograph.moveRadii(time, true, k, Math.PI)
        // followCursor(svgSpirograph.wheels, orbitControls, camera, time, 3)
        enableSceneChange(svgSpirograph.line, svgSpirograph.wheels, renderer, camera)

        if(time > 2*Math.PI) {
            let transformScale = 0.995
            //giving error when target has extra n. need to add wheels dynamically
            // svgSpirograph.coeffs = tranformCoeffs(svgSpirograph.coeffs, spiroCoeff, Math.min(1, (time-2*Math.PI)/500))

            // scene.remove(svgSpirograph.wheels[0])
            // scene.add(svgSpirograph.update())
            // for(let i=1; i<svgSpirograph.coeffs.length; i++) {
            //     svgSpirograph.coeffs[i].an = svgSpirograph.coeffs[i].an.scalarMult(transformScale)       
            // }
        }
    }
    
    // renderer.render(scene, camera);

}

function enableSceneChange(line:Line, wheels:Array<THREE.Mesh>, renderer:THREE.Renderer, camera:THREE.PerspectiveCamera) {
    if (wPressed) {
        line.options.color = 0x13d69c
        renderer.render(wheels[0], camera);
    }
    else {
        line.options.color = 0x000000
        renderer.render(scene, camera);
    }
}

function followCursor(wheels:Array<THREE.Mesh>, orbitControls:OrbitControls, camera:THREE.PerspectiveCamera, time:number, speed:number) {
    const cursorPos = new THREE.Vector3()
    wheels[wheels.length-2].getWorldPosition(cursorPos);
    orbitControls.target = cursorPos.clone();
    orbitControls.position0.set(0,0,0);
    // orbitControls.object.position.set(cursorPos.x, cursorPos.y, cursorPos.z-5-time)
    camera.position.set(cursorPos.x, cursorPos.y, Math.min(20, cursorPos.z-10-time*speed))
    orbitControls.update()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function getIthCoeff(f: Array<complex>, n: number):complex {
    let sum = new complex(0,0);
    for(let i=0; i<f.length-1; i++) {
        const curr = f[i];
        const next = f[i+1];

        //e^(i*-n*theta) 
        const I = new complex(0, 1);
        const theta = 2*Math.PI*(i/f.length)
        const exp = I.scalarMult(-n*theta).exp();

        sum = sum.add(curr.mult(exp).scalarMult(2*Math.PI*(1/f.length)))
    }
    let ret = sum.scalarMult(1/(2*Math.PI))
    if (ret.mag() < 0.01) { return new complex(0,0) } return ret;  
}


function complexStr(z:complex) {
    return z.real.toPrecision(4) + " " + z.img.toPrecision(4) + "i"
}

function getCenterOfMass(points:Array<THREE.Vector3>) : THREE.Vector3 {
    return points.reduce(
        (accumulator, currentValue) => accumulator.add(currentValue),
        new THREE.Vector3(0,0,0),
      ).multiplyScalar(1/points.length);
}

function getCoeffs(points:Array<THREE.Vector3>, n:number):coefficients {
    let ret = []
    for(let i=1; i<=n; i++) {
        ret.push({n:i, an: getIthCoeff(points.map(vec3 => new complex(vec3.x, vec3.y)), i)})
        ret.push({n:-i, an: getIthCoeff(points.map(vec3 => new complex(vec3.x, vec3.y)), -i)})
    }
    return ret as coefficients;
}

function tranformCoeffs(source:coefficients, target:coefficients, t:number) {
    let nSet:Set<number> = new Set();
    source.forEach(coeff => nSet.add(coeff.n))
    target.forEach(coeff => nSet.add(coeff.n))
    let ret:coefficients = []
    nSet.forEach(num => ret.push({n:num, an:new complex(0,0)}))
    source.forEach(sCoeff => {
        const sInd= ret.findIndex(c => c.n == sCoeff.n)
        ret[sInd].an = ret[sInd].an.add(sCoeff.an.scalarMult(1-t))
    })
    target.forEach(tCoeff => {
        const tInd= ret.findIndex(c => c.n == tCoeff.n)
        // console.log(tInd)
        ret[tInd].an = ret[tInd].an.add(tCoeff.an.scalarMult(t))
    })
    return ret
}
