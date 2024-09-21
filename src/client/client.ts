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
renderer.setSize(window.innerWidth,window.innerHeight)
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
latticeGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const latticeMesh = new THREE.Points(latticeGeo, new THREE.PointsMaterial({
    size:0.005,
    color: 0xffffff

}))
scene.add(latticeMesh)


const path = makePath();


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    // camera.aspect = window.innerWidth / window.innerHeight
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
const sphereFolder = gui.addFolder('Sphere')
const spherePropertiesFolder = sphereFolder.addFolder('Properties')
spherePropertiesFolder.add(sphereData, 'radius', 0.1, 30).onChange(regenerateSphereGeometry)
spherePropertiesFolder.add(sphereData, 'widthSegments', 1, 32).onChange(regenerateSphereGeometry)
spherePropertiesFolder.add(sphereData, 'heightSegments', 1, 16).onChange(regenerateSphereGeometry)
spherePropertiesFolder
    .add(sphereData, 'phiStart', 0, Math.PI * 2)
    .onChange(regenerateSphereGeometry)
spherePropertiesFolder
    .add(sphereData, 'phiLength', 0, Math.PI * 2)
    .onChange(regenerateSphereGeometry)
spherePropertiesFolder.add(sphereData, 'thetaStart', 0, Math.PI).onChange(regenerateSphereGeometry)
spherePropertiesFolder.add(sphereData, 'thetaLength', 0, Math.PI).onChange(regenerateSphereGeometry)

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
const debug = document.getElementById('debug1') as HTMLDivElement
const clock = new THREE.Clock()
function animate() {
    const time = clock.getElapsedTime()*1000
    requestAnimationFrame(animate)


    scene.rotateY(0.0001)
    scene.rotateX(0.001)
    
    // let newPosition:THREE.Vector= path.getPoint((time % 2000)/2000)
    // let pos:THREE.Vector3 = new THREE.Vector3(
    //     newPosition.getComponent(0),
    //     newPosition.getComponent(1),
    //     newPosition.getComponent(2)
    // );
    // sphere.position.copy(pos)
    sphere.position.x = 4+Math.sin(time/1000);
    sphere.position.z = 4+Math.sin(time/1000);
    // sphereData.heightSegments = Math.floor(3 + Math.abs(30*Math.sin(time/3000)))
    // sphereData.widthSegments = Math.floor(3 + Math.abs(30*Math.cos(time/3000)))
    sphereData.thetaLength = time/2000
    // sphereData.widthSegments = Math.floor(3 + Math.abs(30*Math.cos(time/3000)))
    regenerateSphereGeometry()
    render()

    //debug.innerText = 'Matrix\n' + cube.matrix.elements.toString().replace(/,/g, '\n')

    stats.update()
}

function render() {
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
    
}
animate()

///////////

function makePath() {
    const pointsPath = new THREE.CurvePath()
    const firstLine = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -1, 1, 1 ),
        new THREE.Vector3( -0.5, 1.5, 0 ),
        new THREE.Vector3( 2.0, 1.5, 0 ),
        new THREE.Vector3( -1, 0, 1 )
    );
    const secondLine = new THREE.LineCurve3(
        new THREE.Vector3(-1, 0, 0 ),
        new THREE.Vector3( -1, 1, 0 )
      );
      pointsPath.add(firstLine);
      pointsPath.add(secondLine);

      return pointsPath;
}