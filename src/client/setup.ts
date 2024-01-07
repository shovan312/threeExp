import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";
import * as THREE from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {OrthographicCamera} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {SVGLoader, SVGResult} from "three/examples/jsm/loaders/SVGLoader";

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
    scene.add(nearLightHelper)

    let rightLight = new THREE.SpotLight(0x00ff00, 100, 0, Math.PI/6)
    rightLight.position.y = 10
    rightLight.position.x = 5
    scene.add(rightLight)
    let rightLightHelper = new THREE.SpotLightHelper(rightLight)
    scene.add(rightLightHelper)

    let farLight = new THREE.SpotLight(0x0000ff, 100, 0, Math.PI/6)
    farLight.position.y = 10
    farLight.position.z = -5
    scene.add(farLight)
    let farLightHelper = new THREE.SpotLightHelper(farLight)
    scene.add(farLightHelper)

    let leftLight = new THREE.SpotLight(0xff00ff, 100, 0, Math.PI/6)
    leftLight.position.y = 10
    leftLight.position.x = -5
    scene.add(leftLight)
    let leftLightHelper = new THREE.SpotLightHelper(leftLight)
    scene.add(leftLightHelper)

    const pointLights:Array<THREE.Light> = []
    for(let i=0; i<1;i++) {
        const pointLight = new THREE.SpotLight(0xffffff, 1000, 0, Math.PI/4, 0.5);
        pointLight.position.y = 10;
        pointLight.castShadow = true
        scene.add(pointLight)
        pointLight.shadow.bias = -0.003
        pointLight.shadow.mapSize.width = 2048
        pointLight.shadow.mapSize.height = 2048
        pointLight.shadow.camera.near = 0.1
        pointLight.shadow.camera.far = 100
        pointLights.push(pointLight)

        let plHelper = new THREE.SpotLightHelper(pointLight)
        scene.add(plHelper)
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


