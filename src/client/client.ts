import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const stats = new Stats()
document.body.appendChild(stats.dom)
const gui = new GUI()
const clock = new THREE.Clock()
let time:number;

let n = 40
const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(10))

///
const loader:OBJLoader = new OBJLoader();
function loadObj( path:string, name:string ):Promise<THREE.Group>{
  return new Promise(function( resolve, reject ){
    var progress = undefined;
    loader.setPath( path );
    loader.load( name + ".obj", resolve, progress, reject );   
  });
}

var manGroup:THREE.Group = await loadObj( "obj/", "FinalBaseMesh" );
const manMesh:THREE.Mesh = manGroup.children[0] as THREE.Mesh;
const manArr = manMesh.geometry.getAttribute('position').array
const posArray4:Float32Array = new Float32Array(manArr.length)
for(let i=0; i<manArr.length; i+=3) {
    posArray4[i] = manArr[i];
    posArray4[i+1] = manArr[i+1]-10;
    posArray4[i+2] = manArr[i+2];
}

manMesh.position.x = -10
manMesh.position.y -= 10;
scene.add(manMesh)
manMesh.visible = false;
////

const pointLight1 = new THREE.PointLight(0xff0055, 10);
const pointLight2 = new THREE.PointLight(0x5500ff, 10);
// pointLight1.position.x = 5
// pointLight2.position.x = -5
scene.add(pointLight1)
scene.add(pointLight2)

/////

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

// const camera = new THREE.OrthographicCamera(
//     -10,10,10,-10,0.001,1000
// )
camera.position.x = 70
camera.position.y = 0
camera.position.z = 70

/////
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 0.0);
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)

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

const latticeGeo = new THREE.BufferGeometry;

let colors:any[] = []
const color = new THREE.Color();
let posArray:Float32Array = new Float32Array(3*n*n*n);
for(let i=0; i < n; i++) {
    for(let j=0; j<n; j++) {
        for(let k=0; k<n; k++) {
            posArray[3*(n*n*i + n*j + k) + 0] = i - (n-1)/2;
            posArray[3*(n*n*i + n*j + k) + 1] = j - (n-1)/2;
            posArray[3*(n*n*i + n*j + k) + 2] = k - (n-1)/2;

            color.setRGB(i/n,j/n,k/n,THREE.SRGBColorSpace)
            colors.push(color.r, color.g, color.b)
        }
    }
}

// let posArray2 = new Float32Array(3*11*11*(10));
// for(let i=0; i<10; i++) {
//     const sphereGeometry = new THREE.SphereGeometry(7*(i+1),10,10)
//     const geoArr = sphereGeometry.getAttribute('position').array;
//     for(let j=0; j<geoArr.length; j++) {
//         let k=0
//         // if(j % 3 == 0 ) {
//         //     k=20
//         // } 
//         posArray2[11*11*3*i + j] = k + geoArr[j]
//     }
// }

// const sArr = sphereGeometry.getAttribute('position').array;
// let posArray2:Float32Array = new Float32Array(sArr.length);
// for(let i=0; i<sArr.length; i++) {
//     posArray2[i] = sArr[i]
// }

// for(let i=0; i<n*n*n; i+=3) {
//     posArray2[i] = 25*Math.sin(Math.PI*2*i/(n*n*n));
//     posArray2[i+1] = 25*Math.cos(Math.PI*2*i/(n*n*n));
//     posArray2[i+2] = 0;
// }

let posArray2:Float32Array = new Float32Array(3*n*n*n);
for(let i=0; i < n; i++) {
    for(let j=0; j<n; j++) {
        for(let k=0; k<n; k++) {
            const off = [
                10,0,0
                // 0.001*i*j*k,
                // 0.001*i*j*k,
                // 0.001*i*j*k
            ]
            const scale = [
                1,1,1
                // 0.1,
                // 0.1,
                // 0.1
            ]
            posArray2[3*(n*n*i + n*j + k) + 0] = off[0] + scale[0]*(i - (n-1)/2);
            posArray2[3*(n*n*i + n*j + k) + 1] = off[1] + scale[1]*(j - (n-1)/2);
            posArray2[3*(n*n*i + n*j + k) + 2] = off[2] + scale[2]*(k - (n-1)/2);
        }
    }
}

let posArray3:Float32Array = new Float32Array(3*n*n*n);
for(let i=0; i < n; i++) {
    for(let j=0; j<n; j++) {
        for(let k=0; k<n; k++) {
            posArray3[3*(n*n*i + n*j + k) + 0] = i - (n-1)/2 + 100;
            posArray3[3*(n*n*i + n*j + k) + 1] = j - (n-1)/2;
            posArray3[3*(n*n*i + n*j + k) + 2] = k - (n-1)/2;
        }
    }
}

posArray = rearrangeArr(posArray)
// .slice(0,100000)
posArray2 = rearrangeArr(posArray2)
// .slice(0,1302)

latticeGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const latticeMesh = new THREE.Points(latticeGeo, new THREE.PointsMaterial({
    size:0.1,
    // color: 0xffffff,
    vertexColors: true
}))
console.log(colors)
latticeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
scene.add(latticeMesh)

///////////

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    //@ts-ignore
    if(!camera.isOrthographicCamera) camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

///////////

function animate() {
    requestAnimationFrame(animate)
    // scene.rotateX(-0.001)
    // scene.rotateY(0.003)
    time = clock.getElapsedTime()

    pointLight1.position.x = -10 +5*Math.sin(5*time) 
    pointLight1.position.z = 5*Math.cos(5*time) 
    pointLight2.position.x = 10 + 5*Math.sin(5*time) 
    pointLight2.position.z = 5*Math.cos(5*time) 
    
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
    // const newArray:Float32Array = wave(burn(posArray, time), 0.7, 0.5, 5)
    const newArray:Float32Array = wave(posArray, 0.7, 0.5, 5)
    // const newArray:Float32Array = posArray;
    // const newArray:Float32Array = burn(posArray4, time)
    let newColArray = [];
    for(let i=0; i<colors.length; i+=3) {
        // newColArray.push(colors[i]*(0.5+0.2*Math.sin(10*time)))
        let r = colors[i + 0]
        let g = colors[i + 1]
        let b = colors[i + 2]
        // newColArray.push(r)
        // newColArray.push(g)
        // newColArray.push(b)
        newColArray.push(r + (0.2-r)*Math.sin(g + 3*time))
        newColArray.push(g + (0.2-g)*Math.cos(b + time))
        newColArray.push(b + (1-1)*Math.sin(r + 4*time))
    }

    latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(newArray, 3))
    latticeMesh.geometry.setAttribute('color', new THREE.Float32BufferAttribute(newColArray, 3))
    // latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(posArray2, 3))
    
    // camera.fov = 5 + Math.abs(100*Math.sin(time/5))
    
    
    camera.updateProjectionMatrix()
    stats.update()
    render()
}

function render() {
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
    
}
animate()

///////////

function wave(arr:Float32Array, A:number, k:number, w:number) {
    let ret = new Float32Array(arr.length);
    for(let i=0; i<arr.length; i+=3) {
        const ind = Math.floor(i/3)
        let x = arr[3*ind + 0]
        let y = arr[3*ind + 1]
        let z = arr[3*ind + 2]
        let posVec = new THREE.Vector3(x,y,z)
        posVec = disp(posVec, A, k, w)

        ret[3*ind + 0] = posVec.x
        ret[3*ind + 1] = posVec.y
        ret[3*ind + 2] = posVec.z 
    }
    return ret;
}

function disp(vec:THREE.Vector3, A:number, k:number, w:number):THREE.Vector3 {
    //Plane waves along axes
    // vec.x +=  A*Math.sin(k*vec.x + w*time)
    // vec.y +=  A*Math.sin(k*vec.y + w*time)
    // vec.z +=  A*Math.sin(k*vec.z + w*time)

    //Sin waves along axes
    // vec.x += A*Math.sin(k*vec.y + w*time)

    //Composite waves
    // vec.x += 0.1*vec.x*A*Math.sin(k*vec.z + k*vec.y + w*time)

    //3D Radial waves
    let r = vec.length()
    let disp = 0.1*Math.sin(r - 5*time);
    vec.multiplyScalar(1 + disp)

    //2D Radial waves
    // let r = Math.sqrt(vec.x*vec.x + vec.y*vec.y)
    // let disp = 0.1*Math.sin(r - 5*time)
    // vec.multiplyScalar(1 + disp)


    return vec;
}

function burn(arr:Float32Array, time:number) {
    //manArr is 146754
    const len = arr.length/3
    const ret = new Float32Array(arr.length)
    const winLen = Math.floor(len/3)
    const winStart = time*70000 % (len)
    const winEnd =( winLen + winStart) % (len)
    for(let i=0; i<arr.length; i+=3) {
        const ind = Math.floor(i/3)
        let isValid = false;
        if (winEnd > winStart) {
            isValid = ind > winStart && ind < winEnd
        }
        else {
            isValid = (ind > 0 && ind < winEnd) || (ind > winStart && ind < len)
        }
        if ( isValid) {  
            ret[i + 0] = arr[i + 0]; 
            ret[i + 1] = arr[i + 1]; 
            ret[i + 2] = arr[i + 2];
        }         
    }
    return ret;
}

function morph(from:Float32Array, to:Float32Array, time:number): Float32Array {
    // if(from.length == to.length) {
    //     const ret = new Float32Array(from.length);
    //     for(let i = 0; i < from.length; i+=3) {
    //         ret[i + 0] = from[i + 0] + t*(to[i + 0] - from[i + 0])
    //         ret[i + 1] = from[i + 1] + t*(to[i + 1] - from[i + 1])
    //         ret[i + 2] = from[i + 2] + t*(to[i + 2] - from[i + 2])
    //     }
    //     return ret
    // }
    // else if(from.length > to.length) {
    //     const ret = new Float32Array(from.length);
    //     for(let i = 0; i < from.length; i+=3) {
    //         const ind = Math.floor(i/3)
    //         const newInd = ind*100003%(to.length/3)
    //         ret[3*ind + 0] = from[3*ind + 0] + t*(to[3*newInd + 0] - from[3*ind + 0])
    //         ret[3*ind + 1] = from[3*ind + 1] + t*(to[3*newInd + 1] - from[3*ind + 1])
    //         ret[3*ind + 2] = from[3*ind + 2] + t*(to[3*newInd + 2] - from[3*ind + 2])
    //     }
    //     return ret
    // }
    // else {
        const ret = new Float32Array(to.length);
        for(let i = 0; i < to.length; i+=3) {
            const ind = Math.floor(i/3)
            const newInd = ind*100003%(to.length/3)
            const t = THREE.MathUtils.clamp(1.01*Math.sin(time + ind/3*(to.length/3)), 0, 1)
            ret[3*ind + 0] = from[3*newInd + 0] + t*(to[3*ind + 0] - from[3*newInd + 0])
            ret[3*ind + 1] = from[3*newInd + 1] + t*(to[3*ind + 1] - from[3*newInd + 1])
            ret[3*ind + 2] = from[3*newInd + 2] + t*(to[3*ind + 2] - from[3*newInd + 2])
        }
        return ret
    // }

}

function rearrangeArr(inp:Float32Array):Float32Array {
    let inp2Vec:Array<THREE.Vector3> = [];
    for(let i=0; i<inp.length; i+=3) {
        inp2Vec.push(new THREE.Vector3(
            inp[i], inp[i+1], inp[i+2]
        ));
    }
    inp2Vec.sort(byZ)
    // inp2Vec.sort(byR)
    let out:Float32Array = new Float32Array(inp.length)
    for(let i=0; i<inp2Vec.length; i++) {
        out[3*i + 0] = inp2Vec[i].x;
        out[3*i + 1] = inp2Vec[i].y;
        out[3*i + 2] = inp2Vec[i].z;
    }

    return out;
}

function byX(a:THREE.Vector3, b:THREE.Vector3):number {
    if(a.x < b.x) return -1;
    else if(a.x > b.x) return 1;
    return 0;
}

function byY(a:THREE.Vector3, b:THREE.Vector3):number {
    if(a.y < b.y) return -1;
    else if(a.y > b.y) return 1;
    return 0;
}

function byZ(a:THREE.Vector3, b:THREE.Vector3):number {
    if(a.z < b.z) return -1;
    else if(a.z > b.z) return 1;
    return 0;
}

function byR(a:THREE.Vector3, b:THREE.Vector3):number {
    let r1:number = a.length()
    let r2:number = b.length()
    let delta:number = r2-r1
    if(delta > 0.0001) return -1;
    else if(delta < -0.0001) return 1;

    let theta1:number = Math.atan2(a.y,a.x)
    let theta2:number = Math.atan2(b.y,b.x)
    // let theta1:number = a.projectOnPlane(new THREE.Vector3(0,0,1)).angleTo(new THREE.Vector3(1,0,0))
    // let theta2:number = b.projectOnPlane(new THREE.Vector3(0,0,1)).angleTo(new THREE.Vector3(1,0,0))
    if(theta1 < theta2) return -1;
    else if(theta1 > theta2) return 1;

    let phi1:number = a.angleTo(new THREE.Vector3(0,0,1))
    let phi2:number = b.angleTo(new THREE.Vector3(0,0,1))
    if(phi1 < phi2) return -1;
    else if(phi1 > phi2) return 1;

    return 0;
}


