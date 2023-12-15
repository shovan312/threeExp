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
import {clockCoeff, complexCoeff, complexCoeff0, simpleCoeff, squareCoeff, zeroCoeff} from "./coefficients";

/////////////////////////
let gridHelper:GridHelper, axesHelper:AxesHelper, axes:Array<AxesHelper>;
makeBackgroundObjects();
////////////////////////
let flowText:Texture=new Texture(), nrmlText0:Texture=new Texture(), nrmlText1:Texture=new Texture(), cubeTexture:CubeTexture, rainbowText:Texture=new Texture();
loadTextures()
///////////////////////////////
// makeWater()
// makeGlassSphere()
////////////////
let svgCoeffs:Array<coefficient>, svgSpirograph:Spiro|undefined;
const loadedSvg = await loadSvg('svg/demon.svg') as SVGResult;
svgCoeffs = processSVGData(loadedSvg) as Array<coefficient>;
svgSpirograph = new Spiro(svgCoeffs,0,2*Math.PI,rainbowText);

// let spiroCoeff:Array<coefficient> = complexCoeff
// let spirograph = new Spiro(spiroCoeff, 0, 2*Math.PI, rainbowText)
// scene.add(spirograph.wheels[0])

let spiroCoeffs:Array<Array<coefficient>> = []
for(let i=0; i<12; i++) spiroCoeffs.push(zeroCoeff)
let spirographs:Array<Spiro> = []
for(let i=0; i<spiroCoeffs.length; i++) {
    let k = 0.5+0.5*(i/(spiroCoeffs.length-1))
    let newCoeff = spiroCoeffs[i].map(x => {return {n: x.n, an: new complex(x.an.real + k, x.an.img)}});
    let spirograph:Spiro = new Spiro(newCoeff, 0, 2*Math.PI, rainbowText);
    spirographs.push(spirograph);
    scene.add(spirograph.wheels[0])
}


//////

document.addEventListener('keydown', (e) => keyPressed(e));
function keyPressed(e:KeyboardEvent) {
    if (e.code === "KeyW") wPressed = !wPressed
    if (e.code === "KeyS") sPressed = !sPressed
    if (e.code === "KeyD") dPressed = !dPressed
    if (e.code === "KeyC") {
        cPressed = !cPressed
    }
    if (e.code === "KeyB") {
        // bPressed = !bPressed
        bPressed = true
        bCounter++
    }
}
let wPressed:boolean = false;
let dPressed:boolean = false
let bPressed:boolean = false
let cPressed:boolean = false
let bCounter:number = 0
let svgCoeffsMem:Array<coefficient> = svgCoeffs;
let svgLoaded:boolean = false;
let svgUpdated:boolean = false;
let thetaResolution:number=400;
let thetaResolutionDelta:number=-0.1;

let sPressed:boolean = false;
let panCam:boolean = false;
let sTime:number = 0;
let lastCamTheta:number = 0;
let camTheta:number = 0;
function animate() {
    let time:number = clock.getElapsedTime()*1;
    gridHelper.rotation.y = time

    let k=1/2
    thetaResolution = Math.max(Math.min(1400, thetaResolution + thetaResolutionDelta), 3)

    // if (svgSpirograph == undefined) {
    //     renderer.render(scene, camera); return;
    // }
    // if (!svgLoaded) {
    //     scene.add(svgSpirograph.wheels[0]); svgLoaded = true;
    //     for(let i=0; i<svgSpirograph.rings.length; i++) {
    //         if(i%2) {
    //             //@ts-ignore
    //             svgSpirograph.rings[i].material.color = new THREE.Color(0xbbbbbb)
    //         }
    //         else {
    //             //@ts-ignore
    //             svgSpirograph.rings[i].material.color = new THREE.Color(0x111111)
    //         }
    //     }
    //
    // }
    // svgSpirograph.moveRadii(time, k)
    // svgSpirograph.drawTrail(time, true, k, 2*Math.PI, Math.max(7, Math.floor(thetaResolution)));
    // // followCursor(svgSpirograph.wheels, orbitControls, camera, time, 3)
    // enableSceneChange(svgSpirograph, renderer, camera, time)
    //
    // if(k*time > 2*Math.PI) {
    //     // svgSpirograph.coeffs = tranformCoeffs(svgSpirograph.coeffs,spirograph.coeffs, Math.min(1, (k*time-2*Math.PI)/1000))
    //     if(!svgUpdated) {
    //         // scene.remove(svgSpirograph.wheels[0])
    //         // scene.add( svgSpirograph.update())
    //         if ((k*time-2*Math.PI)/1000 > 0.01) {
    //             svgUpdated = true
    //         }
    //     }
    // }

    for(let i=0; i<spirographs.length; i++) {
    //     for(let i=0; i<3; i++) {
        spirographs[i].moveRadii(time, 1/2)
        spirographs[i].drawTrail(time, true, 1/2, 200*Math.PI, Math.max(7, Math.floor(thetaResolution)), i)
        enableSceneChange(spirographs[i], renderer, camera, time)

    }

    // followCursor(spirograph.wheels, orbitControls, camera, time, 3)
    // renderer.render(scene, camera);
    stats.update()
    //
    if(bPressed) {
        if(bCounter==1){
            spirographs.forEach(spirograph =>
            spirograph.coeffs[3].an = spirograph.coeffs[3].an.add(new complex(0,-0.01*Math.sin(2*time))))
        }
        // if(bCounter>1){
        //     //@ts-ignore
        //     spirograph.rings[2].material.color = new THREE.Color(0xff0000)
        //     spirograph.coeffs[2].an = new complex(
        //         svgCoeffsMem[2].an.real + 0.02*Math.sin(1.2*time),
        //         svgCoeffsMem[2].an.img + 0.01*Math.sin(2.2*time))
        // }
    }

    if (sPressed) {
        panCam = !panCam; sPressed = false; sTime = time
        if(panCam) lastCamTheta = camTheta
    }
    if (panCam) {
        camTheta = lastCamTheta + time - sTime;
        const horRadius = 27, verRadius = 5, horVariation = 2 + Math.sin(camTheta)
        camera.position.set(horRadius*horVariation*Math.sin(camTheta/5), verRadius*Math.sin(1/2*camTheta), horRadius*horVariation*Math.cos(camTheta/5))
        camera.lookAt(0,0,0)
    }
    if (dPressed) {
        thetaResolutionDelta *= -1
        dPressed = false
    }

    // console.log(renderer.info.memory.geometries)
    requestAnimationFrame(animate)

    // scene.rotation.y += 0.01
    // scene.rotation.x += 0.005
}
animate()
// renderer.setAnimationLoop(animate);

function enableSceneChange(spiro:Spiro, renderer:THREE.Renderer, camera:THREE.PerspectiveCamera | THREE.OrthographicCamera, time:number) {
    if (wPressed) {
        let sawWave = 2*Math.abs(time/15 - Math.floor(time/15) - 1/2)
        // spiro.line.options.color = new THREE.Color(sawWave, 0.5 - 0.25*sawWave, 1-sawWave)
        // spiro.line.options.color = 0x00fc69
        spiro.line.options.color = 0xffffff
        renderer.render(spiro.wheels[0], camera);
    }
    else {
        spiro.line.options.color = 0x000000
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
        //e^(i*-n*theta)
        const curr = f[i];
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
    return points
        .reduce(
            (accumulator, currentValue) => accumulator.add(currentValue), new THREE.Vector3(0,0,0))
        .multiplyScalar(1/points.length);
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
        const sInd = ret.findIndex(c => c.n == sCoeff.n)
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
