import * as THREE from 'three';
import {ColorRepresentation, LineBasicMaterial, Texture} from "three";
const MeshLine = require('three.meshline').MeshLine;
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;
import {Line} from "./line";
import {complex} from 'ts-complex-numbers';


export type coefficients = Array<{
    n: number,
    an: complex
}>
export class Spiro {
    line: Line = new Line();
    coeffs:coefficients = []
    wheels: Array<THREE.Mesh> = []
    radii: Array<Line> = []

    constructor(coeffs: coefficients, thetaStart:number = 0, thetaEnd:number = 2*Math.PI) {
        this.coeffs = coeffs
        let points = this.getSpiroPoints(coeffs, thetaStart, thetaEnd);
        this.line = new Line(points)
        this.wheels = this.makeSpiroWheels(coeffs)
        for(let i=0; i<coeffs.length; i++) {
            this.radii.push(new Line())
        }
    }

    public getSpiroPoints(coefficients:coefficients, thetaStart:number=0, thetaEnd:number=2*Math.PI):Array<THREE.Vector3>{
        let spiroPoints = []
        let thetaResolution = 500;
    
        for(let i=0; i<thetaResolution; i++) {
            let r = new complex(0,0)
            const I = new complex(0,1)
            const theta = thetaStart + i * (thetaEnd - thetaStart) / thetaResolution
            for(let j=0; j<coefficients.length; j++) {
                const z = coefficients[j].an
                r = r.add(z.mult(I.scalarMult(coefficients[j].n*theta).exp()))
                // wheels[j+1].position.z = r.mag()*Math.sin(theta)
            }
    
            // spiroPoints.push(new THREE.Vector3(r.real, r.img, r.mag()*Math.sin(theta)))
            spiroPoints.push(new THREE.Vector3(r.real, r.img, 0))
        }
        return spiroPoints;
    }

    public makeSpiroWheels(coefficients:coefficients):Array<THREE.Mesh> {
            let wheels:Array<THREE.Mesh> = [];
            wheels.push(new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshPhysicalMaterial()))
            
            for(let i=0; i<coefficients.length; i++) {
                const currWheel = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshPhysicalMaterial())
                wheels[i].add(currWheel)
                
                const ring = new THREE.Mesh(
                    new THREE.RingGeometry(coefficients[i].an.mag(), coefficients[i].an.mag()+0.05, 100),
                    new THREE.MeshBasicMaterial({color: 0x919191, side:THREE.DoubleSide})
                )
                wheels[i].add(ring)
        
                wheels.push(currWheel)
            }
            return wheels;
        }

    public moveRadii(time:number, makeTrail:boolean=false) {
        const k = 1/4
        // console.log(time)
        for(let i=0; i<this.coeffs.length; i++) {
            const omega = this.coeffs[i].n
            const theta = time*k*omega + this.coeffs[i].an.arg()
            this.wheels[i+1].position.set(
                this.coeffs[i].an.mag()*Math.cos(theta), 
                this.coeffs[i].an.mag()*Math.sin(theta), 
                0
                )
    
            //make line from world coordinates of
            // this.wheels[i] to this.wheels[i+1]
            const currBall:THREE.Vector3 = new THREE.Vector3();
            const nextBall:THREE.Vector3 = new THREE.Vector3();
            this.wheels[i].getWorldPosition(currBall)
            this.wheels[i+1].getWorldPosition(nextBall)
            
            this.radii[i].points = [currBall, nextBall]
            this.wheels[0].remove(this.radii[i].curve)
            this.wheels[0].add(this.radii[i].update())
        }
    
        if (makeTrail && this.line!=undefined) {
            //@ts-ignore
            this.line.curve.material.dashOffset = time/10
            this.line.points = this.getSpiroPoints(this.coeffs, Math.max(0, time*k - 2*Math.PI), time*k)
            // spiroLine.points = getSpiroPoints(spiroCoeff, 0, 2*Math.PI)
            // spiroLine.options.lineWidth = time/1%1
            this.wheels[0].remove(this.line.curve)
            this.wheels[0].add(this.line.update())
        }
    }
}


