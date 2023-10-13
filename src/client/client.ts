import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {loadObj, scene, clock, stats, camera, renderer, lights} from "./setup";
import {getBallPoints, getCube, getGeometryPoints, getRingPoints} from "./points";
import {wave, burn, morph} from './transformations';

new OrbitControls(camera, renderer.domElement)
/////
let manGroup:THREE.Group = await loadObj("obj/", "FinalBaseMesh");
let manMesh:THREE.Mesh = manGroup.children[0] as THREE.Mesh;
manMesh.position.x = -10
manMesh.position.y -= 10;
scene.add(manMesh)
manMesh.visible = false;
let posArray4 = getGeometryPoints(manMesh.geometry, new THREE.Vector3(0, -10, 0))
/////

// const sphereGeometry = new THREE.BoxGeometry(10,10,10,10,10,10)
const sphereGeometry = new THREE.SphereGeometry(10)
const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
    // reflectivity: 1
})
const sphere = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere)

/////////
let n=40
let time:number;
let cubeObj = getCube(n);
let {colors, posArray} = cubeObj;

// let posArray2 = getBallPoints(10, 7)
let posArray2 = getCube(n, new THREE.Vector3(10,0,0), new THREE.Vector3(2,2,2)).posArray
let posArray3 = getCube(n, new THREE.Vector3(100, 0, 0)).posArray;

const latticeGeo = new THREE.BufferGeometry;
latticeGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const latticeMesh = new THREE.Points(latticeGeo, new THREE.PointsMaterial({
    size:0.06,
    // color: 0xffffff,
    vertexColors: true
}))
latticeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
scene.add(latticeMesh)

function animate() {
    requestAnimationFrame(animate)
    // scene.rotateX(-0.001)
    scene.rotateY(0.003)
    time = clock.getElapsedTime()

    lights[0].position.x = -10 +5*Math.sin(5*time)
    lights[0].position.z = 5*Math.cos(5*time)
    lights[1].position.x = 10 + 5*Math.sin(5*time)
    lights[1].position.z = 5*Math.cos(5*time)

    const t = THREE.MathUtils.clamp(1.01*Math.sin(time/6), 0, 1)
    // const t = 1;
    // const newArray:Float32Array = morph(
    //     posArray5,
    //     posArray4,
    //     // morph(
    //     //     posArray2,
    //     //     posArray3,
    //     //     t
    //     // ),
    //     time
    // )
    // const newArray:Float32Array = wave(burn(posArray4, time), 0.7, 0.5, 5, time)
    // const newArray:Float32Array = burn(wave(posArray4, 0.7, 0.5, 5, time), time)
    const newArray:Float32Array = posArray2;
    // const newArray:Float32Array = burn(posArray4, time)
    let newColArray = [];
    for(let i=0; i<newArray.length; i+=3) {
        // newColArray.push(colors[i]*(0.5+0.2*Math.sin(10*time)))
        let r = colors[i + 0]
        let g = colors[i + 1]
        let b = colors[i + 2]
        newColArray.push(r + (0.2-r)*Math.sin(g + 3*time))
        newColArray.push(g + (0.2-g)*Math.cos(b + time))
        newColArray.push(b + (1-1)*Math.sin(r + 4*time))


        // if ( (i/3) % 2 == 0 ) {
        //     let color = new THREE.Color(25/255, 158/255, 4/255);
        //     // let color = new THREE.Color(0x0B3B33);
        //
        //     newColArray.push(color.r)
        //     newColArray.push(color.g)
        //     newColArray.push(color.b)
        // }
        // else {
        //     let color = new THREE.Color(27/255, 51/255, 116/255);
        //     // let color = new THREE.Color(0x832232);
        //     newColArray.push(color.r)
        //     newColArray.push(color.g)
        //     newColArray.push(color.b)
        // }
    }

    latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(newArray, 3))
    latticeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColArray, 3))

    // camera.fov = 5 + Math.abs(100*Math.sin(time/5))
    camera.updateProjectionMatrix()
    stats.update()
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
