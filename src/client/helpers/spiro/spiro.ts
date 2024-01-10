import * as THREE from 'three';
import {Line} from "../general/line";
import {complex} from 'ts-complex-numbers';
import {texture} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {Texture} from "three";

export type coefficient = {
    n: number,
    an: complex
}

export class Spiro {
    line: Line = new Line();
    coeffs:Array<coefficient> = []
    wheels: Array<THREE.Mesh> = []
    radii: Array<Line> = []
    rings: Array<THREE.Mesh> = []
    texture:Texture

    constructor(coeffs: Array<coefficient>, thetaStart:number = 0, thetaEnd:number = 2*Math.PI, texture:Texture=new Texture()) {
        this.coeffs = coeffs
        let points = this.getSpiroPoints(coeffs, thetaStart, thetaEnd);
        this.line = new Line(points, texture, new THREE.Color(0x0000ff), 0.03, false)
        this.makeSpiroWheels(coeffs)
        this.texture = texture
    }

    public getSpiroPoints(coefficients:Array<coefficient>, thetaStart:number=0, thetaEnd:number=2*Math.PI, thetaResolution:number=200,i:number=0):Array<THREE.Vector3>{
        let spiroPoints = []
        for(let i=0; i<=thetaResolution; i++) {
            let r = new complex(0,0)
            const I = new complex(0,1)
            const theta = thetaStart + i * (thetaEnd - thetaStart) / thetaResolution
            for(let j=0; j<coefficients.length; j++) {
                const z = coefficients[j].an
                r = r.add(z.mult(I.scalarMult(coefficients[j].n*theta).exp()))
            }
            // spiroPoints.push(new THREE.Vector3(r.real, r.img, r.mag()*Math.sin(theta)*Math.sin(theta)))
            spiroPoints.push(new THREE.Vector3(r.real, r.img, 0))
        }
        return spiroPoints;
    }

    public makeSpiroWheels(coefficients:Array<coefficient>) {
        let wheels:Array<THREE.Mesh> = [], radii:Array<Line> = [], rings:Array<THREE.Mesh> = [];
        wheels.push(new THREE.Mesh(new THREE.SphereGeometry(0.06 ), new THREE.MeshPhysicalMaterial()))
        for(let i=0; i<coefficients.length; i++) {
            const cursor = new THREE.Mesh(new THREE.SphereGeometry(0.06   ), new THREE.MeshPhysicalMaterial())
            wheels.push(cursor)
            wheels[i].add(cursor)

            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(coefficients[i].an.mag(), 0.08*(1/(i+1)), 12, 100),
                // new THREE.RingGeometry(coefficients[i].an.mag(), coefficients[i].an.mag()+0.05, 100),
                new THREE.MeshBasicMaterial({color: 0x919191, side:THREE.DoubleSide, transparent: true})
            )
            rings.push(ring)
            wheels[i].add(ring)

            const radius = new Line([new THREE.Vector3(0,0,0), new THREE.Vector3(coefficients[i].an.mag(),0,0)], new THREE.Texture(), new THREE.Color(0xaaaaaa), 0.05)
            radii.push(radius)
            wheels[i].add(radius.curve)
        }
        this.wheels = wheels;
        this.radii = radii;
        this.rings = rings;
    }

    public moveRadii(time:number, speed:number=2) {
        for(let i=0; i<this.coeffs.length; i++) {
            const omega = this.coeffs[i].n
            const theta = time*speed*omega + this.coeffs[i].an.arg()
            this.wheels[i+1].position.set(
                this.coeffs[i].an.mag()*Math.cos(theta),
                this.coeffs[i].an.mag()*Math.sin(theta),
                0
                )

            this.rings[i].geometry.dispose();
            this.rings[i].geometry = new THREE.TorusGeometry(this.coeffs[i].an.mag(), 0.08*(1/(i+1)), 12, 100)

            this.radii[i].curve.geometry.dispose()
            const nextRadius = new Line([new THREE.Vector3(0,0,0), new THREE.Vector3(this.coeffs[i].an.mag(),0,0)], new Texture(), new THREE.Color(0x000000), 0.05)
            this.radii[i].curve.geometry = nextRadius.curve.geometry;
            this.radii[i].curve.rotation.z = theta
        }
    }

    public drawTrail(time:number, makeTrail:boolean=false, speed:number=2, thetaLength:number=2*Math.PI, thetaResolution:number=800,i:number=0) {
        if (makeTrail && this.line!=undefined) {
            this.line.points = this.getSpiroPoints(this.coeffs, Math.max(0, time*speed - thetaLength), time*speed, thetaResolution,i)
        }
        else {
            this.line.points = this.getSpiroPoints(this.coeffs, 0, 2*Math.PI, thetaResolution,i)
        }
        this.wheels[0].remove(this.line.curve)
        this.line.curve.geometry.dispose()
        this.wheels[0].add(this.line.update())
    }

    public update() {
        this.makeSpiroWheels(this.coeffs)
    }
}


