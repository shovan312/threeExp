import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export const W = 'w'
export const A = 'a'
export const S = 's'
export const D = 'd'
export const UP = 'arrowup'
export const DOWN = 'arrowdown'
export const LEFT = 'arrowleft'
export const RIGHT = 'arrowright'
export const SHIFT = 'shift'
export const DIRECTIONS = [W, A, S, D]
export const ROTATIONS = [UP, DOWN, LEFT, RIGHT]

export class CameraControls {
    orbitControl: OrbitControls
    camera: THREE.Camera
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()

    constructor(orbitControl:OrbitControls, camera:THREE.Camera) {
        this.orbitControl=orbitControl;
        this.camera=camera;
    }


    public updateCamera(camera:THREE.Camera, orbitControls:OrbitControls, keysPressed:{}, delta:number) {
        const directionPressed = DIRECTIONS.some(key => (keysPressed as any)[key] == true)
        const rotationPressed = ROTATIONS.some(key => (keysPressed as any)[key] == true)
        if (!directionPressed && !rotationPressed) return
        var angleYCameraDirection = Math.atan2(
            (this.camera.position.x - 0),
            (this.camera.position.z - 0))
        var directionOffset = this.directionOffset(keysPressed)
        var rotationOffset = this.rotationOffset(keysPressed)
        this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)

        this.camera.getWorldDirection(this.walkDirection)
        this.walkDirection.y = 0
        this.walkDirection.normalize()
        this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
        // console.log(directionOffset)

        const velocity = 4

        // move model & camera
        const moveX = this.walkDirection.x * velocity * delta
        const moveZ = this.walkDirection.z * velocity * delta

        if (directionPressed) this.updateCameraTarget(moveX, moveZ)
        if (rotationPressed) this.updateCameraRotation(rotationOffset)
    }

    private updateCameraTarget(moveX: number, moveZ: number) {
        // move camera
        this.camera.position.x += moveX
        this.camera.position.z += moveZ
        // console.log(this.camera.position.x, this.camera.position.z)

        // update camera target
        this.cameraTarget.x = 0
        this.cameraTarget.y = 0
        this.cameraTarget.z = 0
        this.orbitControl.target = this.cameraTarget
        this.camera.lookAt(0,0,0)
    }

    private updateCameraRotation(rotationOffset:THREE.Vector3) {
        this.camera.rotation.set(this.camera.rotation.x + rotationOffset.x,this.camera.rotation.y + rotationOffset.y,0)
    }

    private directionOffset(keysPressed: any) {
        var directionOffset = 0 // w

        if (keysPressed[W]) {
            if (keysPressed[A]) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keysPressed[D]) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keysPressed[D]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keysPressed[A]) {
            directionOffset = Math.PI / 2 // a
        } else if (keysPressed[D]) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }

    private rotationOffset(keysPressed: any) {
        var rotationOffset = new THREE.Vector3(0,0,0);

        if(keysPressed[UP]) {
            rotationOffset.add(new THREE.Vector3(-Math.PI/500,0,0))
        }
        if(keysPressed[DOWN]) {
            rotationOffset.add(new THREE.Vector3(+Math.PI/500,0,0))
        }
        if(keysPressed[LEFT]) {
            rotationOffset.add(new THREE.Vector3(0, Math.PI/500,0))
        }
        if(keysPressed[RIGHT]) {
            rotationOffset.add(new THREE.Vector3(0, -Math.PI/500,0))
        }
//         console.log(keysPressed)
        return rotationOffset;
    }
}
