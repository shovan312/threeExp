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
    return mix(dot(axis,p) * axis, p, cos(angle)) + cross(axis, p) * sin(angle);
}

float smin(float a, float b, float k) {
    float h = max( k - abs(a-b), 0.0)/k;
    return min(a, b) - h*h*h*k*(1.0/6.0);
}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float map(vec3 p, float uTime) {

    p = mod(p,1.2) - .5;
    //p.y -= abs(sin(uTime * 1.2))/3.;
    float boxSize = 0.1;
    float box = sdBox(p, vec3(boxSize));
    //p.z *= sin(sin(uTime));
    p.x += 0.3;
    float sphere1 = sdSphere(p, boxSize);
    p.x -= 0.6;
    float sphere2 = sdSphere(p, boxSize);
    return min(box,1.);
}



void main() {
    vec2 uv = (vUv - .5)*2.;
    vec2 m; float mTime = 100.;
    if (uTime > mTime) m = (uMouse - .5)*2.;
    else m = vec2(0.4*sin(1.57 + 0.2*uTime), 0.4*cos(1.57 + 0.2*uTime));

    //origin and direction
    vec3 ro = vec3(0,0,-3);
    vec3 rd = normalize(vec3(uv, 1));
    if (uv.x > 0.5) rd *= -1.;
    if (uv.y > sin(uTime*0.2) - 2./3. && uv.y < 0.) rd *= -1.;

    //rotation
    ro.yz *= rot2D(-m.y*2.);
    rd.yz *= rot2D(-m.y*2.);

    ro.xz *= rot2D(-m.x*2.);
    rd.xz *= rot2D(-m.x*2.);


    float t=0.;
    int i;
    int steps = 50;
    for(i=0; i<steps; i++) {
        vec3 p = ro + rd*t;

        //p.y += sin(t)*.5;
        p.yz *= rot2D(uTime*.2);
        //ro.xz *= rot2D(uTime*.07);
        //rd.xy *= rot2D(uTime*0.001);
        //rd.y += 0.01*sin(uTime);
        float d = map(p, uTime);

        t += d;

        if (t > 100.) break;
        if (d < 0.001) break;
    }





	vec3 color;
	color = palette(t*.05);
	if (uv.y > sin(uTime*0.2) - 2./3.) {color = vec3(float(i)/float(steps));}
	if (uv.x > 0.5) {color = palette(t*.05 + float(i)*0.02);}
	gl_FragColor = vec4(color, 1);
}
`;