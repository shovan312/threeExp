import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const loader:OBJLoader = new OBJLoader();

let n = 40

const scene = new THREE.Scene()
// scene.add(new THREE.AxesHelper(5))

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
    posArray4[i+1] = manArr[i+1] - 10;
    posArray4[i+2] = manArr[i+2];
}

manMesh.position.y -= 10;
scene.add(manMesh)
const manMesh2:THREE.Mesh = manMesh.clone();
manMesh.position.x = -10
manMesh2.position.x = 10
scene.add(manMesh2)
manMesh.visible = false;
manMesh2.visible = false;

// const pointLight1 = new THREE.PointLight(0xffffff, 10);
// const pointLight2 = new THREE.PointLight(0xffffff, 10);
// pointLight1.position.x = 5
// pointLight2.position.x = -5
// scene.add(pointLight1)
// scene.add(pointLight2)

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

// const camera = new THREE.OrthographicCamera(
//     -10,10,10,-10,0.001,100
// )
camera.position.x = 5
camera.position.y = 0
camera.position.z = 5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 0.0);
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)

// const sphereGeometry = new THREE.BoxGeometry(10,10,10,10,10,10)
// const posArray2 = new Float32Array(3*11*11*(10));
// for(let i=0; i<10; i++) {
//     const sphereGeometry = new THREE.SphereGeometry(2*(i+1),10,10)
//     const geoArr = sphereGeometry.getAttribute('position').array;
//     for(let j=0; j<geoArr.length; j++) {
//         let k=0
//         if(j % 3 == 0 ) {
//             k=20
//         } 
//         posArray2[11*11*3*i + j] = k + geoArr[j]
//     }
// }

const posArray2:Float32Array = new Float32Array(3*n*n*n);
for(let i=0; i < n; i++) {
    for(let j=0; j<n; j++) {
        for(let k=0; k<n; k++) {
            const off = [
                0,0,0
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

// const material = new THREE.MeshBasicMaterial({
//     color: 0x0000ff,
//     wireframe: true,
// })
// const sphere = new THREE.Mesh(sphereGeometry, material)
// scene.add(sphere)

const latticeGeo = new THREE.BufferGeometry;
const posArray:Float32Array = new Float32Array(3*n*n*n);
for(let i=0; i < n; i++) {
    for(let j=0; j<n; j++) {
        for(let k=0; k<n; k++) {
            posArray[3*(n*n*i + n*j + k) + 0] = i - (n-1)/2;
            posArray[3*(n*n*i + n*j + k) + 1] = j - (n-1)/2;
            posArray[3*(n*n*i + n*j + k) + 2] = k - (n-1)/2;
        }
    }
}
latticeGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const latticeMesh = new THREE.Points(latticeGeo, new THREE.PointsMaterial({
    size:0.005,
    color: 0xffffff

}))
scene.add(latticeMesh)

// const posArray2 = sphereGeometry.getAttribute('position').array
// const sArr = sphereGeometry.getAttribute('position').array;
// const posArray2:Float32Array = new Float32Array(sArr.length);
// for(let i=0; i<sArr.length; i++) {
    // posArray2[i] = sArr[i]
// }

// const posArray2:Float32Array = new Float32Array(3*n*n*n);
// for(let i=0; i < n; i++) {
//     for(let j=0; j<n; j++) {
//         for(let k=0; k<n; k++) {
//             posArray2[3*(n*n*i + n*j + k) + 0] = i - (n-1)/2;
//             posArray2[3*(n*n*i + n*j + k) + 1] = j - (n-1)/2;
//             posArray2[3*(n*n*i + n*j + k) + 2] = 0;
//         }
//     }
// }
// for(let i=0; i<n*n*n; i+=3) {
//     posArray2[i] = 25*Math.sin(Math.PI*2*i/(n*n*n));
//     posArray2[i+1] = 25*Math.cos(Math.PI*2*i/(n*n*n));
//     posArray2[i+2] = 0;
// }

const posArray3:Float32Array = new Float32Array(3*n*n*n);
for(let i=0; i < n; i++) {
    for(let j=0; j<n; j++) {
        for(let k=0; k<n; k++) {
            posArray3[3*(n*n*i + n*j + k) + 0] = i - (n-1)/2 + 100;
            posArray3[3*(n*n*i + n*j + k) + 1] = j - (n-1)/2;
            posArray3[3*(n*n*i + n*j + k) + 2] = k - (n-1)/2;
        }
    }
}



window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()


const clock = new THREE.Clock()
function animate() {
    const time = clock.getElapsedTime()
    requestAnimationFrame(animate)

    scene.rotateY(0.003)
    // scene.rotateX(0.001)
    
    // sphereData.thetaLength = time/2000
    // sphereData.widthSegments = Math.floor(3 + Math.abs(30*Math.cos(time/3000)))
    const t = THREE.MathUtils.clamp(1.01*Math.sin(time/6), 0, 1)
    const newArray:Float32Array = morph(
        posArray, 
        posArray4,
        // morph(
        //     posArray2,
        //     posArray3,
        //     t
        // ), 
        // 1,
        t
        )
    // const newArray:Float32Array = morph(posArray, posArray3, 1)
    // console.log(newArray.length)
    latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(newArray, 3))
    // latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(posArray2, 3))
    
    if(t == 1) {
        manMesh.visible = true;
        manMesh2.visible = true;
    }
    
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()

///////////

function morph(from:Float32Array, to:Float32Array, t:number): Float32Array {
    if(from.length == to.length) {
        const ret = new Float32Array(from.length);
        for(let i = 0; i < from.length; i++) {
            ret[i] = from[i] + t*(to[i] - from[i])
        }
        return ret
    }
    else if(from.length > to.length) {
        const ret = new Float32Array(from.length);
        for(let i = 0; i < from.length; i+=3) {
            const ind = Math.floor(i/3)
            const newInd = ind*100003%(to.length/3)
            ret[3*ind + 0] = from[3*ind + 0] + t*(to[3*newInd + 0] - from[3*ind + 0])
            ret[3*ind + 1] = from[3*ind + 1] + t*(to[3*newInd + 1] - from[3*ind + 1])
            ret[3*ind + 2] = from[3*ind + 2] + t*(to[3*newInd + 2] - from[3*ind + 2])
        }
        return ret
    }
    else {
        const ret = new Float32Array(to.length);
        for(let i = 0; i < to.length; i+=3) {
            const ind = Math.floor(i/3)
            const newInd = ind*100003%(to.length/3)
            ret[3*ind + 0] = from[3*newInd + 0] + t*(to[3*ind + 0] - from[3*newInd + 0])
            ret[3*ind + 1] = from[3*newInd + 1] + t*(to[3*ind + 1] - from[3*newInd + 1])
            ret[3*ind + 2] = from[3*newInd + 2] + t*(to[3*ind + 2] - from[3*newInd + 2])
        }
        return ret
    }

}


