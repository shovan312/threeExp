import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export const I = 'i'
export const J = 'j'
export const K = 'k'
export const L = 'l'
export const SHIFT = 'shift'
export const LIGHTS = [I, J, K, L, SHIFT]

export class LightControls{
    lightsMap: {}

    constructor(lightsMap: {}) {
        this.lightsMap = lightsMap

    }


    public updateLights(keysPressed:{}, time:number) {
        const lightPressed = LIGHTS.some(key => (keysPressed as any)[key] == true)
        // if (!lightPressed) return
        for (let lightsMapKey in this.lightsMap) {
            if((keysPressed as any)[lightsMapKey] == true) {
                ((this.lightsMap as any)[lightsMapKey] as THREE.Light).intensity = 100
            }
            else {
                ((this.lightsMap as any)[lightsMapKey] as THREE.Light).intensity = 0
            }
        }
        if((keysPressed as any)[SHIFT] == true) {
            for (let lightsMapKey in this.lightsMap) {
                ((this.lightsMap as any)[lightsMapKey] as THREE.Light).position.y -= Math.sin(time)/10;
                // ((this.lightsMap as any)[lightsMapKey] as THREE.Light).lookAt(new THREE.Vector3(0,0,0))
            }
        }
    }




}
