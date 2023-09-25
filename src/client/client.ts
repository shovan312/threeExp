import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'

let n = 40

const scene = new THREE.Scene()
// scene.add(new THREE.AxesHelper(5))

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
const posArray2 = new Float32Array(3*10*10*(1+2+3+4+5+6+7+8+9));
for(let i=0; i<10; i++) {
    const sphereGeometry = new THREE.SphereGeometry(2*i,10*i,10*i)
    const geoArr = sphereGeometry.getAttribute('position').array;
    for(let j=0; j<geoArr.length; j++)
    posArray2[20*20*3*i + j] = geoArr[j]
}
// console.log(posArray2)
const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
})
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

latticeGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const latticeMesh = new THREE.Points(latticeGeo, new THREE.PointsMaterial({
    size:0.005,
    color: 0xffffff

}))
scene.add(latticeMesh)



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


    // scene.rotateY(0.0001)
    // scene.rotateX(0.001)
    
    // sphereData.thetaLength = time/2000
    // sphereData.widthSegments = Math.floor(3 + Math.abs(30*Math.cos(time/3000)))
    
    // const currArray = new Float32Array(latticeGeo.getAttribute('position').array)
    const newArray:Float32Array = morph(posArray, posArray2, Math.abs(Math.sin(time/10)))
    // const newArray:Float32Array = morph(posArray, posArray2, 1)
    // console.log(newArray.length)
    latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(newArray, 3))
    // latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    
    
    render()
    stats.update()
}

function render() {
    camera.updateProjectionMatrix()
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
            ret[3*i + 0] = from[3*newInd + 0] + t*(to[3*ind + 0] - from[3*newInd + 0])
            ret[3*i + 1] = from[3*newInd + 1] + t*(to[3*ind + 1] - from[3*newInd + 1])
            ret[3*i + 2] = from[3*newInd + 2] + t*(to[3*ind + 2] - from[3*newInd + 2])
        }
        return ret
    }

}


