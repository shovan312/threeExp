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
let svgWheels:Array<THREE.Mesh> | undefined = []
let newSvgLine:Line| undefined;
let svgCoeffs:coefficients
const svgRadii:Array<Line> = []

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
	'svg/bottle.svg',
	// called when the resource is loaded
	function ( data ) {
		const paths = data.paths;
		const group = new THREE.Group();

        let allPoints:THREE.Vector2[]=[]
		for ( let i = 0; i < paths.length; i ++ ) {
			const path = paths[ i ];

            for(let i=0; i<path.subPaths[0].curves.length; i++) {
                const curve1:THREE.Curve<THREE.Vector2> = path.subPaths[0].curves[i]
                const pointsArr = curve1.getPoints(19);
                let geometry = new THREE.BufferGeometry().setFromPoints(pointsArr);
                
                const svgLine = new Line(pointsArr.map(vec2 => new THREE.Vector3(vec2.x/10, vec2.y/10, 0)), glassRainbowText);
                // scene.add(svgLine.curve)

                allPoints.push(...pointsArr)
            }

            let allPointsVec3:THREE.Vector3[] = allPoints.map(point => new THREE.Vector3(point.x/3, point.y/3, 0))
            const line = new Line(allPointsVec3, glassRainbowText); 
            const com=getCenterOfMass(allPointsVec3);
            line.curve.position.set(-com.x, -com.y, -com.z)

            svgCoeffs = getCoeffs(allPointsVec3, 8)
            const svgSpiro = getSpiroPoints(svgCoeffs)
            newSvgLine = new Line(svgSpiro, glassRainbowText)
            
            scene.add(newSvgLine.curve)
            // scene.add(line.curve)
            svgWheels = makeSpiroWheels(svgCoeffs);
            scene.add(svgWheels[0])

            for(let i=0; i<svgCoeffs.length; i++) {
                svgRadii.push(
                    new Line([], glassRainbowText)
                )
            }

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
// waterGeometry.computeVertexNormals();
scene.add( water2 );

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
    // {n:-5, an:new complex(10, 8/3)},
    {n:1, an:new complex(8,0)},
    {n:10, an:new complex(4,10/3)},
    // {n:13, an:new complex(5/3, 2/3)},
    // {n:-29, an:new complex(0.8, 0)},
    // {n:49, an:new complex(0.1, 0.2)}
]

// const spiroCoeff:coefficients = [
//     {n:-7, an:new complex(-0.0827113100467,0)},
//     {n:-3, an:new complex(-0.4503171322,0)},
//     {n:1, an:new complex(-4.0528541922,0)},
//     {n:5, an:new complex(-0.16211416769,0)},
//     {n:9, an:new complex(-0.05003523694,0)},
// ]

// const wheels = makeSpiroWheels(spiroCoeff);
// scene.add(wheels[0])

const spiroPoints:Array<THREE.Vector3> = getSpiroPoints(spiroCoeff);
const spiroLine = new Line(spiroPoints, glassRainbowText);
// scene.add(spiroLine.curve)

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

const radii:Array<Line> = []
for(let i=0; i<spiroCoeff.length; i++) {
    radii.push(
        new Line([], glassRainbowText)
    )
}

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
    
    if (svgCoeffs != undefined && svgWheels != undefined && newSvgLine != undefined) {
        moveRadii(svgCoeffs, svgWheels, svgRadii, time, true, newSvgLine)
        // makeTrail()
        followCursor(svgWheels, orbitControls, camera, time, 3)
        enableSceneChange(newSvgLine, svgWheels, renderer, camera)
    }
    // moveRadii(spiroCoeff, wheels, radii, time)
    gridHelper.rotation.y = time

    
    

    // scene.rotateZ(-0.004)
    // scene.rotateY(0.003)
    // renderer.render(scene, camera);
}

function moveRadii(coeffs:coefficients, wheels:Array<THREE.Mesh>, radii:Array<Line>, time:number, makeTrail:boolean=false, line:Line|undefined=undefined) {
    const k = 1/4

    for(let i=0; i<coeffs.length; i++) {
        const omega = coeffs[i].n
        const theta = time*k*omega + coeffs[i].an.arg()
        wheels[i+1].position.set(
            coeffs[i].an.mag()*Math.cos(theta), 
            coeffs[i].an.mag()*Math.sin(theta), 
            0
            )

        //make line from world coordinates of
        // wheels[i] to wheels[i+1]
        const currBall:THREE.Vector3 = new THREE.Vector3();
        const nextBall:THREE.Vector3 = new THREE.Vector3();
        wheels[i].getWorldPosition(currBall)
        wheels[i+1].getWorldPosition(nextBall)
        
        radii[i].points = [currBall, nextBall]
        wheels[0].remove(radii[i].curve)
        wheels[0].add(radii[i].update())
    }

    if (makeTrail && line!=undefined) {
        //@ts-ignore
        spiroLine.curve.material.dashOffset = time/10
        line.points = getSpiroPoints(coeffs, Math.max(0, time*k - 2*Math.PI), time*k)
        // spiroLine.points = getSpiroPoints(spiroCoeff, 0, 2*Math.PI)
        // spiroLine.options.lineWidth = time/1%1
        wheels[0].remove(line.curve)
        wheels[0].add(line.update())
    }
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
    camera.position.set(cursorPos.x, cursorPos.y, cursorPos.z-10-time*speed)
    orbitControls.update()
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function getSpiroPoints(coefficients:coefficients, thetaStart:number=0, thetaEnd:number=2*Math.PI):Array<THREE.Vector3>{
    let spiroPoints = []
    let thetaResolution = 500;

    for(let i=0; i<thetaResolution; i++) {
        let r = new complex(0,0)
        const I = new complex(0,1)
        const theta = thetaStart + i * (thetaEnd - thetaStart) / thetaResolution
        for(let j=0; j<coefficients.length; j++) {
            const z = coefficients[j].an
            r = r.add(z.mult(I.scalarMult(coefficients[j].n*theta).exp()))
            // wheels[j+1].position.z = r.mag()*Math.sin(theta)
        }

        // spiroPoints.push(new THREE.Vector3(r.real, r.img, r.mag()*Math.sin(theta)))
        spiroPoints.push(new THREE.Vector3(r.real, r.img, 0))
    }
    return spiroPoints;
}

function makeSpiroWheels(coefficients:coefficients):Array<THREE.Mesh> {
    let wheels:Array<THREE.Mesh> = [];
    wheels.push(new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshPhysicalMaterial()))
    
    for(let i=0; i<coefficients.length; i++) {
        const currWheel = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshPhysicalMaterial())
        wheels[i].add(currWheel)
        
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(coefficients[i].an.mag(), coefficients[i].an.mag()+0.05, 100),
            new THREE.MeshBasicMaterial({color: 0x919191, side:THREE.DoubleSide})
        )
        wheels[i].add(ring)

        wheels.push(currWheel)
    }
    return wheels;
}

function getIthCoeff(f: Array<complex>, n: number):complex {
    let sum = new complex(0,0);
    for(let i=0; i<f.length-1; i++) {
        const curr = f[i];
        const next = f[i+1];

        const I = new complex(0, 1);
        
        //e^(i*-n*theta) 
        // const theta = curr.arg()
        const theta = 2*Math.PI*(i/f.length)
        // const theta = curr.arg()
        const exp = I.scalarMult(-n*theta).exp();
        // console.log(deltaTheta, complexStr(curr.mult(exp)))

        sum = sum.add(curr.mult(exp).scalarMult(2*Math.PI*(1/f.length)))
    }
    let ret = sum.scalarMult(1/(2*Math.PI))
    
    if (ret.mag() < 0.01) { return new complex(0,0) } return ret;  
}

//// Inverse FT test

console.log(getCenterOfMass(spiroPoints))
let coeffs = getCoeffs(spiroPoints, 18)
coeffs.forEach(x=>console.log(x.n, complexStr(x.an)))
const newPoints = getSpiroPoints(coeffs)

const newCurve = new Line(newPoints, glassRainbowText); 
// scene.add(newCurve.curve)

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
