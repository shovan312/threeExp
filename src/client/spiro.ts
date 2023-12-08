import * as THREE from 'three';
import {Line} from "./line";
import {complex} from 'ts-complex-numbers';

export type coefficient = {
    n: number,
    an: complex
}

export class Spiro {
    line: Line = new Line();
    coeffs:Array<coefficient> = []
    wheels: Array<THREE.Mesh> = []
    radii: Array<Line> = []

    constructor(coeffs: Array<coefficient>, thetaStart:number = 0, thetaEnd:number = 2*Math.PI) {
        this.coeffs = coeffs
        let points = this.getSpiroPoints(coeffs, thetaStart, thetaEnd);
        this.line = new Line(points)
        this.wheels = this.makeSpiroWheels(coeffs)
    }

    public getSpiroPoints(coefficients:Array<coefficient>, thetaStart:number=0, thetaEnd:number=2*Math.PI, thetaResolution:number=200):Array<THREE.Vector3>{
        let spiroPoints = []
        for(let i=0; i<=thetaResolution; i++) {
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

    public makeSpiroWheels(coefficients:Array<coefficient>):Array<THREE.Mesh> {
        let wheels:Array<THREE.Mesh> = [];
        wheels.push(new THREE.Mesh(new THREE.SphereGeometry(0.2 ), new THREE.MeshPhysicalMaterial()))
        for(let i=0; i<coefficients.length; i++) {
            const currWheel = new THREE.Mesh(new THREE.SphereGeometry(0.2   ), new THREE.MeshPhysicalMaterial())
            wheels[i].add(currWheel)

            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(coefficients[i].an.mag(), 0.08*(1/(i+1)), 12, 100),
                // new THREE.RingGeometry(coefficients[i].an.mag(), coefficients[i].an.mag()+0.05, 100),
                new THREE.MeshBasicMaterial({color: 0x919191, side:THREE.DoubleSide, transparent: true})
            )
            wheels[i].add(ring)

            wheels.push(currWheel)

            const radius = new Line([], new THREE.Texture(), new THREE.Color(0xaaaaaa))
            this.radii.push(radius)
            wheels[i].add(radius.curve)
        }
        return wheels;
    }

    public moveRadii(time:number, makeTrail:boolean=false, speed:number=2, thetaLength:number=2*Math.PI, thetaResolution:number=200) {
        for(let i=0; i<this.coeffs.length; i++) {
            const omega = this.coeffs[i].n
            const theta = time*speed*omega + this.coeffs[i].an.arg()
            this.wheels[i+1].position.set(
                this.coeffs[i].an.mag()*Math.cos(theta),
                this.coeffs[i].an.mag()*Math.sin(theta),
                0
                )
            // this.radii[i].curve.rotation.z = theta
            //adds lag but works
            this.radii[i].points = [
                this.wheels[i].getWorldPosition(new THREE.Vector3()),
                this.wheels[i+1].getWorldPosition(new THREE.Vector3())
            ]
            const selectedObj = this.wheels[0].getObjectByName(this.radii[i].curve.name)
            if(selectedObj != undefined) {
                // console.log(selectedObj)
                this.wheels[0].remove(selectedObj)
                this.radii[i].curve.geometry.dispose()
                this.wheels[0].add(this.radii[i].update())
            }
        }

        if (makeTrail && this.line!=undefined) {
            //@ts-ignore
            this.line.curve.material.dashOffset = time/10
            this.line.points = this.getSpiroPoints(this.coeffs, Math.max(0, time*speed - thetaLength), time*speed, thetaResolution)
            // spiroLine.points = getSpiroPoints(spiroCoeff, 0, 2*Math.PI)
            // spiroLine.options.lineWidth = time/1%1
            this.wheels[0].remove(this.line.curve)
            this.line.curve.geometry.dispose()
            this.wheels[0].add(this.line.update())
        }
    }

    public update() {
        for(let i=0; i<this.wheels.length; i++) {
            this.wheels[i].geometry.dispose();
            for(let j=1; j<this.wheels[i].children.length; j++) {
                const sss:THREE.Mesh = this.wheels[i].children[j] as THREE.Mesh
                sss.geometry.dispose()
            }
        }
        this.wheels = this.makeSpiroWheels(this.coeffs)
        return this.wheels[0];
    }
}


