import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
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

const sphereGeometry = new THREE.SphereGeometry(4,20,20)
const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
})
const sphere = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere)

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

const posArray2:Float32Array = new Float32Array(3*n*n*n);
for(let i=0; i<n*n*n; i+=3) {
    posArray2[i] = 25*Math.sin(Math.PI*2*i/(n*n*n));
    posArray2[i+1] = 25*Math.cos(Math.PI*2*i/(n*n*n));
    posArray2[i+2] = 0;
}
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

const sphereData = {
    radius: 1,
    widthSegments: 8,
    heightSegments: 6,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI,
}

function regenerateSphereGeometry() {
    const newGeometry = new THREE.SphereGeometry(
        sphereData.radius,
        sphereData.widthSegments,
        sphereData.heightSegments,
        sphereData.phiStart,
        sphereData.phiLength,
        sphereData.thetaStart,
        sphereData.thetaLength
    )
    sphere.geometry.dispose()
    sphere.geometry = newGeometry
}


const clock = new THREE.Clock()
function animate() {
    const time = clock.getElapsedTime()
    requestAnimationFrame(animate)


    // scene.rotateY(0.0001)
    // scene.rotateX(0.001)
    
    sphere.position.x = 4+Math.sin(time/1000);
    sphere.position.z = 4+Math.sin(time/1000);
    sphereData.thetaLength = time/2000
    // sphereData.widthSegments = Math.floor(3 + Math.abs(30*Math.cos(time/3000)))
    
    const currArray = new Float32Array(latticeGeo.getAttribute('position').array)
    morph(currArray, posArray2, time/10000)
    latticeMesh.geometry.setAttribute('position', new THREE.BufferAttribute(currArray, 3))

    
    
    regenerateSphereGeometry()
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()

///////////

function morph(from:Float32Array, to:Float32Array, t:number) {
    for(let i = 0; i < from.length; i++) {
        from[i] = from[i] + t*(to[i] - from[i])
    }
}


