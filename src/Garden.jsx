import React, {useEffect,useLayoutEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import * as THREE from 'three';

const level=-.43;
function Block({p,s,c='#b6ae96',rot}){return <mesh position={p} rotation={rot} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.9}/></mesh>}
function Ellipsoid({p,s,c='#7b875b'}){return <mesh position={p} scale={s} castShadow receiveShadow><icosahedronGeometry args={[1,2]}/><meshStandardMaterial color={c} roughness={1}/></mesh>}
function Pole({p,h,r=.04,c='#866a45',rot}){return <mesh position={p} rotation={rot} castShadow><cylinderGeometry args={[r*.8,r,h,8]}/><meshStandardMaterial color={c} roughness={.9}/></mesh>}
function CurveRail({points,c='#826448',r=.055}){const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);return <mesh castShadow><tubeGeometry args={[curve,24,r,6,false]}/><meshStandardMaterial color={c} roughness={.85}/></mesh>}

// Instancing keeps the perimeter's stones and planted beds inexpensive to draw.
function Stones({items,name='garden-stones'}){const ref=useRef();useLayoutEffect(()=>{const d=new THREE.Object3D();items.forEach((s,i)=>{d.position.set(...s.p);d.scale.set(...s.s);d.rotation.set(.1,i*1.71,.08);d.updateMatrix();ref.current.setMatrixAt(i,d.matrix);ref.current.setColorAt(i,new THREE.Color(s.c??(i%2?'#979b88':'#afb0a0')))});ref.current.instanceMatrix.needsUpdate=true;ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere()},[items]);return <instancedMesh ref={ref} name={name} args={[null,null,items.length]} castShadow receiveShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial roughness={1}/></instancedMesh>}
function Foliage({p,s,c,needle=false}){
 const ref=useRef(),count=needle?240:180;
 useLayoutEffect(()=>{const d=new THREE.Object3D();for(let i=0;i<count;i++){
  const a=i*2.399963,yy=1-2*(i+.5)/count,rr=Math.sqrt(1-yy*yy),rad=.55+.45*((i*17%101)/101);
  d.position.set(Math.cos(a)*rr*rad,yy*rad,Math.sin(a)*rr*rad);d.rotation.set(i*.7,i*1.3,i*.4);d.scale.set(needle?.1:.08,needle?.018:.025,needle?.035:.07);d.updateMatrix();ref.current.setMatrixAt(i,d.matrix);ref.current.setColorAt(i,new THREE.Color(c).multiplyScalar(.85+(i%7)*.045));
 }ref.current.instanceMatrix.needsUpdate=true;ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere()},[c,needle,count]);
 return <group position={p} scale={s}><instancedMesh ref={ref} args={[null,null,count]} castShadow receiveShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1}/></instancedMesh></group>;
}
function Pine({p,size=1}){return <group position={p} scale={size}>
<Pole p={[0,1.2,0]} h={2.4} r={.12} c="#89714d"/>
{[[.45,1.25,0],[-.45,1.85,.2],[.12,2.5,-.04]].map(([x,y,z],i)=><group key={i}><Pole p={[x/2,y-.15,z/2]} h={.8} r={.05} rot={[0,0,-Math.sign(x)*.85]}/><Foliage needle p={[x,y,z]} s={[.85-i*.1,.32,.65]} c={['#667c50','#73875a','#829065'][i]}/><Foliage needle p={[x+.25,y+.11,z+.12]} s={[.47,.23,.45]} c="#829164"/></group>)}
</group>}
function Maple({p,size=1}){const crowns=useMemo(()=>Array.from({length:12},(_,i)=>({x:Math.cos(i*2.4)*(.4+i%3*.15),z:Math.sin(i*2.4)*(.4+i%3*.15),y:2.1+(i%4)*.2})),[]);return <group position={p} scale={size}>
<Pole p={[0,1.1,0]} h={2.2} r={.09} c="#807052"/>
<Pole p={[-.3,1.75,0]} h={1.2} r={.045} rot={[0,0,.5]}/><Pole p={[.3,1.65,.15]} h={1.2} r={.04} rot={[.2,0,-.5]}/>
{crowns.map(({x,y,z},i)=><Foliage key={i} p={[x,y,z]} s={[.65,.2,.5]} c={['#b86b4f','#c88d5a','#ad7953','#d0a06a'][i%4]}/>)}
</group>}
function Bamboo({p,count=9}){return <group position={p}>{Array.from({length:count},(_,i)=>{const x=Math.cos(i*2.4)*(i%3*.21),z=Math.sin(i*2.4)*(i%3*.22),h=2.4+(i%4)*.27;return <group key={i}><Pole p={[x,h/2,z]} h={h} r={.045} c="#98a071"/>{[.6,1.2,1.8,2.4].filter(y=>y<h).map(y=><Block key={y} p={[x,y,z]} s={[.1,.025,.1]} c="#b5b38a"/>)}{[0,1,2].map(j=><Ellipsoid key={j} p={[x+(j-1)*.22,h-.4+j*.15,z]} s={[.38,.055,.1]} c="#78885b"/>)}</group>})}</group>}
function Lantern({p,night=false}){return <group position={p}>
<Block p={[0,.04,0]} s={[.6,.08,.6]} c="#989c8d"/><Pole p={[0,.35,0]} h={.6} r={.12} c="#aaad9d"/>
<Block p={[0,.68,0]} s={[.42,.1,.42]} c="#a1a594"/>
<mesh position={[0,.86,0]}><boxGeometry args={[.25,.3,.25]}/><meshStandardMaterial color="#f6e2ad" emissive="#ffd293" emissiveIntensity={night?2:.1}/></mesh>
{[-1,1].flatMap(a=>[-1,1].map(b=><Pole key={`${a}${b}`} p={[a*.15,.86,b*.15]} h={.33} r={.025} c="#8b9180"/>))}
<mesh position={[0,1.1,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[.48,.2,4]}/><meshStandardMaterial color="#969e8b"/></mesh>
<mesh position={[0,1.28,0]}><sphereGeometry args={[.06,8,6]}/><meshStandardMaterial color="#969e8b"/></mesh>
{night&&<pointLight position={[0,.9,0]} color="#ffd69b" intensity={1.4} distance={3}/>}
</group>}

export function makeStream(){return new THREE.CatmullRomCurve3([[17,-.4,-14],[18,-.4,-8],[20,-.4,-1],[20,-.4,7],[19,-.4,14],[20,-.4,22],[24,-.4,29.8]].map(p=>new THREE.Vector3(...p)))}
function Stream({flowing,night}){
 const curve=useMemo(makeStream,[]), material=useRef(),{invalidate}=useThree();
 const geometry=useMemo(()=>{
 const n=180,positions=[],uv=[],indices=[];
 for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),d=curve.getTangent(t);const width=.9+.18*Math.sin(t*19);for(const side of [-1,1]){positions.push(p.x-d.z*side*width,p.y,p.z+d.x*side*width);uv.push(t,side*.5+.5)}if(i<n){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 },[curve]);
 const uniforms=useMemo(()=>({time:{value:0},light:{value:1}}),[]);
 useEffect(()=>{uniforms.light.value=night?.22:1;invalidate()},[night,uniforms,invalidate]);
 useEffect(()=>{if(!flowing)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')invalidate()},125);return()=>clearInterval(timer)},[flowing,invalidate]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame((_,dt)=>{if(flowing&&material.current)material.current.uniforms.time.value+=Math.min(dt,.2)});
 return <mesh name="flowing-stream" geometry={geometry}>
 <shaderMaterial transparent ref={material} uniforms={uniforms} side={THREE.DoubleSide} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec2 vUv;uniform float time;uniform float light;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
vec2 grid=vec2(vUv.x*310.,vUv.y*7.);vec2 cell=floor(grid),f=fract(grid)-.5;float h=hash(cell);float pebble=1.-smoothstep(.2,.46,length(f*vec2(.85,1.1)));vec3 rock=mix(vec3(.39,.38,.28),vec3(.67,.64,.49),h);vec3 bed=mix(vec3(.34,.38,.28),rock,pebble);vec3 water=mix(bed,vec3(.35,.52,.43),.35);
float flow=sin(vUv.x*420.-time*2.2+sin(vUv.y*12.+vUv.x*90.)*.4);float ripple=pow(max(0.,flow),24.)*.07;
water+=ripple*vec3(.8,.85,.65);float alpha=1.-smoothstep(.38,.5,abs(vUv.y-.5));gl_FragColor=vec4(water*light,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>

}`} />
 </mesh>;
}
function Bridge(){const rails=useMemo(()=>[-.7,.7].map(z=>Array.from({length:15},(_,i)=>{const t=i/14;return [-1.65+t*3.3,.75+.5*Math.sin(t*Math.PI),z]})),[]);return <group name="garden-bridge" position={[19,level+.12,14]}>
{Array.from({length:21},(_,i)=>{const t=i/20,x=-1.65+t*3.3;return <Block key={i} p={[x,.16+.5*Math.sin(t*Math.PI),0]} s={[.151,.12,1.5]} c={i%2?'#b58e60':'#c19a6c'}/>})}
{[-1.65,-.82,0,.82,1.65].flatMap(x=>[-.7,.7].map(z=><Pole key={`${x}${z}`} p={[x,.5+.5*Math.sin((x+1.65)/3.3*Math.PI),z]} h={.85} r={.045} c="#8e6b47"/>))}
{rails.map((points,i)=><CurveRail key={i} points={points}/>)}
</group>}
function Basin(){return <group name="tsukubai-basin" position={[22.8,level,22]}>
<Ellipsoid p={[0,.3,0]} s={[.6,.4,.55]} c="#a3aa94"/>
<mesh position={[0,.65,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.32,24]}/><meshStandardMaterial color="#70998a" roughness={.2}/></mesh>
<Pole p={[-.6,.65,0]} h={1.3} r={.04} c="#a6a477"/>
<Pole p={[-.34,1.23,0]} h={.65} r={.04} c="#a6a477" rot={[0,0,Math.PI/2]}/>
<Block p={[-.09,.95,0]} s={[.014,.48,.014]} c="#b6d7c8"/>
</group>}
function Gravel(){return <group name="raked-gravel" position={[-20.5,level+.018,3.8]}>
<mesh rotation={[-Math.PI/2,0,0]} scale={[1,.8,1]}><circleGeometry args={[2.4,64]}/><meshStandardMaterial color="#c6c2ad" roughness={1}/></mesh>
{Array.from({length:12},(_,i)=><mesh key={i} rotation={[-Math.PI/2,0,.25]} position={[0,.018,0]} scale={[1,.7,1]}><torusGeometry args={[.4+i*.15,.009,3,64]}/><meshStandardMaterial color="#a9aa96"/></mesh>)}
<Ellipsoid p={[0,.18,0]} s={[.65,.55,.4]} c="#7f8b79"/><Ellipsoid p={[-.55,.12,.25]} s={[.36,.29,.3]} c="#a0a593"/><Ellipsoid p={[.6,.1,.4]} s={[.32,.22,.28]} c="#989e89"/>
</group>}
// A lawn with softly varying grass color, shared across the expanded property.
function Lawn(){
 const texture=useMemo(()=>{
  const n=512,data=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const a=Math.sin(x*12.9898+y*78.233)*43758.5453,noise=a-Math.floor(a);
   const wave=Math.sin(x*.018+Math.cos(y*.016))*8+Math.sin(y*.027)*5;
   const i=(y*n+x)*4;data[i]=119+wave+noise*5;data[i+1]=136+wave+noise*5;data[i+2]=72+wave+noise*4;data[i+3]=255;
  }
  const t=new THREE.DataTexture(data,n,n);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
 },[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh name="open-lawn" rotation={[-Math.PI/2,0,0]} position={[0,level+.005,7]} receiveShadow><planeGeometry args={[51.8,45.8]}/><meshStandardMaterial map={texture} bumpMap={texture} bumpScale={.012} roughness={1}/></mesh>;
}
function Branch({from,to,r=.04}){const {mid,q,length}=useMemo(()=>{const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),d=b.clone().sub(a);return{mid:a.add(b).multiplyScalar(.5),q:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),length:d.length()}},[from,to]);return <mesh position={mid} quaternion={q} castShadow><cylinderGeometry args={[r*.5,r,length,7]}/><meshStandardMaterial color="#796044" roughness={1}/></mesh>}
// Individual blossom clusters and petals avoid the solid spherical tree canopies.
function Cherry({p,size=1,name}){
 const blossoms=useRef(),petals=useRef();
 const {branches,flowers,fallen}=useMemo(()=>{
  const branches=[],flowers=[],fallen=[];
  for(let i=0;i<11;i++){
   const a=i*2.399,origin=[.13*Math.sin(i),1.5+i*.12,0],end=[Math.cos(a)*(1.25+i%3*.25),2.8+(i%4)*.32,Math.sin(a)*(1.1+i%3*.2)];
   branches.push({from:origin,to:end,r:.055-i*.002});
   for(let j=0;j<4;j++){
    const t=.48+j*.17,base=origin.map((v,k)=>v+(end[k]-v)*t),tip=[base[0]+Math.cos(a+.8)*.46,base[1]+.25,base[2]+Math.sin(a+.8)*.46];
    branches.push({from:base,to:tip,r:.016});
    for(let k=0;k<16;k++){const b=k*2.4+i,rad=.06+(k%5)*.055;flowers.push({p:[tip[0]+Math.cos(b)*rad,tip[1]+Math.sin(k*1.7)*.16,tip[2]+Math.sin(b)*rad],s:.037+(k%3)*.012,c:['#f6ded7','#efc3cc','#f9e8df','#e7b2bf'][k%4]})}
   }
  }
  for(let i=0;i<95;i++){const a=i*2.4,rad=Math.sqrt((i+.5)/95)*2.1;fallen.push({p:[Math.cos(a)*rad,.016,Math.sin(a)*rad],s:[.025,.006,.016]})}
  return{branches,flowers,fallen};
 },[]);
 useLayoutEffect(()=>{
  const d=new THREE.Object3D();flowers.forEach((f,i)=>{for(let j=0;j<5;j++){const a=j*Math.PI*2/5+i*.3,k=i*5+j;d.position.set(f.p[0]+Math.cos(a)*f.s*.65,f.p[1]+Math.sin(a)*f.s*.65,f.p[2]);d.scale.set(f.s*.66,f.s*.38,f.s*.2);d.rotation.set(.15*Math.sin(i),.2*Math.cos(i),a);d.updateMatrix();blossoms.current.setMatrixAt(k,d.matrix);blossoms.current.setColorAt(k,new THREE.Color(f.c))}});blossoms.current.instanceMatrix.needsUpdate=true;blossoms.current.instanceColor.needsUpdate=true;blossoms.current.computeBoundingSphere();
  fallen.forEach((f,i)=>{d.position.set(...f.p);d.scale.set(...f.s);d.rotation.set(0,i*2.4,0);d.updateMatrix();petals.current.setMatrixAt(i,d.matrix)});petals.current.instanceMatrix.needsUpdate=true;petals.current.computeBoundingSphere();
 },[flowers,fallen]);
 return <group name={name} position={p} scale={size}>
 <Branch from={[0,0,0]} to={[.12,1.95,0]} r={.12}/>
 {branches.map((b,i)=><Branch key={i} {...b}/>)}
 <instancedMesh ref={blossoms} args={[null,null,flowers.length*5]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial roughness={.95}/></instancedMesh>
 <instancedMesh ref={petals} args={[null,null,fallen.length]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#efd1d4" roughness={1}/></instancedMesh>
 </group>;
}
function Bench(){return <group name="maple-bench" position={[21.6,level,-10.5]}>
{[-.85,.85].map(x=><Block key={x} p={[x,.24,0]} s={[.1,.48,.55]} c="#94704a"/>)}
{[-.2,0,.2].map(z=><Block key={z} p={[0,.52,z]} s={[2.15,.09,.18]} c="#c39c6b"/>)}
{[-1,1].map(x=><Block key={x} p={[x,.85,-.29]} s={[.09,.8,.09]} c="#94704a"/>)}
{[.78,1.02].map(y=><Block key={y} p={[0,y,-.29]} s={[2.15,.15,.07]} c="#c39c6b"/>)}
</group>}
export default function Garden({night,flowing,showLabels}){
 const curve=useMemo(makeStream,[]);
 const {banks,path,moss}=useMemo(()=>{
  const banks=[],path=[],moss=[];
  // Sparse asymmetric rocks, with long quiet grassy banks between groups.
  for(let i=0;i<34;i++){
   if(i%5===2)continue;
   const t=(i+.35)/34,p=curve.getPoint(t),d=curve.getTangent(t),sign=i%2?1:-1,w=1.04+.18*Math.sin(t*19);
   banks.push({p:[p.x-d.z*w*sign,level-.015,p.z+d.x*w*sign],s:[.23+(i%4)*.07,.12+(i%3)*.05,.25+(i%3)*.06],c:i%3?'#a3a38c':'#b5b09a'});
   if(i%4===0)moss.push({p:[p.x-d.z*1.6*sign,level-.05,p.z+d.x*1.6*sign],s:[.8,.12,.6],c:'#8c9b65'});
  }
  const approach=new THREE.CatmullRomCurve3([[10.3,level+.05,3.7],[11.4,level+.05,7],[13.8,level+.05,10.6],[17.4,level+.05,14]].map(p=>new THREE.Vector3(...p)));
  for(let i=0;i<15;i++){const p=approach.getPoint(i/14);path.push({p:p.toArray(),s:[.38,.065,.3],c:'#c2b69b'})}
  const far=new THREE.CatmullRomCurve3([[20.7,level+.05,14],[22.6,level+.05,7],[22.2,level+.05,-1],[21.6,level+.05,-9]].map(p=>new THREE.Vector3(...p)));
  for(let i=0;i<24;i++){const p=far.getPoint(i/23);path.push({p:p.toArray(),s:[.32,.055,.25],c:'#c2b69b'})}
  return{banks,path,moss};
 },[curve]);
 return <group name="kyoto-garden">
 <Block p={[0,-.7,7]} s={[52,.5,46]} c="#9ca37b"/><Lawn/>
 <Stones items={moss} name="moss-islands"/><Stones items={banks} name="stream-banks"/><Stones items={path} name="garden-path"/>
 <Stream flowing={flowing} night={night}/><Bridge/><Gravel/><Basin/>
 <Pine p={[-22,level,-1]} size={2.1}/>
 <Maple p={[22,level,-12.3]} size={1.65}/><Bench/>
 <Cherry name="cherry-foreground-left" p={[-18,level,24]} size={1.7}/>
 <Cherry name="cherry-middle-left" p={[-13.2,level,17.4]} size={1.55}/>
 <Bamboo p={[-12,level,-14.2]} count={6}/><Bamboo p={[17,level,-14.2]} count={6}/>
 <Lantern p={[-21.8,level,1.4]} night={night}/>
 {/* Low boundary planting is restrained; the central foreground stays empty. */}
 {[-21,-15,-7,1,8,15,22].map((x,i)=><Foliage key={x} p={[x,level+.1,-14.8]} s={[1.4,.24,.55]} c={i%2?'#879662':'#98a274'}/>)}
 <Block p={[0,.35,-15.5]} s={[51,1.5,.16]} c="#e1d6bc"/><Block p={[0,1.14,-15.5]} s={[51,.12,.36]} c="#6b7461"/>
 <Block p={[-25.5,.35,4]} s={[.16,1.5,39]} c="#e1d6bc"/><Block p={[-25.5,1.14,4]} s={[.36,.12,39]} c="#6b7461"/>
 <Block p={[25.5,.35,4]} s={[.16,1.5,39]} c="#e1d6bc"/><Block p={[25.5,1.14,4]} s={[.36,.12,39]} c="#6b7461"/>
 <Html position={[19,1.7,14]} center distanceFactor={26} style={{display:showLabels?'block':'none'}}><div className="room-label">櫻庭・小橋流水 SAKURA GARDEN</div></Html>
 </group>;
}
