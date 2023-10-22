import * as THREE from 'three';
import {ColorRepresentation, LineBasicMaterial, Texture} from "three";
const MeshLine = require('three.meshline').MeshLine;
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;

export class Hilbert {
    private sideLength : number = 4;
    private numPoints : number = Math.pow(4, 7)
    seed: Array<THREE.Vector3> = [];
    points: Array<THREE.Vector3> = [];
    curve:THREE.Mesh = new THREE.Mesh();
    colors: Array<number> = [];
    material:LineBasicMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
    })
    texture: THREE.Texture = new Texture();

    constructor(seed: Array<THREE.Vector3>, depth:number) {
        this.generateCurve(seed, depth)
    }

    private generateCurve(seed: Array<THREE.Vector3>, depth:number):THREE.Mesh {
        this.seed = structuredClone(seed);
        this.points = structuredClone(seed);
        let depthFloor = Math.floor(depth)
        let depthFrac = depth - depthFloor
        // console.log(depthFloor, depthFrac)
        if (depthFrac > 0.0001) {
            let prev: Array<THREE.Vector3> = structuredClone(this.seed);
            let next: Array<THREE.Vector3> = structuredClone(this.seed);
            for(let i=0; i<depth-1; i++) {
                prev = this.getNextStep(prev)
            }
            for(let i=0; i<depth; i++) {
                next =
                    this.getNextStep(next)
            }
            prev = this.interpolatePoints(prev)
            next = this.interpolatePoints(next)
            this.points = this.hilbertTrans(prev, next, depthFrac)
        }
        else {
            for(let i=0; i<depthFloor; i++) {
                this.points =
                    this.getNextStep(structuredClone(this.points))
            }
            this.points = this.interpolatePoints(this.points);
        }
        this.colors = this.getColors();
        // ThreeJS Line
        // return this.makeCurve(this.points)

        // LineMesh Line
        return this.makeLine(this.points)
    }

    private getNextStep(inp:Array<THREE.Vector3>):Array<THREE.Vector3> {
        let n = this.sideLength;
        let zAxis = new THREE.Vector3(0,0,-1);
        inp = inp.map(obj=>new THREE.Vector3(obj.x/2, obj.y/2, obj.z/2))

        let bottomLeft:Array<THREE.Vector3> = structuredClone(inp.map(x => {
            x.applyAxisAngle(
                zAxis,
                Math.PI/2
            );
            x.add(new THREE.Vector3(-n/2, -n/2, 0))
            return x
        })).reverse()
        inp.map(x => x.add(new THREE.Vector3(n, n/2, 0)))
        inp.map(x => x.applyAxisAngle(
            zAxis,
            -Math.PI/2
        ))
        let topLeft:Array<THREE.Vector3> = structuredClone(inp.map(x => x.add(new THREE.Vector3(-n/2, 0, 0))))
        let topRight:Array<THREE.Vector3> = structuredClone(inp.map(x => x.add(new THREE.Vector3(n, 0, 0))))

        let bottomRight:Array<THREE.Vector3> = structuredClone(inp.map(x => {
            x.add(new THREE.Vector3(-n/2, -n/2, 0))
            x.applyAxisAngle(
                zAxis,
                -Math.PI/2
            );
            x.add(new THREE.Vector3(n/2, -n/2, 0))
            return x
        })).reverse()

        return [
            ...bottomLeft,
            ...topLeft,
            ...topRight,
            ...bottomRight
        ];
    }

    private interpolatePoints(inp:Array<THREE.Vector3>) {
        let seedVertices = inp.length
        let scalingFactor = this.numPoints/seedVertices
        // console.log(inp.length, scalingFactor)
        let interpolated:Array<THREE.Vector3> = []
        for(let i = 0; i < seedVertices; i++) {
            for (let j = 0; j < scalingFactor; j++) {
                let next = inp[Math.min(i + 1, seedVertices - 1)]
                let curr = inp[i]
                interpolated.push(
                    new THREE.Vector3(
                        curr.x + j * (next.x - curr.x) / scalingFactor,
                        curr.y + j * (next.y - curr.y) / scalingFactor,
                        curr.z + j * (next.z - curr.z) / scalingFactor,
                    )
                )
            }
        }
        return interpolated;
    }

    // private makeCurve(inp:Array<THREE.Vector3>):THREE.Line {
    //     let geometry = new THREE.BufferGeometry().setFromPoints(inp);
    //     this.curve = new THREE.Line(geometry, this.material);
    //     this.curve.geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
    //     return this.curve;
    // }

    public makeLine(inp:Array<THREE.Vector3>):THREE.Mesh {
        let geometry = new THREE.BufferGeometry().setFromPoints(inp);
        const line = new MeshLine();

        // @ts-ignore
        line.setGeometry(geometry, function(p) { return 0.08*Math.sin(p*2*Math.PI)});
        let glassRainbowText = this.texture
        let color = new THREE.Color(0xee5511);
        const lineMaterial = new MeshLineMaterial({
            map: glassRainbowText,
            useMap: true,
            // color: color,
            opacity: 1,//params.strokes ? .5 : 1,
            dashArray: 0.05,
            dashOffset: 0,
            dashRatio: 0.7,
            // resolution: resolution,
            sizeAttenuation: false,
            lineWidth: 0.1,
            // depthWrite: false,
            // depthTest: !false, //useMap
            // alphaTest: false ? .5 : 0, //useMap
            transparent: true,
            side: THREE.DoubleSide
        });
        this.curve = new THREE.Mesh(line, lineMaterial);
        return this.curve;
    }

    private getColors() {
        let curveCol:Array<number> = [];
        for(let i=0; i<10*this.points.length; i++) {
            const color:ColorRepresentation = new THREE.Color();
            color.setHSL( i / ( this.points.length ) * 0.3 + 0.5, 1.0, 0.5, THREE.SRGBColorSpace );
            curveCol.push( color.r, color.g, color.b );
        }
        return curveCol
    }

    public update(seed: Array<THREE.Vector3>, depth:number) {

        return this.generateCurve(seed, depth)
    }

    private hilbertTrans(from:Array<THREE.Vector3>, to:Array<THREE.Vector3>, howMuch:number):Array<THREE.Vector3>{
        let ret:Array<THREE.Vector3> = []
        for(let i = 0; i < from.length; i++) {
            ret.push(new THREE.Vector3(
                from[i].x + (to[i].x - from[i].x)*howMuch,
                from[i].y + (to[i].y - from[i].y)*howMuch,
                from[i].z + (to[i].z - from[i].z)*howMuch,
            ))
        }
        return ret;
    }

}


