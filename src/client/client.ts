import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    190, 
    window.innerWidth / window.innerHeight, 
    0.01, 
    10
    )
camera.position.z = 1.1

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const geometry = new THREE.SphereGeometry()
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

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
const cubeFolder = gui.addFolder('Cube')
cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.add(camera, 'far', 1, 30)
cameraFolder.add(camera, 'near', 0, 10)
cameraFolder.add(camera, 'focus', 0, 10)
cameraFolder.add(camera, 'fov', 20, 200)
cameraFolder.open()
console.log(camera)


function animate() {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    // cube.rotation.y += 0.01
    controls.update()
    render()
    stats.update()
}

function render() {
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
    
}
animate()