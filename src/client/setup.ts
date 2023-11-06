import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "dat.gui";
import * as THREE from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {Midi} from "@tonejs/midi";

export const
    stats = new Stats(),
    gui = new GUI(),
    clock = new THREE.Clock(),
    scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer(),
    camera = getCamera("pers"),
    lights = getLights()
const loader:OBJLoader = new OBJLoader();

export function loadObj( path:string, name:string ):Promise<THREE.Group>{
    return new Promise(function( resolve, reject ){
        let progress = undefined;
        loader.setPath( path );
        loader.load( name + ".obj", resolve, progress, reject );
    });
}

export function loadMidi( path:string):Promise<Midi>{
    return new Promise(function( resolve, reject ){
        Midi.fromUrl(path).then(
            resolve, reject
        )
    });
}

document.body.appendChild(stats.dom)
// scene.add(new THREE.AxesHelper(10))

function getCamera(type:string): THREE.PerspectiveCamera | THREE.OrthographicCamera{
    let camera;
    if (type.includes("pers")) {
        camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000)
    }
    else {
        let aspect = window.innerWidth / window.innerHeight
        camera = new THREE.OrthographicCamera(
            -10*aspect,10*aspect,10,-10,0.001,1000
        )
    }

    camera.position.x = 70
    camera.position.y = 0
    camera.position.z = 70

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
renderer.setClearColor(0x000000, 0.0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement)


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    //@ts-ignore
    if(!camera.isOrthographicCamera) camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

