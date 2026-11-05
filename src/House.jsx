import React, {useMemo} from 'react';
import {RoundedBox, Html} from '@react-three/drei';
import * as THREE from 'three';
import {FrontFacade,RoofTiles,Fireplace,FrenchDoors,CountryWindow,Curve,WallLantern} from './CottageDetails.jsx';

const oak='#c39764', cream='#f2eadb', sage='#919b77', brass='#9b7948';

// Shared, deterministic weave and grain: no remote textures or model downloads.
function surfaceTexture(wood=false){
  const n=128, data=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){
    const noise=Math.sin(x*12.9898+y*78.233)*43758.5453;
    const v=wood?150+35*Math.sin(y*.7+Math.sin(x*.04)*2)+20*(noise-Math.floor(noise)):150+45*((x+y)%2)+30*(noise-Math.floor(noise));
    const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
  }
  const t=new THREE.DataTexture(data,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(wood?2:12,wood?2:12);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
}
function floralTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#efe5d4';ctx.fillRect(0,0,256,256);for(let i=0;i<18;i++){const x=(i*73+23)%256,y=(i*47+31)%256;ctx.strokeStyle='#899776';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+10);ctx.lineTo(x-5,y+25);ctx.stroke();for(let j=0;j<5;j++){const a=j*Math.PI*2/5;ctx.fillStyle=i%2?'#c79682':'#d1ac99';ctx.beginPath();ctx.ellipse(x+Math.cos(a)*4,y+Math.sin(a)*4,4,3,a,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#d6bc7e';ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill()}const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t}
const botanical=floralTexture();
const grain=surfaceTexture(true), weave=surfaceTexture();
function Box({p=[0,0,0],s=[1,1,1],c=cream,r=.035,rot,wood=false,fabric=false,floral=false,...rest}){
  return <RoundedBox position={p} args={s} radius={Math.min(r,...s.map(v=>v/3))} smoothness={3} rotation={rot} castShadow receiveShadow {...rest}><meshStandardMaterial color={c} map={floral?botanical:null} roughness={fabric?1:wood?.65:.78} bumpMap={wood?grain:fabric?weave:null} bumpScale={wood?.025:fabric?.035:0}/></RoundedBox>;
}
function Ball({p=[0,0,0],s=1,c=cream,fabric=false,glow=false}){return <mesh position={p} scale={Array.isArray(s)?s:[s,s,s]} castShadow receiveShadow><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color={c} roughness={.92} emissive={glow?'#ffd298':'#000000'} emissiveIntensity={glow?.65:0} bumpMap={fabric?weave:null} bumpScale={.025}/></mesh>}
function Cyl({p=[0,0,0],r=.15,h=.3,c=oak,rt,rot}){return <mesh position={p} rotation={rot} castShadow receiveShadow><cylinderGeometry args={[rt??r,r,h,24]}/><meshStandardMaterial color={c} roughness={.75}/></mesh>}
function Glow({p,s,c='#ffe1a2',strength=1.1}){return <mesh position={p}><boxGeometry args={s}/><meshStandardMaterial color={c} emissive={c} emissiveIntensity={strength}/></mesh>}
function Legs({x=.5,z=.3,h=.7}){return [-1,1].flatMap(a=>[-1,1].map(b=><Box key={`${a}${b}`} p={[a*x,h/2,b*z]} s={[.065,h,.065]} c={oak} wood/>))}
function Plant({p=[0,0,0],size=1,tall=false}){return <group position={p} scale={size}>
<Cyl p={[0,.16,0]} r={.2} rt={.24} h={.32} c="#d8c6a7"/>
{tall&&<Cyl p={[0,.93,0]} r={.024} rt={.012} h={1.5} c="#8b7955"/>}
{Array.from({length:tall?46:12},(_,i)=>{
 const a=i*2.399, y=tall?.7+(i%13)*.075:.35+i*.027;
 const rad=tall?.13+.24*Math.sin((i%13)/13*Math.PI):.13;
 return <group key={i} rotation={[0,a,0]}>
 <Box p={[rad/2,y-.09,0]} s={[.014,tall?.25:.28,.014]} c="#88764f" rot={[0,0,-.7]}/>
 <mesh position={[rad,y,0]} rotation={[.3,0,-.4]} scale={[tall?.11:.14,.035,tall?.047:.07]} castShadow><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={['#687c4e','#849464','#9ca979'][i%3]}/></mesh>
 </group>;
})}
</group>}
function Books({p=[0,0,0],count=5}){return <group position={p}>{Array.from({length:count},(_,i)=><Box key={i} p={[i*.095, .16+(i%2)*.02,0]} s={[.065,.32+(i%2)*.04,.22]} c={['#cdb99a','#9aa388','#ece1cb','#b6937c'][i%4]} wood/>)}</group>}
function Vase({p=[0,0,0],flowers=false}){return <group position={p}><Ball p={[0,.15,0]} s={[.15,.19,.15]} c="#e8ddc5"/><Cyl p={[0,.31,0]} r={.055} h={.12} c="#e8ddc5"/>{Array.from({length:7},(_,i)=><group key={i} rotation={[0,i*2.4,0]}><Box p={[.07,.48+i*.025,0]} s={[.012,.45,.012]} c="#7b8860" rot={[0,0,-.3]}/>{flowers?<Ball p={[.13,.7+i*.025,0]} s={.07} c={i%2?'#d29d7d':'#ecbc97'}/>:<Ball p={[.13,.64+i*.025,0]} s={[.12,.04,.06]} c="#7b8f62"/>}</group>)}</group>}
function TableLamp({p=[0,0,0],night=false}){return <group position={p}><Cyl p={[0,.04,0]} r={.13} h={.08} c={brass}/><Cyl p={[0,.18,0]} r={.035} h={.3} c={brass}/><mesh position={[0,.4,0]}><cylinderGeometry args={[.12,.2,.28,24]}/><meshStandardMaterial color="#f8e7c9" emissive="#f6cd8d" emissiveIntensity={.15} roughness={1}/></mesh><pointLight position={[0,.4,0]} color="#ffd092" intensity={night?2:.3} distance={2.5}/></group>}
function FloorLamp({p=[0,0,0],night=false}){return <group position={p}><Cyl p={[0,.035,0]} r={.23} h={.07} c={brass}/><Cyl p={[0,.9,0]} r={.022} h={1.8} c={brass}/><Box p={[.18,1.78,0]} s={[.4,.028,.028]} c={brass}/><Cyl p={[.35,1.62,0]} r={.23} rt={.18} h={.35} c="#f1d9ac"/><pointLight position={[.35,1.5,0]} color="#ffd69d" intensity={night?3:.4} distance={3}/></group>}
function Art({p=[0,0,0],rot=0,botanical=false}){return <group position={p} rotation={[0,rot,0]}><Box s={[1.35,.98,.07]} c={oak} wood/><Box p={[0,0,.043]} s={[1.22,.85,.015]} c="#eee2c7"/>{botanical?[0,1,2].map(i=><group key={i} position={[-.33+i*.32,-.05,.06]}><Box s={[.018,.54,.008]} c="#a27a54" rot={[0,0,.15-i*.15]}/>{[0,1,2].map(j=><Ball key={j} p={[(j%2?1:-1)*.08,-.12+j*.16,.01]} s={[.1,.045,.008]} c="#b28f69"/>)}</group>):<><Ball p={[.3,.18,.06]} s={[.13,.13,.008]} c="#d4b483"/><Ball p={[-.25,-.24,.065]} s={[.34,.25,.008]} c="#b2b59b"/><Ball p={[.26,-.29,.07]} s={[.34,.2,.008]} c="#8e9e82"/></>}</group>}
function Chair({p,rot=0,arm=false}){return <group position={p} rotation={[0,rot,0]}><Legs x={arm?.3:.23} z={.23} h={.46}/><Box p={[0,.53,0]} s={[arm?.82:.65,.19,.67]} c="#e8ddc8" r={.12} fabric/><Box p={[0,.88,-.26]} s={[arm?.83:.65,.66,.18]} c="#e8ddc8" r={.12} rot={[-.12,0,0]} fabric/>{arm&&[-1,1].map(a=><Box key={a} p={[a*.37,.71,0]} s={[.15,.3,.68]} c="#e8ddc8" r={.08} fabric/>)}</group>}
function Rug({p,s,c='#dbccb0'}){return <group position={p}><Box s={s} c={c} fabric r={.025}/>{Array.from({length:18},(_,i)=><Box key={i} p={[-s[0]/2+(i+.5)*s[0]/18,s[1]/2+.001,0]} s={[.012,.004,s[2]-.08]} c="#e9deca" r={.001}/>)}</group>}

// Deformed cloth surfaces give the duvet and throw actual folds and draped edges.
function Cloth({p,s,c,drop=.2,name}){
 const geometry=useMemo(()=>{const n=48,m=32,pos=[],uv=[],indices=[];
 for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const u=i/n,v=j/m,x=(u-.5)*s[0],z=(v-.5)*s[2];const edge=Math.pow(Math.abs(u-.5)*2,12)*drop;const foot=Math.pow(v,16)*drop*.5;const fold=.026*Math.sin(x*9+z*2)+.012*Math.cos(z*21+x*3)+.018*Math.sin(x*17-z*5);pos.push(x,fold-edge-foot,z);uv.push(u*2,v*2);if(i<n&&j<m){let a=j*(n+1)+i;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g},[s[0],s[2],drop]);
 React.useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh name={name} position={p} geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={c} roughness={1} side={THREE.DoubleSide} bumpMap={weave} bumpScale={.014}/></mesh>;
}
function Curtain({p,width,height=2.95,sheer=false}){
 const geometry=useMemo(()=>{const n=32,m=8,pos=[],uv=[],indices=[];for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const u=i/n,v=j/m;pos.push(Math.sin(u*Math.PI*10)*.055,(v-.5)*height,(u-.5)*width);uv.push(u,v);if(i<n&&j<m){const a=j*(n+1)+i;indices.push(a,a+1,a+n+1,a+1,a+n+2,a+n+1)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g},[width,height]);
 React.useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh name={sheer?'sheer-curtain':'folded-curtain'} position={p} geometry={geometry} castShadow={!sheer} receiveShadow><meshStandardMaterial color={sheer?'#fff5df':'#e7d8bc'} roughness={1} side={THREE.DoubleSide} transparent={sheer} opacity={sheer?.42:1} depthWrite={!sheer} map={sheer?null:botanical} bumpMap={weave} bumpScale={.009}/></mesh>;
}
function Bedroom({night}){return <group name="bedroom">
<Rug p={[-4.7,.085,-3.4]} s={[4.15,.04,4.95]}/>
<Box name="bed-frame" p={[-4.7,.29,-3.85]} s={[3.08,.46,4]} c={oak} wood r={.1}/>
<Box p={[-4.7,.63,-3.85]} s={[3.12,.3,4]} c="#f7eedc" r={.14} fabric/>
<Box p={[-4.7,1.13,-5.89]} s={[3.28,1.65,.22]} c="#d6c3a3" r={.2} fabric/>
<Cloth name="draped-duvet" p={[-4.7,.99,-3.22]} s={[3.24,.1,2.95]} c={sage} drop={.23}/>
{[-5.45,-3.95].map(x=><Box key={x} p={[x,.9,-5.25]} s={[1.3,.28,.78]} c="#f6f0df" r={.13} fabric/>)}
{[-5.2,-4.2].map(x=><Box key={x} p={[x,1.15,-4.96]} s={[.79,.62,.22]} c="#a1aa87" r={.1} rot={[-.2,0,.05]} fabric/>)}
<Cloth name="draped-throw" p={[-4.7,1.04,-2.25]} s={[3.29,.06,.83]} c="#e7d7bc" drop={.3}/>
{[-6.8,-2.6].map(x=><group key={x}><Box p={[x,.36,-5.2]} s={[.72,.68,.7]} c={oak} wood/><Box p={[x,.36,-4.83]} s={[.56,.35,.025]} c="#a78254"/><Books p={[x-.2,.15,-4.82]} count={3}/><TableLamp p={[x,.72,-5.2]} night={night}/></group>)}
<Art p={[-4.7,2.5,-6.39]}/>
<Curve points={[[-6.34,1.77,-5.98],[-5.8,1.97,-5.98],[-5.25,2.17,-5.98],[-4.15,2.17,-5.98],[-3.6,1.97,-5.98],[-3.06,1.77,-5.98]]} r={.045} c="#a5855d"/>
{/* Flush full-height storage, clear of the bed and its bedside table. */}
<group name="wardrobe" position={[-1.2,0,-5.91]}>
<Box p={[0,1.59,0]} s={[2.15,3.12,.95]} c="#a98253"/>
{[-.79,-.26,.26,.79].map((x,i)=><group key={x}><Box p={[x,1.62,.49]} s={[.515,3.04,.065]} c={i%2?'#b78f60':'#c29c6d'}/><Box p={[x+(i%2?-.16:.16),1.6,.54]} s={[.035,.48,.035]} c={brass}/></group>)}
<Box p={[0,3.16,0]} s={[2.3,.14,1.06]} c="#967348" wood/>
</group>
{/* Desk rear edge flush to left wall; seated user faces the wall. */}
<group name="bedroom-workspace" position={[-7.32,0,3.58]} rotation={[0,Math.PI/2,0]}>
<Legs x={1.02} z={.36} h={.78}/><Box p={[0,.85,0]} s={[2.4,.14,.95]} c={oak} wood/>
<Box p={[.82,.42,0]} s={[.62,.74,.84]} c={oak} wood/>{[.22,.44,.66].map(y=><Box key={y} p={[.82,y,.435]} s={[.47,.025,.025]} c={brass}/>)}
<Box p={[-.23,.96,-.18]} s={[.45,.06,.28]} c="#c0bfb0"/><Box p={[-.23,1.15,-.24]} s={[.06,.38,.06]} c="#b8b9ad"/>
<Box p={[-.23,1.52,-.24]} s={[1.19,.76,.08]} c="#3a423d"/>
<Box p={[-.23,1.52,-.19]} s={[1.08,.65,.012]} c="#c7d9c9"/>
<Box p={[-.4,1.54,-.18]} s={[.55,.44,.008]} c="#edf0df"/>{[0,1,2].map(i=><Box key={i} p={[-.4,1.66-i*.09,-.17]} s={[.38,.025,.005]} c="#a4b79b"/>)}
<Box p={[.18,1.61,-.18]} s={[.24,.13,.008]} c="#90ac92"/>
<Box p={[-.23,.955,.23]} s={[.78,.04,.27]} c="#f7f2e7"/>{[0,1,2].map(i=><Box key={i} p={[-.23,.98,.15+i*.07]} s={[.64,.007,.015]} c="#d0cfbe"/>)}
<Ball p={[.35,.98,.25]} s={[.06,.025,.09]} c="#f0eadb"/>
<Plant p={[.9,.93,-.18]} size={.55}/><TableLamp p={[-.95,.93,-.13]} night={night}/>
<Chair p={[-.25,0,1.1]} rot={Math.PI}/>
</group>
{/* Reading corner, kept behind the entrance circulation zone. */}
<Chair p={[-1.4,0,.25]} rot={-.4} arm/>
<Box floral p={[-1.4,.84,.16]} s={[.42,.38,.12]} c={sage} r={.08} fabric/>
<Cyl p={[-.55,.31,.65]} r={.27} h={.62}/><TableLamp p={[-.55,.63,.65]} night={night}/>
<FloorLamp p={[-.75,0,-.7]} night={night}/>
<group name="bookcase" position={[-.36,0,-3.45]} rotation={[0,-Math.PI/2,0]}>
<Box p={[0,1.2,-.2]} s={[1.4,2.4,.08]} c={oak} wood/>{[-.69,.69].map(x=><Box key={x} p={[x,1.2,0]} s={[.07,2.4,.43]} c={oak} wood/>)}
{[.12,.68,1.24,1.8,2.38].map((y,i)=><group key={y}><Box p={[0,y,0]} s={[1.38,.07,.44]} c={oak} wood/>{i<4&&<Books p={[-.52,y+.04,0]} count={i%2?6:4}/>}</group>)}
</group>
<Plant p={[-7.1,0,-5.9]} size={1.2} tall/>
</group>}

function TV(){return <group name="living-room-tv" position={[.46,0,.55]} rotation={[0,Math.PI/2,0]}>
<Box p={[0,.4,0]} s={[2.8,.65,.65]} c={oak} wood/>{[-.9,0,.9].map(x=><Box key={x} p={[x,.42,.34]} s={[.83,.43,.03]} c="#ba915d" wood/>)}
<Box p={[0,.79,0]} s={[.64,.06,.28]} c="#424b43"/><Box p={[0,.94,-.06]} s={[.065,.3,.06]} c="#424b43"/>
<Box p={[0,1.6,-.06]} s={[2.45,1.4,.1]} c="#2f3831"/>
<Box p={[0,1.6,0]} s={[2.31,1.25,.012]} c="#c7dbce"/>
<Ball p={[.74,1.94,.013]} s={[.15,.15,.008]} c="#f0d59a"/>
<Ball p={[-.62,1.22,.016]} s={[.51,.23,.008]} c="#9cae86"/>
<Ball p={[.35,1.25,.026]} s={[.78,.25,.008]} c="#728e72"/>
<Box p={[0,1.03,.04]} s={[2.3,.08,.008]} c="#a6c7bb"/>
<Plant p={[1.14,.76,.03]} size={.45}/>
</group>}
function Living({night}){return <group name="living-room">
<Rug p={[3.55,.085,.65]} s={[5.65,.045,3.7]} c="#e2d5ba"/>
<group name="sofa" position={[5.55,0,.6]} rotation={[0,-Math.PI/2,0]}>
<Legs x={1.25} z={.36} h={.2}/><Box p={[0,.45,0]} s={[3.8,.55,1.25]} c="#d8a58c" r={.18} fabric/>
<Box p={[0,1,-.5]} s={[3.8,1,.3]} c="#dfb096" r={.14} fabric/>
{[-1.8,1.8].map(x=><Box key={x} p={[x,.72,0]} s={[.3,.78,1.3]} c="#e2b49a" r={.12} fabric/>)}
{[-1.17,0,1.17].map(x=><Box key={x} p={[x,.82,.04]} s={[1.1,.28,1]} c="#e9bfa5" r={.12} fabric/>)}
{[[-1.05,'#f2e8d3'],[-.35,'#a0a77d'],[1,'#f2e8d3']].map(([x,c])=><Box key={x} p={[x,1.07,-.2]} s={[.57,.55,.18]} c={c} r={.09} rot={[-.15,0,x*.12]} fabric floral={x!==-.35}/>)}
<Box p={[1.15,.93,.27]} s={[.55,.07,.7]} c="#ede1c7" fabric/>
</group>
<group name="oval-coffee-table" position={[3.15,0,.6]}><Cyl p={[0,.3,0]} r={.43} h={.6}/><group scale={[1.15,1,.85]}><Cyl p={[0,.66,0]} r={.82} h={.14}/></group><Vase p={[-.16,.73,-.14]}/><Box p={[.18,.75,.26]} s={[.37,.045,.26]} c="#e2dcc3"/><Cyl p={[.42,.8,.1]} r={.07} h={.13} c="#eee2c6"/></group>
<TV/>
<Cyl p={[6,.33,2.8]} r={.35} h={.66}/><TableLamp p={[6,.67,2.8]} night={night}/>
<FloorLamp p={[7,0,-1.1]} night={night}/>
{/* Sideboard is against the right wall, away from the doorway. */}
<group name="sideboard" position={[7.32,0,-1.55]} rotation={[0,-Math.PI/2,0]}>
<Box p={[0,.55,0]} s={[2.1,1.05,.65]} c={oak} wood/>{[-.7,0,.7].map(x=><Box key={x} p={[x,.56,.34]} s={[.65,.8,.025]} c="#c79f6d" wood/>)}
<Vase p={[-.6,1.09,0]} flowers/><TableLamp p={[.5,1.09,0]} night={night}/>
<Art p={[0,2.1,-.34]} botanical/>
</group>
<Plant p={[5.5,0,5.6]} size={1.5} tall/>
</group>}
function Pendant({night}){return <group name="dining-pendant" position={[3.15,0,-2.25]}>
<Cyl p={[0,3.3,0]} r={.1} h={.06} c="#544c39"/><Cyl p={[0,2.94,0]} r={.012} h={.7} c="#544c39"/>
<mesh position={[0,2.46,0]} scale={[.61,.4,.61]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#dbb578" transparent opacity={.8} roughness={1} bumpMap={weave} bumpScale={.04}/></mesh>
{Array.from({length:18},(_,i)=><mesh key={i} position={[0,2.46,0]} rotation={[0,i*Math.PI/18,0]} scale={[.6,.4,.6]}><torusGeometry args={[1,.012,4,48]}/><meshStandardMaterial color="#b38c54"/></mesh>)}
<Ball p={[0,2.44,0]} s={.12} c="#fff0bd"/>
<pointLight position={[0,2.2,0]} color="#ffd29a" intensity={night?6:1.3} distance={5}/>
</group>}
function Kitchen({night}){return <group name="open-kitchen" position={[.4,0,-1]}>
{[.7,1.65,2.6,3.55,4.5].map((x,i)=><group key={x}><Box p={[x,.48,-4.88]} s={[.92,.9,1.02]} c={sage}/><Box p={[x,.99,-4.88]} s={[.96,.12,1.08]} c="#eee5d0"/><Box p={[x,.46,-4.35]} s={[.74,.65,.025]} c="#7e8b6d"/><Box p={[x,.46,-4.327]} s={[.61,.52,.018]} c={sage}/><Box p={[x,.68,-4.3]} s={[.28,.025,.035]} c={brass}/></group>)}
<Box p={[5.71,1.14,-4.84]} s={[1.12,2.23,1.1]} c="#eee7d6" r={.12}/><Box p={[5.71,1.03,-4.26]} s={[1,.025,.025]} c="#c5bba4"/>{[.72,1.4].map(y=><Box key={y} p={[5.35,y,-4.23]} s={[.04,.32,.04]} c={brass}/>)}
<Box p={[1.65,.98,-4.6]} s={[.83,.32,.73]} c="#f0eadc" r={.08}/><Box p={[1.65,1.15,-4.78]} s={[.65,.035,.5]} c="#b6baa9" r={.09}/><Box p={[1.65,1.24,-5.15]} s={[.035,.36,.035]} c={brass}/><Box p={[1.65,1.4,-5.04]} s={[.035,.035,.26]} c={brass}/>
<Box p={[3.55,1.064,-4.85]} s={[.77,.025,.65]} c="#5d6455"/>{[-.19,.19].flatMap(x=>[-.18,.18].map(z=><Cyl key={`${x}${z}`} p={[3.55+x,1.085,-4.85+z]} r={.13} h={.025} c="#353c33"/>))}
<Box p={[3.55,.51,-4.34]} s={[.69,.56,.035]} c="#353c33"/><Box p={[3.55,.74,-4.3]} s={[.51,.04,.035]} c={brass}/><Box p={[3.65,.51,-4.28]} s={[.22,.32,.025]} c="#e4d8bd" fabric/>
{[1.86,2.63].map(y=><group key={y}><Box p={[3.95,y,-5.18]} s={[1.4,.09,.43]} c={oak} wood/><Glow p={[3.95,y-.055,-5.1]} s={[1.4,.015,.08]} strength={night?2:1}/>{[3.6,3.95,4.3,4.65].map((x,i)=><Cyl key={x} p={[x,y+.15,-5.16]} r={.1} h={.2} c={i%2?'#e3d7bc':'#eee5d3'}/>)}</group>)}
<pointLight position={[2.5,1.75,-4.7]} color="#ffd69f" intensity={night?3:.6} distance={4}/>
<Plant p={[4.28,2.7,-5.16]} size={.65}/><Vase p={[.7,1.06,-4.9]} flowers/>
{/* Dining table and four chairs leave the kitchen working aisle open. */}
<group position={[3.15,0,-2.25]}>
<Legs x={.85} z={.44} h={.82}/><Box p={[0,.88,0]} s={[2.25,.14,1.35]} c={oak} wood r={.22}/>
{[-.64,.64].map(x=><group key={x}><Cyl p={[x,.97,0]} r={.22} h={.025} c="#eee4cb"/><Cyl p={[x,1,0]} r={.16} h={.02} c="#ddd1b5"/></group>)}
<Vase p={[0,.96,0]} flowers/>
<Chair p={[-.55,0,-1.06]}/><Chair p={[.55,0,-1.06]}/><Chair p={[-.55,0,1.06]} rot={Math.PI}/><Chair p={[.55,0,1.06]} rot={Math.PI}/>
</group><Pendant night={night}/>
<Plant p={[.6,0,-3.85]} size={1.4} tall/>
</group>}
function WindowAndLandscape(){return <group position={[-1,0,0]}>
<Box p={[-6.9,1.61,-5.95]} s={[.16,3.2,1]} c="#e9dfca"/>
<Box p={[-6.9,1.61,5.95]} s={[.16,3.2,1]} c="#e9dfca"/>
{/* Solid front wall for the desk; opening lies beside the bed. */}
<Box p={[-6.9,1.61,2.1]} s={[.16,3.2,6.6]} c="#e9dfca"/>
<Box p={[-6.9,.33,-3.3]} s={[.16,.62,4.2]} c="#e9dfca"/>
<Box p={[-6.9,3.03,-3.3]} s={[.16,.36,4.2]} c="#e9dfca"/>
{[-5.43,-1.2].map(z=><Box key={z} p={[-6.9,1.61,z]} s={[.16,3.2,.14]} c="#e9dfca"/>)}
{[-5.25,-3.3,-1.35].map(z=><Box key={z} p={[-6.79,1.75,z]} s={[.12,2.2,.06]} c={oak} wood/>)}
{[.65,2.85].map(y=><Box key={y} p={[-6.79,y,-3.3]} s={[.17,.08,4]} c={oak} wood/>)}
<Box p={[-6.7,.61,-3.3]} s={[.36,.1,4.18]} c={oak} wood/>
{/* Soft folded cloth, with a translucent inner layer beside each curtain. */}
<Curtain p={[-6.58,1.63,-5.05]} width={.7}/><Curtain p={[-6.58,1.63,-1.52]} width={.7}/>
<Curtain p={[-6.7,1.7,-4.58]} width={.6} height={2.2} sheer/><Curtain p={[-6.7,1.7,-1.99]} width={.6} height={2.2} sheer/>
<Box p={[-6.55,3.13,-3.3]} s={[.035,.035,4.6]} c={brass}/>

</group>}

function GardenDoor({open,onToggle}){return <group name="garden-exit">
{/* A physical 2.2 m opening in the living-room wall, aligned with the veranda. */}
<Box p={[7.9,.39,1.15]} s={[.16,.74,2.9]} c="#eee3cc"/>
<Box p={[7.9,1.61,5.64]} s={[.16,3.2,1.67]} c="#eee3cc"/>
<Box p={[7.9,3.02,3.7]} s={[.16,.38,2.25]} c="#eee3cc"/>
{[2.6,4.8].map(z=><Box key={z} p={[7.9,1.43,z]} s={[.23,2.85,.1]} c={oak} wood/>)}
<Box p={[7.9,2.85,3.7]} s={[.23,.12,2.3]} c={oak} wood/>
<Box p={[7.9,.04,3.7]} s={[.34,.06,2.25]} c={oak} wood/>
<FrenchDoors open={open} onToggle={onToggle}/>
</group>}


export default function House({night,showLabels,doorOpen,onDoorToggle,fireOn=true,labelPortal}){
 const boards=useMemo(()=>Array.from({length:46},(_,i)=>({x:-7.85+i*.35,c:['#d5b185','#ddbb8f','#d9b88d','#e0bf93'][i%4]})),[]);
 return <group name="little-warm-home">
<Box name="foundation" p={[0,-.22,0]} s={[16.2,.4,13.2]} c="#c5a47b" r={.1}/>
{boards.map(({x,c},i)=><group key={i}>{[0,1,2,3].map(j=><Box key={j} p={[x,.005,-4.85+j*3.23]} s={[.342,.07,3.215]} c={c} r={.005} wood/>)}</group>)}
<group name="rear-window-wall"><Box p={[0,.7,-6.45]} s={[16,1.4,.16]} c="#eee3cc"/><Box p={[0,2.98,-6.45]} s={[16,.46,.16]} c="#eee3cc"/><Box p={[-3.6,2.07,-6.45]} s={[8.8,1.34,.16]} c="#eee3cc"/><Box p={[5.65,2.07,-6.45]} s={[4.7,1.34,.16]} c="#eee3cc"/><CountryWindow p={[2.05,2.07,-6.56]} w={2.5} h={1.3} rot={Math.PI} shutters={false}/></group>
{/* Restore the full front facade; the garden exit remains in the right wall. */}
<FrontFacade/>
<Box p={[-3.95,.14,6.33]} s={[7.7,.2,.045]} c="#d9cbb4"/><Box p={[3.95,.14,6.33]} s={[7.7,.2,.045]} c="#d9cbb4"/>
<WindowAndLandscape night={night}/>
<Box p={[7.9,1.61,-3.38]} s={[.16,3.2,6.14]} c="#eee3cc"/>
{/* Full-height partition with a 1.4 m clear doorway near the front. TV ends at z=1.95. */}
<Box name="bedroom-partition-back" p={[0,1.61,-1.9]} s={[.2,3.2,9.1]} c="#e9dfca"/>
<Box name="bedroom-partition-front" p={[0,1.61,5.3]} s={[.2,3.2,2.3]} c="#e9dfca"/>
<Box p={[0,2.94,3.4]} s={[.2,.54,1.5]} c="#e9dfca"/>
{[2.65,4.15].map(z=><Box key={z} p={[0,1.34,z]} s={[.25,2.66,.1]} c={oak} wood/>)}
<Box p={[0,2.66,3.4]} s={[.25,.12,1.6]} c={oak} wood/>
<group name="open-bedroom-door" position={[-.12,0,4.1]} rotation={[0,Math.PI/2,0]}>
<Box p={[0,1.32,-.7]} s={[.075,2.57,1.4]} c={oak} wood/>
{[.72,1.95].map(y=><Box key={y} p={[.044,y,-.7]} s={[.015,1.08,1.12]} c="#cfab79"/>)}
<Box p={[.08,1.3,-1.2]} s={[.13,.04,.2]} c={brass}/>
</group>
<Box p={[-3.95,.14,-6.33]} s={[7.7,.2,.045]} c="#d9cbb4"/><Box p={[3.95,.14,-6.33]} s={[7.7,.2,.045]} c="#d9cbb4"/>
<RoofTiles/><Fireplace on={fireOn} night={night}/><WallLantern p={[6.8,2.2,6.69]} night={night}/>
<Bedroom night={night}/><Living night={night}/><Kitchen night={night}/><GardenDoor open={doorOpen} onToggle={onDoorToggle}/>
{[[-3.7,2,-1,'寢室・閱讀與工作 BEDROOM'],[3.2,2,.2,'客廳・開放式廚房 LIVING & KITCHEN']].map(([x,y,z,t])=><Html portal={labelPortal} key={t} position={[x,y,z]} center distanceFactor={15} style={{display:showLabels?'block':'none'}}><div className="room-label">{t}</div></Html>)}
</group>;
}
