import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {loadObj, scene, clock, stats, camera, renderer, lights, loadMidi} from "./setup";
import {getBallPoints, getCube, getGeometryPoints, getRingPoints} from "./points";
import {wave, burn, morph} from './transformations';
import * as Tone from 'tone';
import {Header, Midi} from "@tonejs/midi";
import {TimeSignatureEvent} from "@tonejs/midi/dist/Header";
import {TypedArray} from "three";

new OrbitControls(camera, renderer.domElement)
/////

const sphereGeometry = new THREE.BoxGeometry(5,200,5,10,10,10)
let spheres:Array<THREE.Mesh> = []
// const sphereGeometry = new THREE.SphereGeometry(10, 6, 9);
// const sphereGeometry = new THREE.PlaneGeometry(10, 14, 22, 22)
// const sphereGeometry = new THREE.TorusGeometry(20, 4, 22)
// const sphereGeometry = new THREE.CylinderGeometry(5, 5, 200, 20, 20)
const material = new THREE.MeshStandardMaterial({
    color: 0xff0000
})

const sphere = new THREE.Mesh(sphereGeometry, material)
sphere.receiveShadow = true;
sphere.castShadow = true;
scene.add(sphere)
spheres.push(sphere)

let sphereNormalArr:TypedArray = sphere.geometry.getAttribute('normal').array;
let spherePosArr:TypedArray = sphere.geometry.getAttribute('position').array;

for(let i=0; i<sphereNormalArr.length; i+=3) {
    let currNormal = new THREE.Vector3(sphereNormalArr[i], sphereNormalArr[i+1], sphereNormalArr[i+2])
    let currPos = new THREE.Vector3(spherePosArr[i], spherePosArr[i+1], spherePosArr[i+2])

    let rodGeo = new THREE.CylinderGeometry(0.1, 0.1, 4)
    let rodMat = new THREE.MeshStandardMaterial({
        color: 0x0000ff,
        // wireframe: true,
        // reflectivity: 1,
    })
    let rod = new THREE.Mesh(rodGeo, rodMat)
    rod.position.set(currPos.x, currPos.y, currPos.z)
    rod.castShadow = true
    rod.receiveShadow = true

    scene.add(new THREE.ArrowHelper(currNormal, currPos, 2, 0xff0000))
    let up = new THREE.Vector3(0, 1, 0);
    rod.quaternion.setFromUnitVectors(up, currNormal)
    scene.add(rod)
}

console.log(sphere.geometry)


//
// const planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1)
const planeGeometry = new THREE.CylinderGeometry(1, 1, 10)
const planeMaterial = material.clone();
// planeMaterial.wireframe = true
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.geometry.rotateX(-Math.PI/2)
plane.position.y = -5
plane.castShadow = true
plane.receiveShadow = true
// scene.add(plane)
// scene.add(new THREE.AxesHelper())
// console.log(planeGeometry.getAttribute('normals'))
// console.log(planeGeometry.getAttribute('position'))
// console.log(planeGeometry.getAttribute('uv'))
/////

type sphereData = {
    radius: number,
    widthSegments: number,
    heightSegments: number,
    phiStart: number,
    phiLength: number,
    thetaStart: number,
    thetaLength: number,
}

let spheresData:Array<sphereData>=[];
spheresData.push({
    radius: 10,
    widthSegments: 32,
    heightSegments: 16,
    phiStart: 0,
    phiLength: 2*Math.PI,
    thetaStart: 0,
    thetaLength: Math.PI
})
function regenerateSphereGeometry(i:number) {
    const newGeometry = new THREE.SphereGeometry(
        spheresData[i].radius,
        spheresData[i].widthSegments,
        spheresData[i].heightSegments,
        spheresData[i].phiStart,
        spheresData[i].phiLength,
        spheresData[i].thetaStart,
        spheresData[i].thetaLength
    )
    spheres[i].geometry.dispose()
    spheres[i].geometry = newGeometry
}

function twoX(mJson:Midi) {
    for(let i in mJson.tracks) {
        for(let j in mJson.tracks[i].notes) {
            let mN = mJson.tracks[i].notes[j]
            mN.duration /= 2
            mN.durationTicks /= 2
            mN.ticks /= 2
        }
    }
}

let midiJson:Midi = await loadMidi('./midi/twinkle_twinkle.mid');
twoX(midiJson);
let mH:Header = midiJson.header
let ppq = mH.ppq
// console.log(ppq)
let timeSignatures:TimeSignatureEvent[] = mH.timeSignatures
let tempo:number = mH.tempos.length > 0 ? mH.tempos[0].bpm : 120
let ts:number = timeSignatures.length > 0 ? timeSignatures[0].timeSignature[0] : 4

let mpt = (ppq*tempo*ts)/(60*1000)
mpt /= 3.6
let ticksPerMilli = mpt**(-1)
let ret = getLimits(midiJson)

let lowestNote = ret[0]
let highestNote = ret[1]
// console.log(midiJson)

// let numCells = highestNote - lowestNote + 5

function getLimits(mJson:Midi) {
    let lowestNote = 1000, highestNote = 0
    for(let i in mJson.tracks) {
        for(let j in mJson.tracks[i].notes) {
            let mN = mJson.tracks[i].notes[j].midi
            lowestNote = Math.min(lowestNote, mN)
            highestNote = Math.max(highestNote, mN)
        }
    }
    return [lowestNote, highestNote]
}


////
let manGroup:THREE.Group = await loadObj("obj/", "FinalBaseMesh");
let manMesh:THREE.Mesh = manGroup.children[0] as THREE.Mesh;
manMesh.position.x = -10
manMesh.position.y -= 10;
scene.add(manMesh)
manMesh.visible = false;
let posArray4 = getGeometryPoints(manMesh.geometry, new THREE.Vector3(0, -10, 0))


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
// scene.add(latticeMesh)



const pointLights:Array<THREE.SpotLight> = lights.slice(2, lights.length).map(light => light as THREE.SpotLight)
for(let i=0; i<pointLights.length; i++) {
    let theta = 2*i*Math.PI/pointLights.length + Math.PI/20
    pointLights[i].position.set(6*Math.cos(theta), 10, 6*Math.sin(theta) )
}
console.log(pointLights[0].position)
console.log(pointLights[1].position)
function animate() {
    requestAnimationFrame(animate)
    // scene.rotateX(-0.001)
    // scene.rotateY(0.003)
    time = clock.getElapsedTime()

    // lights[0].position.x = -10 +5*Math.sin(5*time)
    // lights[0].position.z = 5*Math.cos(5*time)
    // lights[1].position.x = 10 + 5*Math.sin(5*time)
    // lights[1].position.z = 5*Math.cos(5*time)

    // camera.position.set(pointLights[0].position.x, pointLights[0].position.y - 10, pointLights[0].position.z)
    // camera.up.set(0,-1,0)



    pointLights.forEach(mainLight => {
        // mainLight.position.x = 10*Math.cos(time/5)
        mainLight.position.y = 70 -3*time
        // const dir = new THREE.Vector3(1000*Math.cos(time/5 + Math.PI/2),1000*Math.sin(time/5 + Math.PI/2),0).add(mainLight.position);
        // mainLight.target.position.set(dir.x, dir.y, dir.z);

        mainLight.target.position.set(mainLight.position.x, mainLight.position.y - 100, mainLight.position.z)
        mainLight.target.updateMatrixWorld();
    })
    // camera.lookAt(mainLight.position)
    //




    let trackCursors = []
    for(let i in midiJson.tracks) {
        trackCursors.push([0])
    }

    // for(let i in midiJson.tracks) {
        let track = midiJson.tracks[0]
        let notes = track.notes
        for(let j in notes) {
            if (time*100 > mpt*notes[j].ticks && time*100 < mpt*(notes[j].ticks + notes[j].durationTicks)) {
                // text(notes[j].name, w/2, h/2 - 200 + i*100)
                // console.log(notes[j].midi)
                // spheresData[0].radius = notes[j].midi/5
                // regenerateSphereGeometry(0)

                // b[notes[j].midi - lowestNote].move()
                // b[notes[j].midi - lowestNote].show()
            }
        }
    // }
    // camera.fov = 5 + Math.abs(100*Math.sin(time/5))
    camera.updateProjectionMatrix()
    stats.update()
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
