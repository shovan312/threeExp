import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
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

type cubePipeObj = {
    cube: THREE.Mesh,
    velocity: THREE.Vector3
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
// scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

const pointLight = new THREE.PointLight(0xffffff, 10, 0, 2)
const pointLight2 = new THREE.PointLight(0xffffff, 10, 0, 2)
const pointLight3 = new THREE.PointLight(0xffffff, 10, 0, 1)
const pointLight4 = new THREE.PointLight(0xffffff, 10, 0, 1)
const pointLight5 = new THREE.PointLight(0xffffff, 10, 0, 1)
const pointLight6 = new THREE.PointLight(0xffffff, 10, 0, 1)
pointLight.position.x = 5
pointLight2.position.x = -5
pointLight3.position.x = -20
pointLight4.position.x = 20
pointLight5.position.y = -20
pointLight6.position.y = 20
scene.add(pointLight)
scene.add(pointLight2)
scene.add(pointLight3)
scene.add(pointLight4)
scene.add(pointLight5)
scene.add(pointLight6)
// const camera = new THREE.OrthographicCamera(
//     -10,10,10,-10,0.001,100
// )
camera.position.set(5,0,5)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)

/////////////
const lattices:Array<THREE.Points> = [];
makeLattice(n, 0.005)
makeLattice(2*n/3, 0.1)
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

/////////////////

const cubePipes:Array<cubePipeObj> = []
makeCubePipe(lattices[0])
makeCubePipe(lattices[0])
makeCubePipe(lattices[0])
makeCubePipe(lattices[0])
makeCubePipe(lattices[0])
makeCubePipe(lattices[0])
makeCubePipe(lattices[0])

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
    const time = clock.getElapsedTime()*1000
    requestAnimationFrame(animate)

    if (time < 9000) {
        spheres.forEach(sphere =>sphere.visible = false)
        boxes.forEach(box => box.visible = false)
        rings.forEach(ring => ring.visible = false)
    }
    if (time > 9000) {
        spheres.forEach(sphere =>sphere.visible = true)
        boxes.forEach(box => box.visible = true)
        rings.forEach(ring => ring.visible = true)
    }

    // scene.rotateY(0.001)
    scene.rotateX(0.001)
    
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

    if(time > 3000 && lattices[1].rotation.y < Math.PI) {
        // lattices[1].geometry.rotateY(0.001)
        lattices[1].geometry.rotateX(0.001)
    }

    // const latticeArr = lattices[0].geometry.getAttribute('position').array
    // for(let i=0; i<latticeArr.length; i+=3) {
        // transformPoint(latticeArr, i, 2, 4, time)
    // }
    // lattices[0].geometry.setAttribute('position', new THREE.BufferAttribute(latticeArr, 3))

    moveCubePipe(lattices[0])
    if(time > 3000 && time < 3010) {
        changeVelocities()
    }
    if(time > 6000 && time < 6010) {
        changeVelocities()
    }if(time > 9000 && time < 9010) {
        changeVelocities()
    }
    for(let i=0; i<cubePipes.length; i++) {
        cubePipes[i].cube.rotateX(0.01)
        cubePipes[i].cube.rotateY(0.03  )
    }

    //debug.innerText = 'Matrix\n' + cube.matrix.elements.toString().replace(/,/g, '\n')
    if (time < 9000) {
        camera.fov = 50 + 50*Math.sin(time/2000);
    }
    else {
        camera.fov = 50 + 50*Math.sin(9/2 + (time-9000)/8000);
    }
    camera.updateProjectionMatrix()
    stats.update()
}

function render() {
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

function makeLattice(n:number, size:number) {
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
        size:size,
        color: 0xffffff
    
    }))
    scene.add(latticeMesh)
    lattices.push(latticeMesh)

}

function makeSphere(r:number, col: THREE.ColorRepresentation) {
    const geo = new THREE.SphereGeometry(r,20,20);
    const mat = new THREE.MeshLambertMaterial(
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
    const geo = new THREE.BoxGeometry(w,h,d,5,5,5);
    const mat = new THREE.MeshLambertMaterial(
        {
            color: col,
            wireframe: false,
        }
    )
    
    const box = new THREE.Mesh(geo, mat)
    boxes.push(box)
    scene.add(box)
}


function makeRing(r1:number, r2:number, col: THREE.ColorRepresentation) {
    const geo = new THREE.TorusGeometry(r1, r2, 90, 9);
    const mat = new THREE.MeshLambertMaterial(
        {
            color: col,
            wireframe: false
        }
    )

    const ring = new THREE.Mesh(geo, mat)
    rings.push(ring)
    scene.add(ring)
}

function makeCubePipe(lattice:THREE.Points) {
    const n = Math.floor(Math.cbrt(
        lattice.geometry.getAttribute('position').array.length/3));

    const pipeGeo = new THREE.BoxGeometry(3,3,3,5,5,5);
    const pipeMat = new THREE.MeshLambertMaterial({
        color: pallette[Math.floor(1 + Math.random()*6)],
        wireframe: false
    })
    const cubePipe = new THREE.Mesh(pipeGeo, pipeMat)
    const dir = Math.floor(8*Math.random())
    cubePipes.push({
        cube: cubePipe,
        velocity: new THREE.Vector3(
            0.08*Math.floor(Math.random() * 2),
            0.08*Math.floor(Math.random() * 2),
            0.08*Math.floor(Math.random() * 2)
            )
    })
    scene.add(cubePipe)

    cubePipe.position.set(
        Math.ceil(n*Math.random()) - n/2,
        Math.ceil(n*Math.random()) - n/2,
        Math.ceil(n*Math.random()) - n/2
    )
}

function moveCubePipe(lattice:THREE.Points) {
    const n = Math.floor(Math.cbrt(
        lattice.geometry.getAttribute('position').array.length/3));
    for(let i=0; i<cubePipes.length; i++) {
        cubePipes[i].cube.position.add(
            cubePipes[i].velocity
        )
        if(isOutside(cubePipes[i].cube.position, n)) {
            cubePipes[i].velocity.multiplyScalar(-1);
        }
    }
}

function changeVelocities() {
    for(let i=0; i<cubePipes.length; i++) {
        const dir = Math.floor(8*Math.random())
        cubePipes[i].velocity = new THREE.Vector3(
            0.08*Math.floor(Math.random() * 2),
            0.08*Math.floor(Math.random() * 2),
            0.08*Math.floor(Math.random() * 2)
            )
    }
}

function isOutside(pos: THREE.Vector3, n:number):boolean {
    return pos.x > n/2 || 
        pos.x < -n/2 || 
        pos.y > n/2 || 
        pos.y < -n/2 || 
        pos.z > n/2 || 
        pos.z < -n/2 
}

// function transformPoint(latticeArr:THREE.TypedArray, 
//     i:number, 
//     t1:number, 
//     t2:number,
//     time:number) {
//         const curr = new THREE.Vector3(
//             latticeArr[i],
//             latticeArr[i+1],
//             latticeArr[i+2]
//         )
//         const target = new THREE.Vector3(
//             0,0,0
//         )
//         if (time > t1 && time < t2) {
//             const t = (time-t1)/(t2-t1);
            
//             latticeArr[i] = latticeArr[i];
//             latticeArr[i+1] = latticeArr[i+1];
//             latticeArr[i+2] = latticeArr[i+2];
//         }
//     }