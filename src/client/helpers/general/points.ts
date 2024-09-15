import * as THREE from "three";
import {rearrangeArr} from './transformations'

export type pointCloud = {
    colors: number[],
    posArray: number[]
}
//Get a cubical lattice.
//Density through n
// scale through scale
// translate through origin
// rotation not currently supported
export function getCube(n:number,
                        origin:THREE.Vector3=new THREE.Vector3(0,0,0),
                        scale:THREE.Vector3=new THREE.Vector3(1,1,1),
):pointCloud {
    let colors = []
    let color = new THREE.Color();
    let posArray:number[] = [];
    for(let i=0; i < n; i++) {
        for(let j=0; j<n; j++) {
            for(let k=0; k<n; k++) {
                const indexOffset = new THREE.Vector3(
                    0,0,0
                    // 0.01*i*j*k,
                    // 0.01*i*j*k,
                    // 0.01*i*j*k
                )
                let ind = 3*(n*n*i + n*j + k);
                posArray.push(indexOffset.x + scale.x * (i - (n-1)/2) + origin.x);
                posArray.push(indexOffset.y + scale.y * (j - (n-1)/2) + origin.y);
                posArray.push(indexOffset.z + scale.z * (k - (n-1)/2) + origin.z);

                // color.setRGB(i/n,j/n,k/n,THREE.SRGBColorSpace)
                color.setRGB(1,0,0,THREE.SRGBColorSpace)
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
                                  origin: THREE.Vector3= new THREE.Vector3(0,0,0)):pointCloud {
    const geoPosArr = geometry.getAttribute('position').array;
    let posArray:number[]=[];
    let colors=[]
    let color=new THREE.Color();
    for(let i=0; i<geoPosArr.length; i+=3) {
        posArray.push(geoPosArr[i+0] + origin.x)
        posArray.push(geoPosArr[i+1] + origin.y)
        posArray.push(geoPosArr[i+2] + origin.z)

        color.setRGB(0,i/geoPosArr.length,0,THREE.SRGBColorSpace)
        colors.push(color.r, color.g, color.b)
    }
    return {colors:colors, posArray:posArray};
}


export function getBallPoints(
    shellNum:number,
    shellDiff:number,
    origin:THREE.Vector3= new THREE.Vector3(0,0,0)
):pointCloud {
    let widthSeg = 20, lengthSeg = 20, posArray2 = [], colors = [], color = new THREE.Color();
    for(let i=0; i<shellNum; i++) {
        const sphereGeometry = new THREE.SphereGeometry(shellDiff*(i+1), widthSeg-1, lengthSeg-1)
        const geoArr = sphereGeometry.getAttribute('position').array; //length of arr = 3*widthSeg*lengthSeg
        for(let j=0; j<geoArr.length; j+=3) {
            posArray2.push(geoArr[j] + origin.x)
            posArray2.push(geoArr[j+1] + origin.y)
            posArray2.push(geoArr[j+2] + origin.z)

            let colorCode = i/shellNum;
            color.setRGB(0,0,1);
            colors.push(color.r, color.g, color.b)
        }
    }
    return {posArray: posArray2, colors:colors};
}

export function getRingPoints(n:number, radius:number, origin:THREE.Vector3= new THREE.Vector3(0,0,0)):pointCloud {
    let posArray=[], colors = [];
    for(let i=0; i<3*n; i+=3) {
        posArray.push(radius * Math.sin(Math.PI * 2 * i / (3*n)) + origin.x)
        posArray.push(radius * Math.cos(Math.PI * 2 * i / (3*n)) + origin.y)
        posArray.push(origin.z)

        let color = new THREE.Color();
        color.setRGB(1, i/(3*n), i/(3*n), THREE.SRGBColorSpace)
        colors.push(color.r, color.g, color.b)
    }
    return {posArray:posArray, colors:colors};
}

export function getPointMeshArr(posArray:number[], pixelSize:number=0.7):THREE.Points {
    const latticeGeo = new THREE.BufferGeometry;
    // posArray = rearrangeArr(posArray)
    latticeGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3))
    const latticeMesh = new THREE.Points(latticeGeo, new THREE.PointsMaterial({
        size: pixelSize,
        color: 0xffffff,
        vertexColors: true
    }))
    return latticeMesh;
}


