export default /*glsl*/`

uniform float uTime;
uniform vec2 uMouse;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

vec3 palette(float t) {
    return .5+.5*cos(6.28318*(t+vec3(.3,.516,.557)));
}

mat2 rot2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c,-s,s,c);
}

vec3 rot3D(vec3 p, vec3 axis, float angle) {
    return mix(
        dot(axis,p) * axis, p, cos(angle)) + 
        cross(axis, p) * sin(angle);
}

float smin(float a, float b, float k) {
    float h = max( k - abs(a-b), 0.0)/k;
    return min(a, b) - h*h*h*k*(1.0/6.0);
}

float sdZAxis(vec3 p) {
    if (length(p.xy) < .1) return 0.; else  return .1;
}

//point, radius
float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

//point, size vector
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdBoxFrame( vec3 p, vec3 b, float e )
{
    p = abs(p)-b;
    vec3 q = abs(p+e)-e;
    return min(min(
        length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
        length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
        length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

float map(vec3 p, float uTime) {
    p = mod(p, 1.) - 0.5;
    vec3 boxSize = vec3(.5 * abs(sin(1.57 + max(0., (uTime-25.)*.4))));
    if ((uTime - 25.)*.4 > 3.14*3.) boxSize = vec3(.5);
    float boxFrame = sdBoxFrame(p, boxSize, boxSize.x / 20.);
    float box = sdBox(p, boxSize/5. * abs(sin(max(0., uTime - 4.5))) * 1.2);

    return min(boxFrame, box);
}



void main() {
    vec2 uv = (vUv - .5)*2.;
    vec2 m; float mTime = 0.;
    if (uTime > mTime) m = (uMouse - .5)*2.;
    else m = vec2(0.4*sin(1.57 + 0.2*uTime), 0.4*cos(1.57 + 0.2*uTime));

    //origin and direction
    vec3 ro = vec3(0.2,0.2,-3);
    vec3 rd = normalize(vec3(uv, 1));

    // if (uv.x > 0.5) rd *= -1.;
    //if (uv.y > sin(uTime*0.2) - 2./3. && uv.y < 0.) rd *= -1.;

    //rotation
    ro.yz *= rot2D(-m.y*2.);
    rd.yz *= rot2D(-m.y*2.);

    ro.xz *= rot2D(-m.x*2.);
    rd.xz *= rot2D(-m.x*2.);



    float t=0.;
    int i;
    int steps = 75;
    for(i=0; i<steps; i++) {
        vec3 p = ro + rd*t;

        if (uTime < 4.5) {
            p.y += sin(t/3. + uTime*1.7)*.5;
            p.x -= 1.2*sin(t/3.)*.5;
        }
        else if (uTime >= 4.5 && uTime < 9.){
            p.y += sin(t/3. + uTime*1.7)*.5;
            p.x -= 1.2*sin(t/3. + max(0., uTime-4.5)*1.3)*.5;

        }
        else if (uTime >= 9. && uTime < 13.5) {
            p.y += sin(t/3. + uTime*1.7)*.5;
            p.x -= 1.2*sin(t/3. + max(0., uTime-4.5)*1.3)*.5;
            p.xy *= rot2D(max(0., uTime - 9.)*1.);

        }
        else {
            p.y += sin(t/3. + 13.5*1.7)*.5;
            p.x -= 1.2*sin(t/3. + (13.5 - 4.5)*1.3)*.5;
            p.xy *= rot2D(max(0., 13.5 - 9. - uTime+13.5)*1.);

            // float k;
            // if (uTime < 20.) k = 1.;
            // else k = 1. / (5.*(uTime - 19.));
            rd.xy *= rot2D(t*0.01*(uTime - 13.5));

        }
        // p.x += cos(t/3. + uTime)*.5;
        // p.yz *= rot2D(uTime*.2);
        // rd.xy *= rot2D(t*0.01);
        //rd.y += 0.01*sin(uTime*10.);
        p.z += uTime;
        float d = map(p, uTime);

        t += d;

        if (t > 100.) break;
        if (d < 0.001) break;
    }





	vec3 color;
    color = palette(t*.05 + float(i)/float(steps)*.5);
	// if (uv.y > sin(uTime*0.2) - 2./3.) {color = vec3(float(i)/float(steps));}
	// if (uv.x > 0.5) {color = palette(t*.05 + float(i)*0.02);}
	gl_FragColor = vec4(color, 1);
}
`;