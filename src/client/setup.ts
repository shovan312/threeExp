import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";
import * as THREE from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {OrthographicCamera} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {SVGLoader, SVGResult} from "three/examples/jsm/loaders/SVGLoader";
import { Water } from 'three/examples/jsm/objects/Water2.js';


export const
    stats = new Stats(),
    gui = new GUI(),
    clock = new THREE.Clock(),
    scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer({antialias: true}),
    camera = getCamera("pers"),
    orbitControls = new OrbitControls(camera, renderer.domElement),
    textureLoader = new THREE.TextureLoader(),
    lights = getLights()

function getCamera(type:string): THREE.PerspectiveCamera | THREE.OrthographicCamera{
    let camera;
    if (type.includes("pers")) {
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000)
        camera.position.set(0, 3, 15.39);
    }
    else {
        let aspect = window.innerWidth / window.innerHeight
        camera = new THREE.OrthographicCamera(
            -1*aspect,1*aspect,1,-1,0.001,1000
        )
        camera.zoom = 0.06
        camera.position.set(0, 0, 180);
    }
    return camera;
}

function getLights():Array<THREE.Light>{
    let nearLight = new THREE.SpotLight(0xff0000, 100, 0, Math.PI/6)
    nearLight.position.y = 10
    nearLight.position.z = 5
    scene.add(nearLight)
    scene.add(nearLight.target)
    let nearLightHelper = new THREE.SpotLightHelper(nearLight)
//     scene.add(nearLightHelper)

    let rightLight = new THREE.SpotLight(0x00ff00, 100, 0, Math.PI/6)
    rightLight.position.y = 10
    rightLight.position.x = 5
    scene.add(rightLight)
    scene.add(rightLight.target)
    let rightLightHelper = new THREE.SpotLightHelper(rightLight)
//     scene.add(rightLightHelper)

    let farLight = new THREE.SpotLight(0x0000ff, 100, 0, Math.PI/6)
    farLight.position.y = 10
    farLight.position.z = -5
    scene.add(farLight)
    scene.add(farLight.target)
    let farLightHelper = new THREE.SpotLightHelper(farLight)
//     scene.add(farLightHelper)

    let leftLight = new THREE.SpotLight(0xff00ff, 100, 0, Math.PI/6)
    leftLight.position.y = 10
    leftLight.position.x = -5
    scene.add(leftLight)
    scene.add(leftLight.target)
    let leftLightHelper = new THREE.SpotLightHelper(leftLight)
//     scene.add(leftLightHelper)

    const pointLights:Array<THREE.Light> = []
    for(let i=0; i<1;i++) {
        const pointLight = new THREE.SpotLight(0xffffff, 1000, 0, Math.PI/4, 0.5);
        pointLight.position.y = 10;
        pointLight.castShadow = true
        scene.add(pointLight)
        scene.add(pointLight.target)
        pointLight.shadow.bias = -0.003
        pointLight.shadow.mapSize.width = 2048
        pointLight.shadow.mapSize.height = 2048
        pointLight.shadow.camera.near = 0.1
        pointLight.shadow.camera.far = 100
        pointLights.push(pointLight)

        let plHelper = new THREE.SpotLightHelper(pointLight)
//         scene.add(plHelper)
    }

    return [nearLight, farLight, rightLight, leftLight, ...pointLights];
}

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement)

stats.showPanel(2)
document.body.appendChild(stats.dom)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    if(!(camera instanceof OrthographicCamera)) camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

export const keysPressed = {}
document.addEventListener('keydown', (event) => {
        (keysPressed as any)[event.key.toLowerCase()] = true
}, false);

document.addEventListener('keyup', (event) => {
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);

export function makeHelperObjects():[THREE.GridHelper, THREE.AxesHelper, THREE.AxesHelper[]] {
    let gridHelper:THREE.GridHelper = new THREE.GridHelper(12, 12);
    gridHelper.rotateX(Math.PI / 2)
    let axesHelper = new THREE.AxesHelper(4);
    let axes = []
    for (let i = -2; i < 3; i++) {
        for (let j = -2; j < 3; j++) {
            for (let k = -2; k < 3; k++) {
                if (i==0 && j == 0 && k == 0) continue;
                let axis = new THREE.AxesHelper(6);
                axis.position.set(25 * (i), 10 * (j), 25 * (k))
                axes.push(axis);
            }
        }
    }
    return [gridHelper, axesHelper, axes];
}

export function loadTextures() {
    let flowText = textureLoader.load('./Water_1_M_Flow.jpg');
    let nrmlText0 = textureLoader.load('./Water_1_M_Normal.jpg');
    let nrmlText1 = textureLoader.load('./Water_2_M_Normal.jpg');
    let rainbowText = textureLoader.load('./rainbow.jpg')

    let cubeTexture = new THREE.CubeTextureLoader().load([
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png',
        'paperSquare.png'
    ])

    cubeTexture.anisotropy = 0.1
    return [flowText, nrmlText0, nrmlText1, rainbowText, cubeTexture]
}

export function makeWater(flowText:THREE.Texture, nrmlText0:THREE.Texture, nrmlText1:THREE.Texture) {
    let waterGeometry = new THREE.PlaneGeometry( 400, 400 );
    let waterHeight = 0
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

    water2.position.y =waterHeight -0.1;
    water2.rotation.x = Math.PI *  0.5;

    return [water, water2];
}

export function makeGlassSphere() {
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
//     sphere.position.z = -2
    sphere.position.y = 2

    return sphere;
}




