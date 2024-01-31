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

//3d Primitive//
///////////////////////////////

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

float sdCappedTorus( vec3 p, vec2 sc, float ra, float rb)
{
  p.x = abs(p.x);
  float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
  return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}

float sdPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}

///////////////////////////////
//2d Primitive//
///////////////////////////////
float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdSegment( in vec2 p, in vec2 a, in vec2 b )
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

float sdTriangle( in vec2 p, in vec2 p0, in vec2 p1, in vec2 p2 )
{
    vec2 e0 = p1-p0, e1 = p2-p1, e2 = p0-p2;
    vec2 v0 = p -p0, v1 = p -p1, v2 = p -p2;
    vec2 pq0 = v0 - e0*clamp( dot(v0,e0)/dot(e0,e0), 0.0, 1.0 );
    vec2 pq1 = v1 - e1*clamp( dot(v1,e1)/dot(e1,e1), 0.0, 1.0 );
    vec2 pq2 = v2 - e2*clamp( dot(v2,e2)/dot(e2,e2), 0.0, 1.0 );
    float s = sign( e0.x*e2.y - e0.y*e2.x );
    vec2 d = min(min(vec2(dot(pq0,pq0), s*(v0.x*e0.y-v0.y*e0.x)),
                     vec2(dot(pq1,pq1), s*(v1.x*e1.y-v1.y*e1.x))),
                     vec2(dot(pq2,pq2), s*(v2.x*e2.y-v2.y*e2.x)));
    return -sqrt(d.x)*sign(d.y);
}

float sdVesica(vec2 p, float r, float d)
{
    p = abs(p);
    float b = sqrt(r*r-d*d);
    return ((p.y-b)*d>p.x*b) ? length(p-vec2(0.0,b))
                             : length(p-vec2(-d,0.0))-r;
}

float sdCross( in vec2 p, in vec2 b, float r ) 
{
    p = abs(p); p = (p.y>p.x) ? p.yx : p.xy;
    vec2  q = p - b;
    float k = max(q.y,q.x);
    vec2  w = (k>0.0) ? q : vec2(b.y-p.x,-k);
    return sign(k)*length(max(w,0.0)) + r;
}


float sdHyberbola( in vec2 p, in float k, in float he ) 
{
    p = abs(p);
    p = vec2(p.x-p.y,p.x+p.y)/sqrt(2.0);

    float x2 = p.x*p.x/16.0;
    float y2 = p.y*p.y/16.0;
    float r = k*(4.0*k - p.x*p.y)/12.0;
    float q = (x2 - y2)*k*k;
    float h = q*q + r*r*r;
    float u;
    if( h<0.0 )
    {
        float m = sqrt(-r);
        u = m*cos( acos(q/(r*m))/3.0 );
    }
    else
    {
        float m = pow(sqrt(h)-q,1.0/3.0);
        u = (m - r/m)/2.0;
    }
    float w = sqrt( u + x2 );
    float b = k*p.y - x2*p.x*2.0;
    float t = p.x/4.0 - w + sqrt( 2.0*x2 - u + b/w/4.0 );
    t = max(t,sqrt(he*he*0.5+k)-he/sqrt(2.0));
    float d = length( p-vec2(t,k/t) );
    return p.x*p.y < k ? d : -d;
}
///////////////////////////////
//2d Operation//
///////////////////////////////

float opExtrusion( in vec3 p, in float sdf, in float h )
{
    vec2 w = vec2( sdf, abs(p.z) - h );
    return min(max(w.x,w.y),0.0) + length(max(w,0.0));
}


vec2 opRevolution( in vec3 p, float w )
{
    return vec2( length(p.xz) - w, p.y );
}


float opOnion( in float sdf, in float thickness )
{
    return abs(sdf)-thickness;
}

vec4 opElongate( in vec3 p, in vec3 h )
{
    //return vec4( p-clamp(p,-h,h), 0.0 ); // faster, but produces zero in the interior elongated box
    
    vec3 q = abs(p)-h;
    return vec4( max(q,0.0), min(max(q.x,max(q.y,q.z)),0.0) );
}


///////////////////////////////

float centralScene(vec3 p) {
    float k = 2.;
    float cubeSize = .7/k;
    float cubePathRadius = 3./k;
    vec2 torusSize = vec2(2., .2)/k;

    vec3 cubeP = p;
    cubeP.x += cubePathRadius + cubePathRadius*cos(uTime);
    cubeP.y += cubePathRadius*sin(uTime);
    cubeP.xy *= rot2D(uTime);
    float cube1 = sdBox(cubeP, vec3(cubeSize, cubeSize, cubeSize));

    cubeP = p;
    cubeP.x += -cubePathRadius - cubePathRadius*cos(uTime);
    cubeP.z += cubePathRadius*sin(uTime);
    cubeP.xy *= rot2D(uTime);
    float cube2 = sdBox(cubeP, vec3(cubeSize, cubeSize, cubeSize));

    vec3 torusP = p;
    torusP.yz *= rot2D(2.*uTime);
    float torus = sdTorus(torusP, torusSize);
    return min(torus, min(cube1, cube2));
}

vec2 getVectorField(vec2 pos, float uTime) {
    return vec2(1., pos.y*2. + pos.x + uTime*9.);
}


float repeated(vec3 p, float size, float uTime) {

    float centralScene1 = centralScene(p);
    vec3 p2 = p;
    p2.xy = abs(p2.xy) - clamp(15. - uTime, 5., 15.);

    float centralScene2 = centralScene(p2);

    float centralScene = min(centralScene1, centralScene2);


    vec2 id = round(p.xy - 0.5);
    p.xy = fract(p.xy) - 0.5;

    // if (abs(p.z) < 1.) {
    //     p.z = fract(p.z);
    // }

    float sideLen = .4;
    vec3 a = sideLen*vec3(cos(0.*2.*PI/3.), sin(0.*2.*PI/3.), 0.);
    vec3 b = sideLen*vec3(cos(1.*2.*PI/3.), sin(1.*2.*PI/3.), 0.);
    vec3 c = sideLen*vec3(cos(2.*2.*PI/3.), sin(2.*2.*PI/3.), 0.);
    b /= 10.;
    c /= 10.;
    
    // if(mod(id.x, 2.) > 0.) {
    //     a.xy *= rot2D(PI/6.);
    //     b.xy *= rot2D(PI/6.);
    //     c.xy *= rot2D(PI/6.);
    // }

    // float yMod = mod(id.y, 5.);
    vec2 vecField = getVectorField(id, uTime);
    a.xy *= rot2D(PI/10. * vecField.y);
    b.xy *= rot2D(PI/10. * vecField.y);
    c.xy *= rot2D(PI/10. * vecField.y);

    a *= vecField.x;
    b *= vecField.x;
    c *= vecField.x;

    float triangle;
    triangle = udTriangle(p, a, b, c);


    return smin(triangle, centralScene, 1. + sin(PI + uTime));
}



void main() {
    vec2 uv = (vUv - .5)*2.;


    //origin and direction
    vec3 ro = vec3(0.,.2, max(-5. - 2.5*uTime*0.5, -20. + 5.*sin(uTime/3.)));
    vec3 rd = normalize(vec3(uv, 1));


    //lookback camera
    // if (uv.x > 0.5) rd *= -1.;

    //mouse controls
    vec2 m; float mTime = 0.;
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
        
        float d = repeated(p, 1., uTime);
        t += d;

        if (t > 100.) break;
        if (d < 0.001) break;
    }


	vec3 color;
    //t = total distance travelled, i = number of steps
    color = vec3(t*.02 + float(i)/float(steps)*.5);
    // color = palette(float(i)/float(steps)*.5);
    if (i > 50) color = vec3(.4);
	gl_FragColor = vec4(color, 1);
}
`;