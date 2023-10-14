import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {loadObj, scene, clock, stats, camera, renderer, lights, loadMidi} from "./setup";
import {getBallPoints, getCube, getGeometryPoints, getRingPoints} from "./points";
import {wave, burn, morph} from './transformations';
import * as Tone from 'tone';
import {Header, Midi} from "@tonejs/midi";
import {TimeSignatureEvent} from "@tonejs/midi/dist/Header";

new OrbitControls(camera, renderer.domElement)
/////

// const sphereGeometry = new THREE.BoxGeometry(10,10,10,10,10,10)
let spheres:Array<THREE.Mesh> = []
const sphereGeometry = new THREE.SphereGeometry(10)
const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
    // reflectivity: 1
})
const sphere = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere)
spheres.push(sphere)
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
console.log(ppq)
let timeSignatures:TimeSignatureEvent[] = mH.timeSignatures
let tempo:number = mH.tempos.length > 0 ? mH.tempos[0].bpm : 120
let ts:number = timeSignatures.length > 0 ? timeSignatures[0].timeSignature[0] : 4

let mpt = (ppq*tempo*ts)/(60*1000)
mpt /= 3.6
let ticksPerMilli = mpt**(-1)
let ret = getLimits(midiJson)

let lowestNote = ret[0]
let highestNote = ret[1]
console.log(midiJson)

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
                console.log(notes[j].midi)
                spheresData[0].radius = notes[j].midi
                regenerateSphereGeometry(0)

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
