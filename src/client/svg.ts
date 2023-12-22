import {SVGLoader, SVGResult} from "three/examples/jsm/loaders/SVGLoader";
import * as THREE from "three";
import {Line} from "./line";
import {coefficient, Spiro} from "./spiro";
import {complex} from 'ts-complex-numbers';

const fourierResolution = 13;

const svgLoader:SVGLoader = new SVGLoader();
export function loadSvg( path:string){
    return new Promise(function(resolve){
        svgLoader.load( path, resolve);
    });
}

export function processSVGData(data:SVGResult):Array<coefficient>|undefined {
    const paths = data.paths;
    const group = new THREE.Group();

    for ( let pathNum = 0; pathNum < paths.length; pathNum ++ ) {
        const path = paths[pathNum];
        const curveDivisions = 20;
        const scale = -1/6;
        let allPoints = []
        for(let j=0; j<path.subPaths[0].curves.length; j++) {
            const curve:THREE.Curve<THREE.Vector2> = path.subPaths[0].curves[j]
            const pointsArr:THREE.Vector2[] = curve.getPoints(curveDivisions - 1).map(vec => new THREE.Vector2(vec.x*scale, vec.y*scale));
            let geometry = new THREE.BufferGeometry().setFromPoints(pointsArr);
            // scene.add(svgLine.curve)
            allPoints.push(...pointsArr)
        }

        allPoints = allPoints.map(point => new THREE.Vector3(point.x, point.y, 0))
        const svgLine = new Line(allPoints, undefined, new THREE.Color(0xff0000));
        const com = getCenterOfMass(allPoints);
        svgLine.curve.position.set(-com.x, -com.y, -com.z)

        ///////
        let svgCoeffs = getCoeffs(allPoints,fourierResolution)
        svgCoeffs.sort((x, y) => -Math.abs(x.an.mag()) + Math.abs(y.an.mag()))

        return svgCoeffs;

        //To display SVG image
        // const material = new THREE.MeshBasicMaterial( {
        // 	color: path.color,
        // 	side: THREE.DoubleSide,
        // 	depthWrite: false
        // } );
        // const shapes = SVGLoader.createShapes( path );
        // for ( let j = 0; j < shapes.length; j ++ ) {
        // 	const shape = shapes[ j ];
        // 	const geometry = new THREE.ShapeGeometry( shape );
        // 	const mesh = new THREE.Mesh( geometry, material );
        // 	group.add( mesh );
        // }
    }
    // scene.add( group );
}

function getIthCoeff(f: Array<complex>, n: number):complex {
    let sum = new complex(0,0);
    for(let i=0; i<f.length-1; i++) {
        //e^(i*-n*theta)
        const curr = f[i];
        const I = new complex(0, 1);
        const theta = 2*Math.PI*(i/f.length)
        const exp = I.scalarMult(-n*theta).exp();
        sum = sum.add(curr.mult(exp).scalarMult(2*Math.PI*(1/f.length)))
    }
    let ret = sum.scalarMult(1/(2*Math.PI))
    if (ret.mag() < 0.01) { return new complex(0,0) } return ret;
}

function complexStr(z:complex) {
    return z.real.toPrecision(4) + " " + z.img.toPrecision(4) + "i"
}

export function getCenterOfMass(points:Array<THREE.Vector3>) : THREE.Vector3 {
    return points
        .reduce(
            (accumulator, currentValue) => accumulator.add(currentValue), new THREE.Vector3(0,0,0))
        .multiplyScalar(1/points.length);
}

export function getCoeffs(points:Array<THREE.Vector3>, n:number):Array<coefficient> {
    let ret = []
    for(let i=1; i<=n; i++) {
        ret.push({n:i, an: getIthCoeff(points.map(vec3 => new complex(vec3.x, vec3.y)), i)})
        ret.push({n:-i, an: getIthCoeff(points.map(vec3 => new complex(vec3.x, vec3.y)), -i)})
    }
    return ret as Array<coefficient>;
}
