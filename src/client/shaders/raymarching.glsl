export default /*glsl*/`

uniform float uTime;
uniform vec2 uMouse;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

#define PI 3.14159265359

vec3 palette(float t) {
    return .5+.5*cos(6.28318*(t+vec3(.3,.516,.557)));
}
float dot2( in vec3 v ) { return dot(v,v); }

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


float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float udTriangle( vec3 p, vec3 a, vec3 b, vec3 c )
{
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 ac = a - c; vec3 pc = p - c;
  vec3 nor = cross( ba, ac );

  return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(ac,nor),pc))<2.0)
     ?
     min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

float udQuad( vec3 p, vec3 a, vec3 b, vec3 c, vec3 d )
{
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 dc = d - c; vec3 pc = p - c;
  vec3 ad = a - d; vec3 pd = p - d;
  vec3 nor = cross( ba, ad );

  return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(dc,nor),pc)) +
     sign(dot(cross(ad,nor),pd))<3.0)
     ?
     min( min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(dc*clamp(dot(dc,pc)/dot2(dc),0.0,1.0)-pc) ),
     dot2(ad*clamp(dot(ad,pd)/dot2(ad),0.0,1.0)-pd) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}

float repeated(vec3 p, float size, float uTime) {
    float box = sdRoundBox(p, vec3(1.2), .0);

    vec3 planeP = p;
    planeP.yz *= rot2D(uTime);
    planeP.xz *= rot2D(uTime*1.4);
    planeP.z += sin(uTime);
    float planeSize = 2.5;
    float plane = udQuad(planeP, 
        vec3(planeSize, 0., 0.),
        vec3(0., planeSize, 0.),
        vec3(-planeSize, 0., 0.),
        vec3(0.,-planeSize, 0.)
        );


    vec3 torusP = p;
    torusP.xy *= rot2D(2.*uTime);
    vec2 torusSize = vec2(2. + 0.5*sin(uTime), .2);
    float torus = sdTorus(torusP, torusSize);

    vec3 triangleP = p;
    triangleP.z -= 5.*sin(uTime);
    triangleP.y -= 4.;
    triangleP.x -= 2.*sin(uTime*4.2) + .7*cos(uTime*2.4);
    triangleP.yz *= rot2D(6.*uTime);
    triangleP.xz *= rot2D(2.5*uTime);
    float triangle = udTriangle(triangleP, 
        vec3(0.,-.6,0.),
        vec3(0.,1.,0.),
        vec3(1.,-1.,0.)
        );

    float centralScene = min(torus, min(plane, box));
    centralScene = min(centralScene, triangle);

    vec3 id = round(p);
    p = fract(p) - .5;
    float latticePoint;
    if (id.y < 0.) {
        latticePoint = sdSphere(p, 0.01 + 0.02*abs(sin(uTime)));
    } else {
        latticePoint = sdSphere(p, 0.0);
    }
    return smin(centralScene, latticePoint, 2.*sin(uTime));
}



void main() {
    vec2 uv = (vUv - .5)*2.;


    //origin and direction
    vec3 ro = vec3(0.,.2,-5. - 2.5*sin(uTime*0.));
    vec3 rd = normalize(vec3(uv, 1));


    //lookback camera
    // if (uv.x > 0.5) rd *= -1.;

    //mouse controls
    vec2 m; float mTime = 20.;
    if (uTime > mTime) m = (uMouse - .5)*2.;
    else m = vec2(0.4*sin(PI/2. + 1.*uTime), 0.4*cos(PI/2. + 1.*uTime));
    //mouse rotation
    ro.yz *= rot2D(-m.y*2.);
    rd.yz *= rot2D(-m.y*2.);

    ro.xz *= rot2D(-m.x*2.);
    rd.xz *= rot2D(-m.x*2.);

    float t=0.;
    int i;
    int steps = 75;
    for(i=0; i<steps; i++) {
        vec3 p = ro + rd*t;
        
        // p.x += cos(t/3. + uTime)*.5;
        // p.yz *= rot2D(uTime*.2);
        // rd.xy *= rot2D(t*0.01);
        // rd.y += 0.01*sin(uTime*10.);
        // p.z += uTime;
        float d = repeated(p, 1., uTime);

        t += d;

        if (t > 100.) break;
        if (d < 0.001) break;
    }


	vec3 color;
    //t = total distance travelled, i = number of steps
    color = vec3(t*.05 + float(i)/float(steps)*.5);
    // color = palette(float(i)/float(steps)*.5);
    // if (i > 50) color = palette(1.3);
	gl_FragColor = vec4(color, 1);
}
`;