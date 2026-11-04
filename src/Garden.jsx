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
function Pine({p,size=1}){return <group position={p} scale={size}>
<Pole p={[0,1.2,0]} h={2.4} r={.12} c="#89714d"/>
{[[.45,1.25,0],[-.45,1.85,.2],[.12,2.5,-.04]].map(([x,y,z],i)=><group key={i}><Pole p={[x/2,y-.15,z/2]} h={.8} r={.05} rot={[0,0,-Math.sign(x)*.85]}/><Ellipsoid p={[x,y,z]} s={[.85-i*.1,.32,.65]} c={['#667c50','#73875a','#829065'][i]}/><Ellipsoid p={[x+.25,y+.11,z+.12]} s={[.47,.23,.45]} c="#829164"/></group>)}
</group>}
function Maple({p,size=1}){const crowns=useMemo(()=>Array.from({length:12},(_,i)=>({x:Math.cos(i*2.4)*(.4+i%3*.15),z:Math.sin(i*2.4)*(.4+i%3*.15),y:2.1+(i%4)*.2})),[]);return <group position={p} scale={size}>
<Pole p={[0,1.1,0]} h={2.2} r={.09} c="#807052"/>
<Pole p={[-.3,1.75,0]} h={1.2} r={.045} rot={[0,0,.5]}/><Pole p={[.3,1.65,.15]} h={1.2} r={.04} rot={[.2,0,-.5]}/>
{crowns.map(({x,y,z},i)=><Ellipsoid key={i} p={[x,y,z]} s={[.65,.2,.5]} c={['#b86b4f','#c88d5a','#ad7953','#d0a06a'][i%4]}/>)}
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

export function makeStream(){return new THREE.CatmullRomCurve3([[10,-.4,-12],[12,-.4,-8],[12.4,-.4,-2],[12,-.4,3.7],[9,-.4,9],[1,-.4,10.2],[-7,-.4,9.8],[-12.6,-.4,7.8],[-14.2,-.4,5]].map(p=>new THREE.Vector3(...p)))}
function Stream({flowing}){
 const curve=useMemo(makeStream,[]), material=useRef(),{invalidate}=useThree();
 const geometry=useMemo(()=>{
 const n=180,positions=[],uv=[],indices=[];
 for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),d=curve.getTangent(t);const width=.9+.18*Math.sin(t*19);for(const side of [-1,1]){positions.push(p.x-d.z*side*width,p.y,p.z+d.x*side*width);uv.push(t,side*.5+.5)}if(i<n){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 },[curve]);
 const uniforms=useMemo(()=>({time:{value:0}}),[]);
 useEffect(()=>{if(!flowing)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')invalidate()},125);return()=>clearInterval(timer)},[flowing,invalidate]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame((_,dt)=>{if(flowing&&material.current)material.current.uniforms.time.value+=Math.min(dt,.2)});
 return <mesh name="flowing-stream" geometry={geometry}>
 <shaderMaterial ref={material} uniforms={uniforms} side={THREE.DoubleSide} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`varying vec2 vUv;uniform float time;void main(){float flow=sin(vUv.x*520.-time*3.+sin(vUv.y*15.+vUv.x*80.)*.3);float ripple=pow(max(0.,flow),18.)*.09;float edge=smoothstep(.28,.5,abs(vUv.y-.5));vec3 water=mix(vec3(.29,.49,.44),vec3(.53,.66,.57),edge);water+=ripple*vec3(.8,.86,.7);gl_FragColor=vec4(water,1.);}`} />
 </mesh>;
}
function Bridge(){const rails=useMemo(()=>[-.7,.7].map(z=>Array.from({length:15},(_,i)=>{const t=i/14;return [-1.65+t*3.3,.75+.5*Math.sin(t*Math.PI),z]})),[]);return <group name="garden-bridge" position={[12,level+.12,3.7]}>
{Array.from({length:21},(_,i)=>{const t=i/20,x=-1.65+t*3.3;return <Block key={i} p={[x,.16+.5*Math.sin(t*Math.PI),0]} s={[.151,.12,1.5]} c={i%2?'#b58e60':'#c19a6c'}/>})}
{[-1.65,-.82,0,.82,1.65].flatMap(x=>[-.7,.7].map(z=><Pole key={`${x}${z}`} p={[x,.5+.5*Math.sin((x+1.65)/3.3*Math.PI),z]} h={.85} r={.045} c="#8e6b47"/>))}
{rails.map((points,i)=><CurveRail key={i} points={points}/>)}
</group>}
function Basin(){return <group name="tsukubai-basin" position={[-10.2,level,-3.3]}>
<Ellipsoid p={[0,.3,0]} s={[.6,.4,.55]} c="#a3aa94"/>
<mesh position={[0,.65,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.32,24]}/><meshStandardMaterial color="#70998a" roughness={.2}/></mesh>
<Pole p={[-.6,.65,0]} h={1.3} r={.04} c="#a6a477"/>
<Pole p={[-.34,1.23,0]} h={.65} r={.04} c="#a6a477" rot={[0,0,Math.PI/2]}/>
<Block p={[-.09,.95,0]} s={[.014,.48,.014]} c="#b6d7c8"/>
</group>}
function Gravel(){return <group name="raked-gravel" position={[-11.2,level+.018,3.8]}>
<mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[5.4,4.6]}/><meshStandardMaterial color="#c6c2ad" roughness={1}/></mesh>
{Array.from({length:12},(_,i)=><mesh key={i} rotation={[-Math.PI/2,0,.25]} position={[0,.018,0]} scale={[1,.7,1]}><torusGeometry args={[.4+i*.15,.009,3,64]}/><meshStandardMaterial color="#a9aa96"/></mesh>)}
<Ellipsoid p={[0,.18,0]} s={[.65,.55,.4]} c="#7f8b79"/><Ellipsoid p={[-.55,.12,.25]} s={[.36,.29,.3]} c="#a0a593"/>
</group>}
export default function Garden({night,flowing,showLabels}){
 const curve=useMemo(makeStream,[]);
 const {banks,path,rocks,moss}=useMemo(()=>{
 const banks=[],path=[],rocks=[],moss=[];
 for(let i=0;i<86;i++){const t=i/85,p=curve.getPoint(t),d=curve.getTangent(t);for(const sign of [-1,1]){const w=1.05+.18*Math.sin(t*19);banks.push({p:[p.x-d.z*w*sign,level-.02,p.z+d.x*w*sign],s:[.25+(i%3)*.05,.16,.27],c:i%3?'#8d9682':'#a9ae98'})}}
 // Continuous stone promenade on all four sides; bridge links the east loop to outer garden.
 for(let i=0;i<25;i++){const x=-8.7+i*.73;path.push({p:[x,level+.05,7.25],s:[.35,.07,.27]},{p:[x,level+.05,-7.3],s:[.35,.07,.27]})}
 for(let i=0;i<20;i++){const z=-6.7+i*.7;path.push({p:[-9.2,level+.05,z],s:[.27,.07,.34]},{p:[9.7,level+.05,z],s:[.27,.07,.34]})}
 for(let i=0;i<4;i++)path.push({p:[10.2+i*.45,level+.05,3.7],s:[.28,.07,.3]});
 for(let i=0;i<18;i++){const a=i*2.4;const x=i%2?-13.8:14.2,z=-10.8+(i%9)*2.6;rocks.push({p:[x+Math.sin(a)*.4,level+.05,z],s:[.35+(i%3)*.2,.25+(i%4)*.13,.4]});moss.push({p:[x,level-.02,z],s:[1.1+(i%3)*.2,.12,.9],c:['#8b9c69','#9ca778','#788f5d'][i%3]})}
 return{banks,path,rocks,moss};
 },[curve]);
 return <group name="kyoto-garden">
<Block p={[0,-.7,0]} s={[32,.5,28]} c="#a8ad87"/>
<Block p={[0,level-.02,0]} s={[31.8,.04,27.8]} c="#b7b89a"/>
<Stones items={moss} name="moss-islands"/><Stones items={banks} name="stream-banks"/><Stones items={path} name="garden-path"/><Stones items={rocks}/>
<Stream flowing={flowing}/><Bridge/><Gravel/><Basin/>
{[[-12.6,level,-9.8,1.5],[-12.8,level,-.6,1.25],[-6.5,level,12,1.3],[14,level,-6,1.2],[5.7,level,-10.6,1.15]].map(([x,y,z,s],i)=><Pine key={i} p={[x,y,z]} size={s}/>)}
{[[-6,level,10.4,1.15],[12.6,level,10,1.1],[-12.8,level,7.2,.9]].map(([x,y,z,s],i)=><Maple key={i} p={[x,y,z]} size={s}/>)}
{[[-4,level,-11.7],[0,level,-11.7],[14.3,level,-10.8],[-14.4,level,-5]].map((p,i)=><Bamboo key={i} p={p}/>)}
{[[10.5,level,1.9],[13.7,level,5.5],[-9.6,level,-5.8],[-5,level,7.8],[5,level,-8.3]].map((p,i)=><Lantern key={i} p={p} night={night}/>)}
{/* Kyoto-style plaster boundary wall with dark tile cap, and low bamboo edging. */}
<Block p={[0,.15,-13.45]} s={[31,.95,.16]} c="#e1d6bc"/><Block p={[0,.68,-13.45]} s={[31,.12,.35]} c="#6b7461"/>
{Array.from({length:25},(_,i)=><Pole key={i} p={[-15.2,0,-12.8+i*1.05]} h={.8} r={.035} c="#929876"/>)}
<Block p={[-15.2,.24,0]} s={[.045,.04,26.4]} c="#9f9f7b"/>
{showLabels&&<Html position={[12,1.7,4]} center distanceFactor={22}><div className="room-label">京庭・小橋流水 KYOTO GARDEN</div></Html>}
</group>;
}
