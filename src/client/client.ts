import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import {
    AxesHelper, CubeCamera,
    CubeTexture,
    SpotLight, WebGLCubeRenderTarget,
} from "three";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import { Reflector } from 'three/examples/jsm/objects/Reflector'

let flowText, nrmlText0, nrmlText1;
const perlin = new ImprovedNoise();
/////////////////////////
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.outputColorSpace = "srgb";
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
camera.position.set(0, 14, 27);

const clock = new THREE.Clock();
// let ambientLight = new THREE.AmbientLight( 0xe7e7e7, 0.2 );
// scene.add( ambientLight );

// const directionalLight = new THREE.DirectionalLight( 0xffffff, 5 );
// scene.add( directionalLight );

const spotLights:Array<SpotLight> = [];
let nLights = 10
for(let i=0; i<nLights; i++) {
    const spotLight = new THREE.SpotLight( 0xffffff , 10, 0, Math.PI/6);
    // spotLight.position.set( 2*Math.sin(2*Math.PI*i/nLights), i*10/nLights, 2*Math.cos(2*Math.PI*i/nLights) );
    spotLight.position.set( 2*Math.sin(2*Math.PI*i/nLights), 7, 2*Math.cos(2*Math.PI*i/nLights) );
    // spotLight.lookAt(new THREE.Vector3(0,2,120))

    scene.add(spotLight)
    spotLights.push(spotLight);

    let sLHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(sLHelper);

}

// scene.add( spotLight );

new OrbitControls(camera, renderer.domElement);

const gridHelper = new THREE.GridHelper(12, 12);
// gridHelper.rotateX(Math.PI/2)
scene.add(gridHelper);
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
////////
const fbxLoader:FBXLoader = new FBXLoader();
function loadObj( path:string, name:string ):Promise<THREE.Group>{
    return new Promise(function( resolve, reject ){
        let progress = undefined;
        fbxLoader.setPath( path );
        fbxLoader.load( name, resolve, progress, reject );
    });
}
let manGroup:THREE.Group = await loadObj("anims/", 'StandingClap.fbx')
const manMesh:THREE.Mesh = manGroup.children[0] as THREE.Mesh;
scene.add(manGroup)

////////
manGroup.scale.setScalar(0.03)
    let anim = manGroup.animations;
    let mixer = new THREE.AnimationMixer(manGroup);
    const clip =anim[0];
    const action = mixer.clipAction(clip);
    action.enabled = true;
    // action.time = 0.0;
    action.play()
manGroup.position.z = -1
console.log(manMesh)


/////////////
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

let water2 = new Water( waterGeometry, {
    // color: '#42daf5',
    scale: 2,
    textureWidth: 1024,
    textureHeight: 1024,
    flowMap: flowText,
    normalMap0: nrmlText0,
    normalMap1: nrmlText1
} );
waterGeometry.computeVertexNormals();
scene.add( water2 );

water2.position.y = -0.1;
water2.rotation.x = Math.PI *  0.5;

let sphereGeo:THREE.BufferGeometry = new THREE.SphereGeometry(1.8, 50, 50)
let sphere = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
    color: 0x00aaee,
    roughness: 0.3,
    metalness: 0.5
}))
sphere.position.z = -1
sphere.scale.set(0.8, 0.8, 0.8);

scene.add(sphere)


let planeGeo:THREE.BufferGeometry = new THREE.PlaneGeometry(6, 6)

let mirrors:Array<Reflector> = [];
let numMirror = 3
for(let i=0; i<numMirror; i++) {
    const mirror: Reflector = new Reflector(
        planeGeo,
        {
            color: new THREE.Color(0xffffff),
            // textureWidth: window.innerWidth * window.devicePixelRatio/3,
            // textureHeight: window.innerHeight * window.devicePixelRatio/3
        }
    )
    const mirrorBack:THREE.Mesh = new THREE.Mesh(planeGeo,
        new THREE.MeshStandardMaterial({color:0xffffff, side: THREE.DoubleSide}))
    mirror.position.x = 5*Math.cos(2*i*Math.PI/numMirror)
    mirror.position.z = 5*Math.sin(2*i*Math.PI/numMirror)
    mirror.position.y = 5
    mirror.rotateY(-2*i*Math.PI/numMirror - Math.PI/2)
    mirror.rotateX(Math.PI/12)
    scene.add(mirror)
    mirrors.push(mirror)

    mirror.add(mirrorBack)
    mirrorBack.position.z = -0.1

    let mirrorLight = new THREE.SpotLight(0xffffff, 10);
    mirrorLight.position.z = -3
    mirrorLight.position.y = 3
    mirrorBack.add(mirrorLight)
}

//////////
const targetPlaneSize = {width:4, height:4}
// const targetPlanePosition = {x:0, y: 10 , z: 5}
const targetPlanePosition = {x:mirrors[1].position.x, y: mirrors[1].position.y , z: mirrors[1].position.z + 0.7}
const renderTargetWidth = targetPlaneSize.width * 512;
const renderTargetHeight = targetPlaneSize.height * 512;
const renderTarget = new THREE.WebGLRenderTarget(renderTargetWidth, renderTargetHeight);

const secondaryAspect = renderTargetWidth/renderTargetHeight;
const secondaryCamera = new THREE.PerspectiveCamera(45, secondaryAspect, 0.1, 1000);
secondaryCamera.position.set(targetPlanePosition.x, targetPlanePosition.y + 4, targetPlanePosition.z);
secondaryCamera.lookAt(0,0,0)

const secondaryScene = new THREE.Scene();
secondaryScene.background = new THREE.Color(0x11111ee)

const targetMaterial = new THREE.MeshPhongMaterial({
    map: renderTarget.texture,
    color: 0xffffff
})
const targetPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(targetPlaneSize.width, targetPlaneSize.height, 32),
    targetMaterial
)
targetPlane.position.set(targetPlanePosition.x, targetPlanePosition.y, targetPlanePosition.z )
targetPlane.position.x = 5*Math.cos(2*1*Math.PI/numMirror)
targetPlane.position.z = 5*Math.sin(2*1*Math.PI/numMirror)
targetPlane.position.y = 5
targetPlane.rotateY(-2*1*Math.PI/numMirror - Math.PI/2)
targetPlane.rotateX(Math.PI/12)

// scene.add(targetPlane)

let targetLight = new THREE.SpotLight(0xffffff, 10)
targetLight.position.x = 5*Math.cos(2*1*Math.PI/numMirror)
targetLight.position.z = 5*Math.sin(2*1*Math.PI/numMirror)
targetLight.position.y = 5
let tLHelper = new THREE.SpotLightHelper(targetLight);
// scene.add(tLHelper)
// scene.add(targetLight)


document.addEventListener('keydown', (e) => keyPressed(e));
function keyPressed(e:KeyboardEvent) {
    if(e.code === "KeyW") {
        wPressed = true
    }
    if(e.code === "KeyS") {
        sPressed = true
    }
    if(e.code === "KeyD") {
        dPressed = true
    }
}
let wPressed:boolean = false;
let sPressed:boolean = false;
let dPressed:boolean = false
/////////

console.log(scene.background)

function animate() {
    let time:number = clock.getElapsedTime()*1;
    scene.rotateY(0.06)

    camera.updateProjectionMatrix()
    camera.lookAt(new THREE.Vector3(0,3,0))

    // targetPlane.material.map = renderTarget.texture
    // renderer.setRenderTarget(renderTarget);
    // renderer.render(secondaryScene, secondaryCamera);
    // renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    // for(let i=0; i<spotLights.length; i++) {
    //     spotLights[i].position.set(2*Math.cos(4*time + i/3),4*Math.sin(time), 2*Math.sin(4*time + i/3))
    //     spotLights[i].lookAt(new THREE.Vector3(0,0,0))
    //     spotLights[i].position.z = 2*Math.sin(4*time + i/3)
    //     spotLights[i].position.x = 2*Math.cos(4*time + i/3)
    // }

    mixer.update(1/80)
    // mirrorSphere.position.set(10*Math.sin(time/2), 4, 10*Math.cos(time/2))

    if(wPressed) {
        scene.rotateY(-0.18)
        mirrors.forEach(mirror => {
            //@ts-ignore
            mirror.material.uniforms.color.value.r = 1 - Math.random()/4;
            //@ts-ignore
            mirror.material.uniforms.color.value.g = Math.random()/6;
            //@ts-ignore
            mirror.material.uniforms.color.value.b = Math.random()/4;
        })
    }

    if (sPressed ) {
        // && Math.abs(scene.rotation.y - Math.PI/2) < 0.1) {

        scene.rotateY(0.18 - 0.06 + 0.002)
        // scene.remove(mirrors[1])
        // scene.add(targetPlane)
        // scene.add(targetLight)
        mirrors.forEach(mirror => {
            //@ts-ignore
            mirror.material.uniforms.color.value.r = 0;
            //@ts-ignore
            mirror.material.uniforms.color.value.g = 0;
            //@ts-ignore
            mirror.material.uniforms.color.value.b = 0;
        })

    }

    if (time > 8) {
        axes.forEach(axis => axis.rotation.set(time/7, time/7, time/7))
    }
    if (camera.position.y < 0) camera.position.y = 0.1
    // console.log(camera.position.z)
    if (camera.position.z < 6) camera.position.z = 6
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
