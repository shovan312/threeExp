import * as THREE from "three";


export function wave(arr:number[], A:number, k:number, w:number, time:number):number[] {
    let ret = [];
    for(let i=0; i<arr.length; i+=3) {
        const ind = Math.floor(i/3)
        let x = arr[3*ind + 0]
        let y = arr[3*ind + 1]
        let z = arr[3*ind + 2]
        let posVec = new THREE.Vector3(x,y,z)
        posVec = displace(posVec, A, k, w, time)

        ret.push(posVec.x)
        ret.push(posVec.y)
        ret.push(posVec.z)
    }
    return ret;
}

function displace(vec:THREE.Vector3, A:number, k:number, w:number, time:number):THREE.Vector3 {
    //Plane waves along axes
    vec.x +=  A*Math.sin(k*vec.x + w*time)
//     vec.y +=  A*Math.sin(k*vec.y + w*time)
//     vec.z +=  A*Math.sin(k*vec.z + w*time)

    //Sin waves along axes
//     vec.x += A*Math.sin(k*vec.y + w*time/5)
    vec.y += A*Math.cos(k*vec.z + w*time/5)
    // vec.z += A*Math.sin(k*vec.x + w*time/5)

    //Composite waves
//     vec.x += 0.1*vec.x*A*Math.sin(k*vec.z + k*vec.y + w*time)

    //3D Radial waves
//     let r = vec.length()
//     let disp = 0.1*Math.sin(r - 5*time);
//     vec.multiplyScalar(1 + disp)

    //2D Radial waves
    // let r = Math.sqrt(vec.x*vec.x + vec.y*vec.y)
    // let disp = 0.1*Math.sin(r - 5*time)
    // vec.multiplyScalar(1 + disp)


    return vec;
}

export function burn(arr:number[], time:number):number[] {
    const len = arr.length/3
    const ret:number[] = []
    const winLen = Math.floor(len/2)
    const winStart = time*70000 % (len)
    const winEnd =( winLen + winStart) % (len)
    for(let i=0; i<arr.length; i+=3) {
        const ind = Math.floor(i/3)
        let isValid = false;
        if (winEnd > winStart) {
            isValid = ind > winStart && ind < winEnd
        }
        else {
            isValid = (ind > 0 && ind < winEnd) || (ind > winStart && ind < len)
        }
        if ( isValid) {
            ret.push(arr[i + 0]);
            ret.push(arr[i + 1]);
            ret.push(arr[i + 2]);
        }
    }
    return ret;
}


export function morph(from:number[], to:number[], time:number): number[] {
    const maxLength = Math.max(from.length, to.length);
    // const t = THREE.MathUtils.clamp(Math.sin(time), 0, 1);
    const t = time - Math.floor(time);
    const ret = [];

    for(let i=0; i<maxLength; i+=3) {
        ret.push(from[i%from.length] + t*(to[i%to.length] - from[i%from.length]));
        ret.push(from[i%from.length+1] + t*(to[i%to.length+1] - from[i%from.length+1]));
        ret.push(from[i%from.length+2] + t*(to[i%to.length+2] - from[i%from.length+2]));
    }
    return ret;
}

export function rearrangeArr(inp:number[], fn: (a: THREE.Vector3, b: THREE.Vector3) => number ):number[] {
    let inp2Vec:Array<THREE.Vector3> = [];
    for(let i=0; i<inp.length; i+=3) {
        inp2Vec.push(new THREE.Vector3(
            inp[i], inp[i+1], inp[i+2]
        ));
    }
    inp2Vec.sort(fn)
    let out:number[] = []
    for(let i=0; i<inp2Vec.length; i++) {
        out.push(inp2Vec[i].x);
        out.push(inp2Vec[i].y);
        out.push(inp2Vec[i].z);
    }

    return out;
}

export function byX(a:THREE.Vector3, b:THREE.Vector3):number {
    if(a.x < b.x) return -1;
    else if(a.x > b.x) return 1;
    return 0;
}

export function byY(a:THREE.Vector3, b:THREE.Vector3):number {
    if(a.y < b.y) return -1;
    else if(a.y > b.y) return 1;
    return 0;
}

export function byZ(a:THREE.Vector3, b:THREE.Vector3):number {
    if(a.z < b.z) return -1;
    else if(a.z > b.z) return 1;
    return 0;
}

export function byR(a:THREE.Vector3, b:THREE.Vector3):number {
    let r1:number = a.length()
    let r2:number = b.length()
    let delta:number = r2-r1
    if(delta > 0.0001) return -1;
    else if(delta < -0.0001) return 1;

    let theta1:number = Math.atan2(a.y,a.x)
    let theta2:number = Math.atan2(b.y,b.x)
    // let theta1:number = a.projectOnPlane(new THREE.Vector3(0,0,1)).angleTo(new THREE.Vector3(1,0,0))
    // let theta2:number = b.projectOnPlane(new THREE.Vector3(0,0,1)).angleTo(new THREE.Vector3(1,0,0))
    if(theta1 < theta2) return -1;
    else if(theta1 > theta2) return 1;

    let phi1:number = a.angleTo(new THREE.Vector3(0,0,1))
    let phi2:number = b.angleTo(new THREE.Vector3(0,0,1))
    if(phi1 < phi2) return -1;
    else if(phi1 > phi2) return 1;

    return 0;
}

export function byRandom(a:THREE.Vector3, b:THREE.Vector3):number {
    if (Math.random() - 0.5 < 0) return -1; else return 1;
}
