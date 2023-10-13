import * as THREE from "three";
import {loadObj} from "./setup";

//Get a cubical lattice.
//Density through n
// scale through scale
// translate through origin
// rotation not currently supported
export function getCube(n:number,
                        origin:THREE.Vector3=new THREE.Vector3(0,0,0),
                        scale:THREE.Vector3=new THREE.Vector3(1,1,1),
                 ) {
    let colors = []
    let color = new THREE.Color();
    let posArray:Float32Array = new Float32Array(3*n*n*n);
    for(let i=0; i < n; i++) {
        for(let j=0; j<n; j++) {
            for(let k=0; k<n; k++) {
                const indexOffset = new THREE.Vector3(
                    0,0,0
                    // 0.001*i*j*k,
                    // 0.001*i*j*k,
                    // 0.001*i*j*k
                )
                let ind = 3*(n*n*i + n*j + k);
                posArray[ind + 0] = indexOffset.x + scale.x * (i - (n-1)/2 + origin.x);
                posArray[ind + 1] = indexOffset.y + scale.y * (j - (n-1)/2 + origin.y);
                posArray[ind + 2] = indexOffset.z + scale.z * (k - (n-1)/2 + origin.z);

                color.setRGB(i/n,j/n,k/n,THREE.SRGBColorSpace)
                colors.push(color.r, color.g, color.b)
            }
        }
    }
    return {
        colors: colors,
        posArray: posArray
    }
}

export function getGeometryPoints(geometry: THREE.BufferGeometry,
                                  origin: THREE.Vector3= new THREE.Vector3(0,0,0)) {
    const geoPosArr = geometry.getAttribute('position').array;
    let posArray:Float32Array = new Float32Array(geoPosArr.length);
    for(let i=0; i<geoPosArr.length; i+=3) {
        posArray[i+0] = geoPosArr[i+0] + origin.x
        posArray[i+1] = geoPosArr[i+1] + origin.y
        posArray[i+2] = geoPosArr[i+2] + origin.z
    }
    return posArray;
}

export function getBallPoints(
    shellNum:number,
    shellDiff:number
) {
    let widthSeg = 10
    let lengthSeg = 10
    let posArray2 = new Float32Array(3*(widthSeg+1)*(lengthSeg+1)*(shellNum));
    let lastInd=0
    for(let i=0; i<shellNum; i++) {
        const sphereGeometry = new THREE.SphereGeometry(
            shellDiff*(i+1),
            widthSeg,
            lengthSeg)
        const geoArr = sphereGeometry.getAttribute('position').array;
        console.log(11*11*3*i, lastInd)
        for(let j=0; j<geoArr.length; j++) {
            posArray2[lastInd + j] = geoArr[j]
        }
        lastInd += geoArr.length
    }
    return posArray2;
}

export function getRingPoints(n:number, radius:number) {
    let posArray:Float32Array = new Float32Array(n);
    for(let i=0; i<n; i+=3) {
        posArray[i] = radius * Math.sin(Math.PI * 2 * i / n);
        posArray[i + 1] = radius * Math.cos(Math.PI * 2 * i / n);
        posArray[i + 2] = 0;
    }
    return posArray;
}
