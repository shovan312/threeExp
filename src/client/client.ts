import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'

type sphereData = {
    radius: number,
    widthSegments: number,
    heightSegments: number,
    phiStart: number,
    phiLength: number,
    thetaStart: number,
    thetaLength: number,
}

let n = 40

let pallette = [
    0x000000,
    0xff0000,
    0x00ff00,
    0x0000ff,
    0xffff00,
    0xff00ff,
    0x00ffff,
    0xffffff,
]

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

// const camera = new THREE.OrthographicCamera(
//     -10,10,10,-10,0.001,100
// )
camera.position.set(5,0,5)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

/////////////
makeLattice()
////////////
const spheres:Array<THREE.Mesh> = []
const spheresData:Array<sphereData> = []

makeSphere(4, 0xff0000)
makeSphere(4, 0x00ff00)
makeSphere(4, 0x0000ff)
spheres[0].position.x = -15
spheres[2].position.x = 15
/////////////

const boxes:Array<THREE.Mesh> = []

makeBox(2,2,2, 0x0000ff)

for(let i=0; i<10; i++) {
    makeBox(2,2,2, pallette[1 + i % 7])
    boxes[i].add(boxes[i+1])
    boxes[i+1].position.set(0,6,0)
}
///////////////////

const rings:Array<THREE.Mesh> = []
makeRing(7,1, 0xff0000)
makeRing(15,1, 0x00ff00)
makeRing(25,1, 0x0000ff)
rings[0].add(rings[1])
rings[1].add(rings[2])

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
const camFolder = gui.addFolder('Camera')
const camPropertiesFolder = camFolder.addFolder('Properties')
camPropertiesFolder.add(camera, 'fov', 0, 360)

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
const debug = document.getElementById('debug1') as HTMLDivElement
const clock = new THREE.Clock()
function animate() {
    requestAnimationFrame(animate)
    const time = clock.getElapsedTime()

    scene.rotateY(0.001)
    // scene.rotateX(0.001)
    
    // let newPosition:THREE.Vector= path.getPoint((time % 2000)/2000)
    // let pos:THREE.Vector3 = new THREE.Vector3(
    //     newPosition.getComponent(0),
    //     newPosition.getComponent(1),
    //     newPosition.getComponent(2)
    // );
    // sphere.position.copy(pos)
    // sphere.position.x = 4+Math.sin(time/1000);
    // sphere.position.z = 4+Math.sin(time/1000);
    // spheresData[0].heightSegments = Math.floor(3 + Math.abs(30*Math.sin(time/3000)))
    // spheresData[2].widthSegments = Math.floor(3 + Math.abs(30*Math.cos(time/3000)))
    spheresData[0].thetaLength = time/2000
    spheresData[2].phiLength = time/2000
    regenerateSphereGeometry(0)
    regenerateSphereGeometry(1)
    regenerateSphereGeometry(2)
    render()

    camera.fov = 50 + 50*Math.sin(time/5000);
    camera.updateProjectionMatrix()

    for(let i=0; i<boxes.length; i++) {
        boxes[i].position.set(
            1 + 4*Math.cos(time/1000),
            1 + 4*Math.sin(time/1000),
            1,
        )
        boxes[i].rotation.set(
            0,
            0,
            Math.PI*Math.sin(time/4000),
        )
    }
    boxes[0].rotateX(2*Math.PI*Math.sin(time/2000))

    for(let i=0; i<rings.length; i++) {
        rings[i].rotation.set(
            0,
            Math.PI/2*Math.cos(time/1000),
            Math.PI/6*Math.sin(time/1000))
    }
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

function makeLattice() {
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
}

function makeSphere(r:number, col: THREE.ColorRepresentation) {
    const geo = new THREE.SphereGeometry(r,20,20);
    const mat = new THREE.MeshBasicMaterial(
        {
            color: col,
            wireframe: true,
        }
    )
    
    const sphere = new THREE.Mesh(geo, mat)
    spheres.push(sphere)
    scene.add(sphere)
    spheresData.push({
        radius: r,
        widthSegments: 6,
        heightSegments: 6,
        phiStart: 0,
        phiLength: Math.PI * 2,
        thetaStart: 0,
        thetaLength: Math.PI,
    })
}

function makeBox(w:number,h:number,d:number, col: THREE.ColorRepresentation) {
    const geo = new THREE.BoxGeometry(w,h,d,20,20,20);
    const mat = new THREE.MeshBasicMaterial(
        {
            color: col,
            wireframe: true,
        }
    )
    
    const box = new THREE.Mesh(geo, mat)
    boxes.push(box)
    scene.add(box)
}


function makeRing(r1:number, r2:number, col: THREE.ColorRepresentation) {
    const geo = new THREE.TorusGeometry(r1, r2, 90, 9);
    const mat = new THREE.MeshBasicMaterial(
        {
            color: col,
            wireframe: true
        }
    )

    const ring = new THREE.Mesh(geo, mat)
    rings.push(ring)
    scene.add(ring)
}