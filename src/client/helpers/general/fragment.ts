
import * as THREE from 'three';

export function getColor(uv:THREE.Vector2, time:number):THREE.Vector3{
    let col = new THREE.Vector3(0,0,0)
    // if(time > 1 && time < 1.02) console.log(uv.x)
    uv.add(new THREE.Vector2(-0.5, -0.5))
    for(let i=0; i<1; i++) {
        uv.multiplyScalar(i+1)
        let r = uv.length();
        r = Math.sin(40*r - 3*time)
        col.add(new THREE.Vector3(r,0,0));


        let k = 2
        uv.x = uv.x%(1/k)
        uv.y = uv.y%(1/k)
        let r2 = 0
        r2 = uv.add(new THREE.Vector2(0.5*Math.sin(time),0.5*Math.cos(time))).length()
        col.add(new THREE.Vector3(Math.sin(r2*16-time), Math.sin(r2*16-time), 0.7))
    }

    // let col = new THREE.Vector3(0,0,0)
    // uv.add(new THREE.Vector2(-0.5, -0.5)).multiplyScalar(2)

    return col.multiplyScalar(4);
}