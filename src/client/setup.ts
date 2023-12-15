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
    textureLoader = new THREE.TextureLoader()

function getCamera(type:string): THREE.PerspectiveCamera | THREE.OrthographicCamera{
    let camera;
    if (type.includes("pers")) {
        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000)
        camera.position.set(0, 0, 58);
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
    const pointLight1 = new THREE.PointLight(0x1aaffff, 100);
    const pointLight2 = new THREE.PointLight(0x1aaffff, 100);
    pointLight1.position.z = 15
    pointLight2.position.z = -15
    // scene.add(pointLight1)
    // scene.add(pointLight2)

    const pointLights:Array<THREE.Light> = []
    for(let i=0; i<10;i++) {
        const pointLight = new THREE.SpotLight(0xffffff, 1000, 0, Math.PI/4, 0.5);
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

    return [pointLight1, pointLight2, ...pointLights];
}

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor(0x515151);
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


