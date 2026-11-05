import React, {useLayoutEffect,useMemo,useRef} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const palette={stone:'#d8c7a8',oak:'#b48a59',sage:'#899474',brick:'#b98265'};
export function Block({p=[0,0,0],s=[1,1,1],c=palette.stone,rot,name,...props}){return <mesh name={name} position={p} scale={s} rotation={rot} castShadow receiveShadow {...props}><boxGeometry/><meshStandardMaterial color={c} roughness={.86}/></mesh>}
export function Rod({a,b,r=.035,c=palette.oak}){const data=useMemo(()=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p);return{p:p.add(q).multiplyScalar(.5),q:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),h:d.length()}},[a,b]);return <mesh position={data.p} quaternion={data.q} castShadow><cylinderGeometry args={[r*.8,r,data.h,10]}/><meshStandardMaterial color={c} roughness={.8}/></mesh>}
export function Curve({points,r=.035,c=palette.oak}){const path=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);return <mesh castShadow><tubeGeometry args={[path,32,r,8,false]}/><meshStandardMaterial color={c} roughness={.8}/></mesh>}
function picketGeometry(){const shape=new THREE.Shape();shape.moveTo(-.5,-.5);shape.lineTo(-.5,.35);shape.lineTo(0,.5);shape.lineTo(.5,.35);shape.lineTo(.5,-.5);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:1,steps:1,bevelEnabled:false});g.translate(0,0,-.5);return g}
export function Batch({items,kind='box',name,roughness=.9}){
 const ref=useRef();const geometry=useMemo(()=>kind==='leaf'?new THREE.SphereGeometry(1,8,4):kind==='petal'?new THREE.SphereGeometry(1,8,5):kind==='picket'?picketGeometry():new RoundedBoxGeometry(1,1,1,2,.055),[kind]);
 React.useEffect(()=>()=>geometry.dispose(),[geometry]);
 useLayoutEffect(()=>{if(!items.length)return;const d=new THREE.Object3D();items.forEach((it,i)=>{d.position.set(...it.p);d.scale.set(...it.s);d.rotation.set(...(it.rot??[0,0,0]));d.updateMatrix();ref.current.setMatrixAt(i,d.matrix);ref.current.setColorAt(i,new THREE.Color(it.c??palette.stone))});ref.current.instanceMatrix.needsUpdate=true;ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere()},[items]);
 return <instancedMesh name={name} ref={ref} args={[geometry,null,items.length]} castShadow receiveShadow><meshStandardMaterial roughness={roughness}/></instancedMesh>;
}
export function Stonework({segments,name='limestone-courses'}){
 const stones=useMemo(()=>{const items=[];segments.forEach(({p,w,h,rot=0},segment)=>{const rows=Math.max(1,Math.round(h/.36));for(let row=0;row<rows;row++){
 let x=-w/2;while(x<w/2-.025){const width=Math.min(w/2-x,.48+((row*7+segment*11+Math.floor(x*31))%5+5)%5*.095);const px=x+width/2,py=(row+.5)*h/rows-h/2;items.push({p:[p[0]+Math.cos(rot)*px,p[1]+py,p[2]-Math.sin(rot)*px],s:[width-.018,h/rows-.025,.11],rot:[0,rot,0],c:['#cdbb9d','#d7c7ab','#dfd1b7','#c8b798','#dac9ad'][(row+items.length)%5]});x+=width}
 }});return items},[segments]);return <Batch name={name} items={stones}/>;
}
function TileGeometry(){const pos=[],uv=[],idx=[],n=12;for(let j=0;j<2;j++)for(let i=0;i<=n;i++){const t=i/n;pos.push((t-.5)*.38,.075*Math.sin(t*Math.PI),j*.52-.26);uv.push(t,j);if(j===0&&i<n){const a=i;idx.push(a,a+1,a+n+1,a+1,a+n+2,a+n+1)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
export function RoofTiles(){const ref=useRef(),geometry=useMemo(TileGeometry,[]);const tiles=useMemo(()=>{const a=[];for(const side of [-1,1])for(let row=0;row<4;row++)for(let col=0;col<34;col++)a.push({p:[side*(8.12-row*.42),3.25+row*.22,-6.55+col*.4],rot:[0,Math.PI/2,-side*.482,'ZYX'],c:['#a96f4f','#bc8561','#c89571','#b57d59'][(row*3+col)%4]});return a},[]);
 useLayoutEffect(()=>{const d=new THREE.Object3D();tiles.forEach((t,i)=>{d.position.set(...t.p);d.rotation.set(...t.rot);d.updateMatrix();ref.current.setMatrixAt(i,d.matrix);ref.current.setColorAt(i,new THREE.Color(t.c))});ref.current.instanceMatrix.needsUpdate=true;ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere()},[tiles]);React.useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group name="terracotta-roof">{[-1,1].map(side=><Block key={side} p={[side*7.5,3.575,0]} s={[1.95,.065,13.8]} c="#a77855" rot={[0,0,-side*.482]}/>)}<instancedMesh ref={ref} args={[geometry,null,tiles.length]} castShadow receiveShadow><meshStandardMaterial side={THREE.DoubleSide} roughness={.9}/></instancedMesh>{[-1,1].map(side=><Rod key={side} a={[side*8.2,3.17,-6.7]} b={[side*8.2,3.17,6.8]} r={.045} c="#8f7454"/>)}</group>;
}
export function CountryWindow({p,w=2.7,h=1.8,rot=0,shutters=true}){return <group name="country-window" position={p} rotation={[0,rot,0]}>
{[-w/2,w/2].map(x=><Block key={x} p={[x,0,0]} s={[.1,h+.12,.13]} c={palette.oak}/>)}
{[-h/2,h/2].map(y=><Block key={y} p={[0,y,0]} s={[w+.15,.1,.13]} c={palette.oak}/>)}
{[-w/6,w/6].map(x=><Block key={x} p={[x,0,.025]} s={[.05,h,.08]} c={palette.oak}/>)}
<Block p={[0,0,.025]} s={[w,.05,.08]} c={palette.oak}/>
<mesh><planeGeometry args={[w,h]}/><meshPhysicalMaterial color="#ced9c8" transparent opacity={.18} roughness={.1} side={THREE.DoubleSide} depthWrite={false}/></mesh>
<Block p={[0,-h/2-.1,.12]} s={[w+.4,.14,.4]} c="#b6a080"/>
{shutters&&[-1,1].map(side=><group key={side} position={[side*(w/2+.39),0,.045]}>
<Block s={[.66,h+.08,.07]} c={palette.sage}/>{[-.28,.28].map(x=><Block key={x} p={[x,0,.04]} s={[.055,h+.08,.045]} c="#6d7b5e"/>)}
{Array.from({length:12},(_,i)=><Block key={i} p={[0,-h/2+.1+i*(h-.15)/12,.065]} s={[.51,.09,.04]} c={i%2?'#899579':'#96a082'} rot={[-.16,0,0]}/>)}
</group>)}
</group>}
export function FrontFacade(){const segments=useMemo(()=>[
{p:[0,.42,6.55],w:16,h:.8},{p:[0,2.98,6.55],w:16,h:.45},
{p:[-7.175,1.76,6.55],w:1.65,h:1.9},{p:[-.525,1.76,6.55],w:4.25,h:1.9},{p:[6.4,1.76,6.55],w:3.2,h:1.9},
],[]);return <group name="front-exterior-wall">
{segments.map((q,i)=><Block key={i} p={[q.p[0],q.p[1],6.45]} s={[q.w,q.h,.18]} c="#d7c7ad"/>)}
<Stonework segments={segments}/>
<CountryWindow p={[-4.5,1.75,6.61]} w={3.7}/><CountryWindow p={[3.2,1.75,6.61]} w={3.2}/>
{[-7.87,7.87].map(x=><group key={x}>{Array.from({length:8},(_,i)=><Block key={i} p={[x,.23+i*.4,6.55]} s={[.43,.36,.26]} c={i%2?'#c8b597':'#e0cfb2'}/>)}</group>)}
</group>}
export function FrenchDoors({open,onToggle}){return <group name="french-garden-doors">
{[-1,1].map(side=><group key={side} name={side<0?'french-door-left':'french-door-right'} position={[7.93,0,3.7+side*1.04]} rotation={[0,open?-side*Math.PI*.42:0,0]} onClick={e=>{e.stopPropagation();onToggle()}}>
{[0,-side*1.02].map(z=><Block key={z} p={[0,1.39,z]} s={[.085,2.74,.07]} c={palette.oak}/>)}
{[.08,1,1.85,2.73].map(y=><Block key={y} p={[0,y,-side*.51]} s={[.085,.065,1.05]} c={palette.oak}/>)}
<Block p={[0,1.4,-side*.51]} s={[.075,2.7,.045]} c={palette.oak}/>
<mesh position={[0,1.4,-side*.51]}><boxGeometry args={[.02,2.6,1]}/><meshPhysicalMaterial color="#e2e3ce" transparent opacity={.15} roughness={.08} depthWrite={false}/></mesh>
<Block p={[-.065,1.25,-side*.93]} s={[.07,.2,.035]} c="#a58b55"/>
</group>)}
</group>}
export function Fireplace({on,night}){const segments=useMemo(()=>[{p:[5.75,1.1,-3.08],w:.4,h:2.2},{p:[7.1,1.1,-3.08],w:.4,h:2.2},{p:[6.42,2.1,-3.08],w:1.75,h:.45},{p:[6.42,3.8,-3.5],w:1.2,h:3}],[]);return <group name="country-fireplace">
<Block p={[6.42,1.08,-3.55]} s={[1.85,2.16,1]} c="#b4a287"/>
<Block p={[6.42,.78,-3.015]} s={[1,.95,.09]} c="#37352e"/>
<Block p={[6.42,3.7,-3.58]} s={[1.2,3.25,.9]} c="#c7b599"/><Stonework segments={segments} name="fireplace-stone"/>
<Block p={[6.42,1.82,-2.93]} s={[2,.17,.35]} c="#a47a50"/>
<Block p={[6.42,.1,-2.96]} s={[2.05,.17,1.35]} c="#b9a78b"/>
{[-.23,.15,.3].map((x,i)=><Rod key={x} a={[6.05+x,.29,-3.05]} b={[6.5+x,.34,-2.83]} r={.065} c="#71563c"/>)}
{[0,1,2].map(i=><mesh key={i} visible={on} position={[6.18+i*.2,.55,-2.97]} scale={[.12,.28+i%2*.1,.065]}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color="#ffd08a" emissive="#ff993c" emissiveIntensity={2.5}/></mesh>)}
<pointLight position={[6.42,.65,-2.7]} color="#ffbb75" intensity={on?(night?5:1.5):0} distance={5}/>
<Block p={[6.42,5.34,-3.5]} s={[1.45,.15,1.35]} c="#b8a88f"/>
{[-.28,.28].map(x=><mesh key={x} position={[6.42+x,5.62,-3.5]}><cylinderGeometry args={[.16,.19,.5,16]}/><meshStandardMaterial color="#ad7958"/></mesh>)}
</group>}
export function WickerChair({p,rot=0}){const weave=useMemo(()=>{const a=[];for(let i=0;i<20;i++){const x=-.45+i*.047;a.push({p:[x,.92,-.39],s:[.017,.7,.04],c:i%2?'#bb9563':'#a88151'})}for(let i=0;i<12;i++)a.push({p:[0,.62+i*.055,-.365],s:[.92,.016,.04],c:'#c09c6b'});return a},[]);return <group position={p} rotation={[0,rot,0]}>
{[-.4,.4].flatMap(x=>[-.3,.3].map(z=><Rod key={`${x}${z}`} a={[x,0,z]} b={[x,.53,z]} r={.04}/>))}
<Batch items={weave}/>
<Curve points={[[-.48,.55,.35],[-.51,.91,.2],[-.45,1.22,-.4],[.45,1.22,-.4],[.51,.91,.2],[.48,.55,.35]]} r={.045}/>
<Block p={[0,.55,0]} s={[.94,.2,.86]} c="#eee2cc"/>
<Block p={[0,.92,-.27]} s={[.76,.58,.18]} c="#e5dac4" rot={[-.15,0,0]}/>
</group>}
export function WallLantern({p,night=false}){return <group position={p}>
<Block p={[0,0,-.12]} s={[.14,.3,.05]} c="#5e5644"/>
<Rod a={[0,.1,-.12]} b={[0,.16,.16]} r={.025} c="#5e5644"/>
<Block p={[0,-.1,.15]} s={[.25,.36,.21]} c="#f2d6a0"/>
{[-.13,.13].flatMap(x=>[-.11,.11].map(z=><Rod key={`${x}${z}`} a={[x,-.3,.15+z]} b={[x,.1,.15+z]} r={.018} c="#5e5644"/>))}
<mesh position={[0,.14,.15]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[.24,.17,4]}/><meshStandardMaterial color="#5e5644"/></mesh>
<pointLight position={[0,-.05,.3]} color="#ffda9f" intensity={night?1.4:.1} distance={3}/>
</group>}
