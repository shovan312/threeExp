import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { Water } from 'three/examples/jsm/objects/Water2.js';
import {AxesHelper, ColorRepresentation, CubeTexture, GridHelper, LineBasicMaterial, Texture} from "three";
import {Line} from "./line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {SVGLoader, SVGResult} from 'three/examples/jsm/loaders/SVGLoader';
import {complex} from 'ts-complex-numbers';
import { Spiro } from './spiro';
import Stats from 'three/examples/jsm/libs/stats.module'
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {coefficient} from "./spiro";
import {scene, clock, stats, camera, renderer, orbitControls, textureLoader} from "./setup";
import {loadSvg, processSVGData} from "./svg";
import {simpleCoeff} from "./coefficients";


/////////////////////////
let gridHelper:GridHelper, axesHelper:AxesHelper, axes:Array<AxesHelper>;
makeBackgroundObjects();
////////////////////////
let flowText:Texture=new Texture(), nrmlText0:Texture=new Texture(), nrmlText1:Texture=new Texture(), cubeTexture:CubeTexture;
loadTextures()
///////////////////////////////
// makeWater()
// makeGlassSphere()
////////////////
let svgCoeffs:Array<coefficient>, svgSpirograph:Spiro|undefined;
const loadedSvg = await loadSvg('svg/man.svg') as SVGResult;
svgCoeffs = processSVGData(loadedSvg) as Array<coefficient>;
svgSpirograph = new Spiro(svgCoeffs);

let spiroCoeff:Array<coefficient> = simpleCoeff
let spirograph = new Spiro(spiroCoeff)
scene.add(spirograph.wheels[0])
//////

document.addEventListener('keydown', (e) => keyPressed(e));
function keyPressed(e:KeyboardEvent) {
    if (e.code === "KeyW") wPressed = !wPressed
    if (e.code === "KeyS") sPressed = !sPressed
    if (e.code === "KeyD") dPressed = !dPressed
    if (e.code === "KeyB") bPressed = !bPressed
}
let wPressed:boolean = false;
let sPressed:boolean = false;
let dPressed:boolean = false
let bPressed:boolean = false
let svgLoaded:boolean = false;
let svgUpdated:boolean = false;
let thetaResolution:number=400;
let sTime:number = 0;

function animate() {
    let time:number = clock.getElapsedTime()*1;
    gridHelper.rotation.y = time


    if (svgSpirograph == undefined) {
        renderer.render(scene, camera);
    }
    else {
        if (!svgLoaded) {
            scene.add(svgSpirograph.wheels[0])
            svgLoaded = true
        }
        let k=1/2
        svgSpirograph.moveRadii(time, true, k, 2*Math.PI, Math.max(7, Math.floor(thetaResolution)))
        // followCursor(svgSpirograph.wheels, orbitControls, camera, time, 3)
        enableSceneChange(svgSpirograph.line, svgSpirograph.wheels, renderer, camera, time)
        thetaResolution -= 0.1
        if(k*time > 2*Math.PI) {
            // let transformScale = 0.995
            svgSpirograph.coeffs = tranformCoeffs(svgSpirograph.coeffs,spiroCoeff, Math.min(1, (k*time-2*Math.PI)/1000))
            if(!svgUpdated) {
                // scene.remove(svgSpirograph.wheels[0])
                // scene.add(svgSpirograph.update())
                if ((k*time-2*Math.PI)/1000 > 0.01) {
                    console.log("flipping")
                    svgUpdated = true
                }
            }
        }
    }

    // spirograph.moveRadii(time, true, 1/2, 2*Math.PI, Math.max(7, Math.floor(thetaResolution)))
    // enableSceneChange(spirograph.line, spirograph.wheels, renderer, camera, time)
    // followCursor(spirograph.wheels, orbitControls, camera, time, 3)
    // thetaResolution -= 0.1
    // renderer.render(scene, camera);
    stats.update()

    if (sPressed) {
        if (!sTime) sTime = time;
        const currTime = time - sTime;
        const horRadius = 27
        const verRadius = 5
        const horVariation = 2 + Math.sin(currTime)
        camera.position.set(horRadius*horVariation*Math.sin(currTime/5), verRadius*Math.sin(1/2*currTime), horRadius*horVariation*Math.cos(currTime/5))
        camera.lookAt(0,0,0)
    }
    if (dPressed) {
        thetaResolution += 0.4
    }

    // console.log(renderer.info.memory)
    requestAnimationFrame(animate)
}
animate()
// renderer.setAnimationLoop(animate);

function enableSceneChange(line:Line, wheels:Array<THREE.Mesh>, renderer:THREE.Renderer, camera:THREE.PerspectiveCamera | THREE.OrthographicCamera, time:number) {
    if (wPressed) {
        // console.log(Math.abs(time - Math.floor(time) - 1/2))
        // line.options.color = new THREE.Color(2*Math.abs(time/5 - Math.floor(time/5) - 1/2), 252/255, 105/255)
        line.options.color = 0x00fc69
        renderer.render(wheels[0], camera);
        // composer.render()
    }
    else {
        line.options.color = 0x000000
        renderer.render(scene, camera);
    }
}

function followCursor(wheels:Array<THREE.Mesh>, orbitControls:OrbitControls, camera:THREE.PerspectiveCamera | THREE.OrthographicCamera, time:number, speed:number) {
    const cursorPos = new THREE.Vector3()
    wheels[wheels.length-2].getWorldPosition(cursorPos);
    orbitControls.target = cursorPos.clone();
    orbitControls.position0.set(0,0,0);
    // orbitControls.object.position.set(cursorPos.x, cursorPos.y, cursorPos.z-5-time)
    camera.position.set(cursorPos.x, cursorPos.y, Math.min(50, cursorPos.z+10+time*speed))
    orbitControls.update()
}

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

export function getCenterOfMass(points:Array<THREE.Vector3>) : THREE.Vector3 {
    return points.reduce(
        (accumulator, currentValue) => accumulator.add(currentValue),
        new THREE.Vector3(0,0,0),
      ).multiplyScalar(1/points.length);
}

export function getCoeffs(points:Array<THREE.Vector3>, n:number):Array<coefficient> {
    let ret = []
    for(let i=1; i<=n; i++) {
        ret.push({n:i, an: getIthCoeff(points.map(vec3 => new complex(vec3.x, vec3.y)), i)})
        ret.push({n:-i, an: getIthCoeff(points.map(vec3 => new complex(vec3.x, vec3.y)), -i)})
    }
    return ret as Array<coefficient>;
}

function tranformCoeffs(source:Array<coefficient>, target:Array<coefficient>, t:number) {
    let nSet:Set<number> = new Set();
    source.forEach(coeff => nSet.add(coeff.n))
    target.forEach(coeff => nSet.add(coeff.n))
    let ret:Array<coefficient> = []
    nSet.forEach(num => ret.push({n:num, an:new complex(0,0)}))
    source.forEach(sCoeff => {
        const sInd= ret.findIndex(c => c.n == sCoeff.n)
        ret[sInd].an = ret[sInd].an.add(sCoeff.an.scalarMult(1-t))
    })
    target.forEach(tCoeff => {
        const tInd= ret.findIndex(c => c.n == tCoeff.n)
        ret[tInd].an = ret[tInd].an.add(tCoeff.an.scalarMult(t))
    })
    return ret
}

//////////

function makeBackgroundObjects() {
    gridHelper = new THREE.GridHelper(12, 12);
    gridHelper.rotateX(Math.PI / 2)
    scene.add(gridHelper);
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
                scene.add(axis)
            }
        }
    }
}

function loadTextures() {
    flowText = textureLoader.load('./Water_1_M_Flow.jpg');
    nrmlText0 = textureLoader.load('./Water_1_M_Normal.jpg');
    nrmlText1 = textureLoader.load('./Water_2_M_Normal.jpg');

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
}

function makeWater() {
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
    scene.add( water2 );

    water2.position.y = -0.1;
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
}
