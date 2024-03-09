import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui'
import { AxesHelper,ColorRepresentation,CubeTexture,GridHelper,LineBasicMaterial,
OrthographicCamera,Texture, Vector2 } from "three";
import {Line} from "./helpers/general/line";
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise'
import {SVGLoader, SVGResult} from 'three/examples/jsm/loaders/SVGLoader';
import { Spiro } from './helpers/spiro/spiro';
import {clockCoeff} from './helpers/spiro/coefficients'
import {getCube, getPointMesh, getGeometryPoints} from './helpers/general/points'
import {rearrangeArr, wave, burn, morph} from './helpers/general/transformations'
import Stats from 'three/examples/jsm/libs/stats.module'
import { scene, clock, stats, camera, renderer, orbitControls, textureLoader,lights,makeHelperObjects, loadTextures,
 makeGlassSphere, makeWater, keysPressed} from "./setup";
import {loadGltf, loadObj} from "./loaders/gltf";
import {fract} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {CameraControls} from "./controls/camera";
import {Light} from "./controls/light";
import {Hilbert} from "./helpers/hilbert/hilbert"
//@ts-ignore
import vertexShader from './shaders/vertexbasic.glsl'
//@ts-ignore
import fragmentShader from './shaders/raymarching.glsl'


/////////////////////////
let sceneBasicObjects:THREE.Object3D[] = []
////////////////////////
let flowText:Texture,nrmlText0:Texture,nrmlText1:Texture,rainbowText:Texture,cubeTexture:Texture,codeText:Texture;
[flowText, nrmlText0, nrmlText1, rainbowText, cubeTexture, codeText] = await loadTextures()
/////////////////////////
let gridHelper:GridHelper,
axesHelper:AxesHelper,
axes:Array<AxesHelper>;
[gridHelper, axesHelper, axes] = makeHelperObjects();

// sceneBasicObjects.push(gridHelper)
///////////////////////////////
let water:THREE.Object3D, water2:THREE.Object3D;
[water, water2] = makeWater(flowText, nrmlText0, nrmlText1)
// sceneBasicObjects.push(water, water2)

let glassSphere:THREE.Object3D = makeGlassSphere()
// sceneBasicObjects.push(glassSphere)
///////////////////////////////
let lightControls = new Light({
i:lights[1], k:lights[0], j:lights[3], l:lights[2]
 })
let controls = new CameraControls(orbitControls, camera);
///////////////////////////////
sceneBasicObjects.forEach(object => scene.add(object))
// scene.background = cubeTexture;
scene.background = new THREE.Color(0x212121);

///////////////////////////////
let monoRes = 200
let monoGeo = new THREE.PlaneGeometry(10, 10, monoRes-1, monoRes-1);
let monoMatTexture = new THREE.MeshPhongMaterial({
//     map: codeText
})

let monoMesh = new THREE.Mesh(monoGeo, monoMatTexture);
// scene.add(monoMesh)
monoMesh.position.z = 0.02
monoMesh.position.z = -20

/////////////////////////////

//random sleep to let texture load
await new Promise(f => setTimeout(f, 100));

let newData:Uint8Array = getTextureData(codeText);
let dataTexture = new THREE.DataTexture(newData, codeText.image.width, codeText.image.height);
monoMatTexture.map = dataTexture;

///////////
let scale = 1/100
let pixelSize = scale*2
let downSample = 10;
let pixelArray:Float32Array=new Float32Array(codeText.image.width*codeText.image.height*3);
for(let i=0; i<codeText.image.height; i++) {
    for(let j=0; j<codeText.image.width; j++) {
        const index = codeText.image.width*i + j
        pixelArray[3*index + 0] = j*scale - codeText.image.width*scale/2
        pixelArray[3*index + 1] = i*scale - codeText.image.height*scale/2
        pixelArray[3*index + 2] = 0
    }
}
let pointsMesh = getPointMesh(pixelArray, pixelSize)
scene.add(pointsMesh)

let originalPosArray:Float32Array = pixelArray
let finalPosArray = new Float32Array(codeText.image.width*codeText.image.height*3)
for(let i=0; i<80; i++) {
    for(let j=0; j<100; j++) {
        for(let k=0; k<80; k++) {
            const index = i*80*100 + j*80 + k
            finalPosArray[3*index + 0] = i - 40
            finalPosArray[3*index + 1] = j - 50
            finalPosArray[3*index + 2] = k - 40
        }
    }
}
finalPosArray.sort(() => Math.random() - 0.5)

//////////
let catObj:any = await loadObj('./obj/Cat.obj')
let catObjPosArr = getGeometryPoints(catObj.children[0].geometry)
for(let i=0; i<catObjPosArr.length; i++) {
    let currPos = new THREE.Vector3(catObjPosArr[i + 0],catObjPosArr[i + 1],catObjPosArr[i + 2])
    currPos.multiplyScalar(0.3)
    currPos.applyAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2)

    catObjPosArr[i+0] = currPos.x;
    catObjPosArr[i+1] = currPos.y;
    catObjPosArr[i+2] = currPos.z;
}

function animate() {
    let time:number = clock.getElapsedTime()*1;

    if (time % 5 < 0.1)
    {
        newData.set(updatePixelData(newData, time, new THREE.Vector2(codeText.image.width, codeText.image.height)));
    }
    dataTexture.needsUpdate = true;


    let colorsArray = Float32Array.from(newData);
    pointsMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(Float32Array.from(newData), 4))

    const pointsPos = pointsMesh.geometry.getAttribute('position').array
    let newPosArray = new Float32Array(pointsPos.length)
    let t = THREE.MathUtils.clamp(1.2*Math.cos(time/10), 0, 1)
//     t=1
    for(let i=0; i<pointsPos.length; i+=3) {
        let currPositionAbsolute = new THREE.Vector3(originalPosArray[i],originalPosArray[i+1],originalPosArray[i+2])
//         newPosArray[i + 0] = originalPosArray[i + 0]*t + finalPosArray[i + 0]*(1-t)
//         newPosArray[i + 1] = originalPosArray[i + 1]*t + finalPosArray[i + 1]*(1-t)
//         newPosArray[i + 2] = originalPosArray[i + 2]*t + finalPosArray[i + 2]*(1-t)


        let uvY = (Math.floor(Math.floor(i/3)/codeText.image.width) - codeText.image.width/2)/100
        let uvX = (Math.floor(Math.floor(i/3)%codeText.image.width) - codeText.image.width/2)/100
        let uvR = Math.sqrt(uvX*uvX + uvY*uvY)
        let rotationAxis = new THREE.Vector3(0, uvY, uvX).normalize();
        let delta = new THREE.Vector3(uvX, 0, uvY).normalize().multiplyScalar(1/uvR);

        currPositionAbsolute.add(delta.applyAxisAngle(rotationAxis, time/10));

//         newPosArray[i + 0] = originalPosArray[i + 0]*t + currPositionAbsolute.x*(1-t);
//         newPosArray[i + 1] = originalPosArray[i + 1]*t + currPositionAbsolute.y*(1-t);
//         newPosArray[i + 2] = originalPosArray[i + 2]*t + currPositionAbsolute.z*(1-t);

        newPosArray[i + 0] = originalPosArray[i + 0]*t + catObjPosArr[(i + 0 )% catObjPosArr.length]*(1-t)
        newPosArray[i + 1] = originalPosArray[i + 1]*t + catObjPosArr[(i + 1 )% catObjPosArr.length]*(1-t)
        newPosArray[i + 2] = originalPosArray[i + 2]*t + catObjPosArr[(i + 2 )% catObjPosArr.length]*(1-t)
    }
//     for(let i=0; i<pointsPos.length; i+=3) {
//             let uvY = Math.floor(Math.floor(i/3)/codeText.image.width)
//             let uvX = Math.floor(Math.floor(i/3)%codeText.image.width)
//
//             let x = pointsPos[i + 0]
//             let y = pointsPos[i + 1]
//             let z = pointsPos[i + 2]
//
//             let timeFrac = (time%10) - Math.floor(time%10)
//             let curvePos = pathVector[uvX][uvY][Math.floor(time%10)].clone().multiplyScalar(timeFrac).clone().add(
//                 pathVector[uvX][uvY][Math.floor((time+1)%10)].clone().multiplyScalar(1-timeFrac))
//
//             newPosArray[i + 0] = originalPosArray[i + 0] + curvePos.x
//             newPosArray[i + 1] = originalPosArray[i + 1] + curvePos.y
//             newPosArray[i + 2] = originalPosArray[i + 2] + curvePos.z
//         }
    pointsMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(burn(newPosArray, time), 3))

    const pointsCol = pointsMesh.geometry.getAttribute('color').array
    let newColArray = new Float32Array(pointsCol.length)
    for(let i=0; i<pointsCol.length; i+=4) {
        let r = pointsCol[i + 0]
        let g = pointsCol[i + 1]
        let b = pointsCol[i + 2]

        newColArray[i + 0] = pointsCol[i + 0]
        newColArray[i + 1] = pointsCol[i + 1]
        newColArray[i + 2] = pointsCol[i + 2]
        newColArray[i + 3] = pointsCol[i + 3]
    }
    pointsMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColArray, 4))


    controls.updateCamera(camera, orbitControls, keysPressed, clock.getDelta())
    lightControls.updateLights(keysPressed, time)


    camera.updateProjectionMatrix()
    stats.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()
// renderer.setAnimationLoop(animate);
function updatePixelData(array:Uint8Array, time:number, dimensions:THREE.Vector2):Uint8Array {
    let returnArray:Uint8Array = new Uint8Array(dimensions.x*dimensions.y*4);
    let pixelMatrix = []

    for(let i=0; i<dimensions.x; i++) {
        let pixelMatrixRow = []
        for(let j=0; j<dimensions.y; j++) {
            let index = 4*(i*dimensions.x + j);
``
            pixelMatrixRow.push(new THREE.Vector3(
                newData[index],
                newData[index+1],
                newData[index+2],
            ))
//             let grayScale = 0.299*newData[index] + 0.587*newData[index+1] + 0.114*newData[index+2]
//             pixelMatrixRow.push(new THREE.Vector3(
//                 grayScale, grayScale, grayScale
//             ))
        }
        pixelMatrix.push(pixelMatrixRow);
    }

    for(let i=0; i<pixelMatrix.length; i++) {
        for(let j=0; j<pixelMatrix[0].length; j++) {
            let currColor = pixelMatrix[i][j];
//             let grayFloat = 0.299*currColor.x + 0.587*currColor.y + 0.114*currColor.z;
//             currColor = new THREE.Vector3(grayFloat, grayFloat, grayFloat)
            let colorError = new THREE.Vector3();
            let newColor = new THREE.Vector3(
                currColor.x > 255/2 ? 255 : 0,
                currColor.y > 255/2 ? 255 : 0,
                currColor.z > 255/2 ? 255 : 0,
            );
            pixelMatrix[i][j] = newColor;
            colorError = currColor.clone().sub(newColor);

            if (j<pixelMatrix[0].length-1) {
                pixelMatrix[i][j+1].add(colorError.clone().multiplyScalar(7/16));
            }

            if (i<pixelMatrix.length-1) {
                pixelMatrix[i+1][j].add(colorError.clone().multiplyScalar(5/16));
                if (j<pixelMatrix[0].length-1) {
                    pixelMatrix[i+1][j+1].add(colorError.clone().multiplyScalar(1/16));
                }
                if (j > 0) {
                    pixelMatrix[i+1][j-1].add(colorError.clone().multiplyScalar(3/16));
                }
            }

        }
    }

    for(let i=0; i<pixelMatrix.length; i++) {
        for(let j=0; j<pixelMatrix[0].length; j++) {
            let color = pixelMatrix[i][j];

            returnArray[4*(i*pixelMatrix.length + j) + 0] = color.x;
            returnArray[4*(i*pixelMatrix.length + j) + 1] = color.y;
            returnArray[4*(i*pixelMatrix.length + j) + 2] = color.z;
            returnArray[4*(i*pixelMatrix.length + j) + 3] = 255;

        }
    }
    return returnArray;
}

function getTextureData(texture:Texture):Uint8Array {
    const canvas:HTMLCanvasElement = document.createElement( 'canvas' );
    canvas.width = codeText.image.width;
    canvas.height = codeText.image.height;

    const context:CanvasRenderingContext2D = canvas.getContext( '2d' )!;
    context.drawImage( codeText.image, 0, 0 );
    const data = context.getImageData( 0, 0, canvas.width, canvas.height );
    let newData:Uint8Array = new Uint8Array(data.data.length);
    for(let i=0; i<data.data.length; i++) {
        newData[i] = data.data[i];
    }
    return newData;
}