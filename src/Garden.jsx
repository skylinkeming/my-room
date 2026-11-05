import React, {useEffect,useMemo} from 'react';
import {Html} from '@react-three/drei';
import * as THREE from 'three';
import {Batch,Block,Rod,Curve,WickerChair,RoofTiles,WallLantern} from './CottageDetails.jsx';

const ground=-.43;
const colors={rose:['#c88d8f','#dfa6a4','#ecc7bc'],hydrangea:['#a9b7d0','#829fc7','#dce1cf','#f0e7cf'],leaf:['#61774f','#7e8b5b','#929967']};
function makeLawn(){const n=256,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const h=Math.sin(x*12.9+y*78.2)*43758.5,noise=h-Math.floor(h),v=7*Math.sin(x*.027+Math.cos(y*.035))+4*Math.sin(y*.064);const i=(y*n+x)*4;data[i]=112+v+noise*5;data[i+1]=129+v+noise*5;data[i+2]=68+v+noise*4;data[i+3]=255}const t=new THREE.DataTexture(data,n,n);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t}
function Lawn(){const t=useMemo(makeLawn,[]);useEffect(()=>()=>t.dispose(),[t]);return <group><Block name="garden-foundation" p={[0,-.72,3.5]} s={[38,.52,33]} c="#9f9f76"/><mesh name="cottage-lawn" rotation={[-Math.PI/2,0,0]} position={[0,ground,3.5]} receiveShadow><planeGeometry args={[37.9,32.9]}/><meshStandardMaterial map={t} bumpMap={t} bumpScale={.012} roughness={1}/></mesh></group>}
export function makeBrickPath(){return new THREE.CatmullRomCurve3([[10.7,ground+.06,7.15],[11.7,ground+.06,9.4],[9.7,ground+.06,12.5],[11.8,ground+.06,16],[12,ground+.06,19.8]].map(p=>new THREE.Vector3(...p)))}
function BrickPath(){const curve=useMemo(makeBrickPath,[]);const {bricks,mortar}=useMemo(()=>{
 const a=[],n=Math.ceil(curve.getLength()/.24),pos=[],idx=[];
 for(let row=0;row<=n;row++){const t=row/n,p=curve.getPointAt(t),d=curve.getTangentAt(t),theta=Math.atan2(d.x,d.z);for(const side of [-1,1])pos.push(p.x+d.z*side*.85,p.y-.027,p.z-d.x*side*.85);if(row<n){const k=row*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}
 if(row<n)for(let col=0;col<5;col++){const offset=(col-2)*.325+(row%2?.04:-.04);a.push({p:[p.x+d.z*offset,p.y,p.z-d.x*offset],s:[.307,.055,.215],rot:[0,theta,0],c:['#b57f60','#c18a6b','#a97155','#c08b6e','#b28165'][(row*3+col)%5]})}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return{bricks:a,mortar:g};
 },[curve]);useEffect(()=>()=>mortar.dispose(),[mortar]);return <group name="curved-brick-path"><mesh geometry={mortar} receiveShadow><meshStandardMaterial color="#d5c4a7" roughness={1} side={THREE.DoubleSide}/></mesh><Batch items={bricks} name="red-brick-pavers"/></group>}
function Terrace({night}){const paving=useMemo(()=>{const a=[];for(let z=0;z<9;z++)for(let x=0;x<8;x++)a.push({p:[8.15+x*.69,ground+.42,1.02+z*.69],s:[.665,.08,.665],c:['#c9b89a','#d6c4a6','#bfae91','#d0bd9d'][(x*3+z)%4]});return a},[]);return <group name="stone-tea-terrace">
<Block p={[10.6,ground+.25,3.8]} s={[5.8,.3,6.8]} c="#b9a58a"/><Batch items={paving} name="limestone-patio-pavers"/>
<Block p={[10.7,ground+.22,7.25]} s={[2.5,.22,.4]} c="#bbaa8c"/><Block p={[10.7,ground+.1,7.6]} s={[2.7,.16,.35]} c="#c9b99c"/>
<WickerChair p={[10.45,ground+.47,3]} rot={-.45}/><WickerChair p={[12.25,ground+.47,4.55]} rot={Math.PI*.8}/>
<group position={[11.15,ground+.47,4]}>
<Rod a={[0,0,0]} b={[0,.7,0]} r={.045} c="#62543f"/>{[0,1,2].map(i=><Rod key={i} a={[0,.18,0]} b={[Math.cos(i*2.094)*.35,0,Math.sin(i*2.094)*.35]} r={.023} c="#62543f"/>)}
<mesh position={[0,.73,0]}><cylinderGeometry args={[.47,.47,.055,32]}/><meshStandardMaterial color="#d9c7a7" roughness={.7}/></mesh>
{[-.15,.17].map(x=><mesh key={x} position={[x,.81,.12]}><cylinderGeometry args={[.055,.045,.12,16]}/><meshStandardMaterial color="#f5ecda"/></mesh>)}
<mesh position={[0,.87,-.17]}><sphereGeometry args={[.12,16,12]}/><meshStandardMaterial color="#d0b69b"/></mesh>
</group><WallLantern p={[7.97,2.1,5.35]} night={night}/>
</group>}
function addFlower(p,size,c,petals,leaves,stems,seed=0){
 stems.push({p:[p[0],p[1]-.15,p[2]],s:[.012,.3,.012],c:'#71804d'});
 for(let j=0;j<5;j++){const a=j*Math.PI*2/5+seed;petals.push({p:[p[0]+Math.cos(a)*size*.6,p[1]+Math.sin(a)*size*.6,p[2]],s:[size*.6,size*.37,size*.18],rot:[.3*Math.sin(seed),0,a],c})}
 leaves.push({p:[p[0]+.05,p[1]-.14,p[2]],s:[.09,.022,.04],rot:[0,seed,-.35],c:colors.leaf[seed%3|0]});
}
function gardenPlantData(){const petals=[],leaves=[],stems=[],heads=[];
 // Large cohesive borders frame the house and lawn, leaving the center clear.
 const hydrangeas=[[-7.5,7.3],[-5.9,7.5],[-1.6,7.4],[.2,7.5],[5.4,7.5],[7,7.3],[-15,16],[-13.7,16.5],[1,18],[2.8,18.3],[15,15],[15.4,12],[14,1]];
 hydrangeas.forEach(([x,z],i)=>{
 for(let j=0;j<23;j++){const a=j*2.4,y=ground+.15+(j%5)*.025;leaves.push({p:[x+Math.cos(a)*.42,y,z+Math.sin(a)*.4],s:[.22,.055,.12],rot:[.2,a,.3],c:colors.leaf[j%3]})}
 for(let h=0;h<5;h++){const a=h*2.4,center=[x+Math.cos(a)*.31,ground+.65+(h%2)*.17,z+Math.sin(a)*.29];
 heads.push({p:center,s:[.18,.18,.18],c:colors.hydrangea[i%4]});for(let k=0;k<23;k++){const theta=k*2.4,yy=1-2*(k+.5)/23,r=Math.sqrt(1-yy*yy)*.22;const p=[center[0]+Math.cos(theta)*r,center[1]+yy*.2,center[2]+Math.sin(theta)*r];addFlower(p,.045,colors.hydrangea[i%4],petals,leaves,stems,k)}}});
 const lavender=[[-9,8],[-4.2,7.6],[2.5,7.6],[-16.5,15],[-6,18],[5.4,18],[15.2,10],[14.8,2.3]];
 lavender.forEach(([x,z],i)=>{for(let j=0;j<27;j++){const a=j*2.4,r=.5*Math.sqrt((j+.5)/27),h=.48+(j%7)*.035,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;stems.push({p:[xx,ground+h/2,zz],s:[.012,h,.012],c:'#87906b'});for(let k=0;k<4;k++)petals.push({p:[xx,ground+h-k*.045,zz],s:[.035,.055,.035],c:['#a79cb6','#8c86a4','#b5a3bc'][j%3]})}});
 // Climbing roses on the facade and arbor rather than isolated flower dots.
 const vines=[[-7.65,6.75],[-1.7,6.75],[5.8,6.75],[7.9,6.9]];
 vines.forEach(([x,z],i)=>{for(let j=0;j<40;j++){const y=ground+.25+j*.065,xx=x+Math.sin(j*.6+i)*.25;leaves.push({p:[xx,y,z],s:[.1,.045,.065],rot:[.2,j,.2],c:colors.leaf[j%3]});if(j%3===0)addFlower([xx+.06,y+.02,z+.08],.09,colors.rose[i%3],petals,leaves,stems,j)}});
 for(let i=0;i<80;i++){const side=i%2?1:-1,y=ground+.15+(i%38)*.082,x=12+side*(1.45-Math.max(0,y-ground-2.3)*.65),z=18.1+Math.sin(i*1.7)*.25;leaves.push({p:[x,y,z],s:[.13,.04,.07],rot:[i,i*.5,0],c:colors.leaf[i%3]});if(i%3===0)addFlower([x,y,z+.08],.095,colors.rose[i%3],petals,leaves,stems,i)}
 for(let i=0;i<27;i++){const a=i/26*Math.PI;for(const z of [17.8,18.1]){const p=[12-Math.cos(a)*1.5,ground+2.25+Math.sin(a)*.85,z];leaves.push({p,s:[.14,.055,.08],rot:[i,a,0],c:colors.leaf[i%3]});if(i%2===0)addFlower([p[0],p[1]+.06,p[2]+.07],.1,colors.rose[i%3],petals,leaves,stems,i)}}
 return{petals,leaves,stems,heads};
}
function Flowers(){const data=useMemo(gardenPlantData,[]);return <group name="cottage-flower-borders"><Batch name="hydrangea-heads" kind="petal" items={data.heads}/><Batch name="flower-petals" kind="petal" items={data.petals}/><Batch name="garden-leaves" kind="leaf" items={data.leaves}/><Batch name="flower-stems" items={data.stems}/></group>}
function Arbor(){const points=useMemo(()=>Array.from({length:21},(_,i)=>{const a=i/20*Math.PI;return[12-Math.cos(a)*1.5,ground+2.25+Math.sin(a)*.85,18.1]}),[]);return <group name="rose-arbor">
{[-1.5,1.5].flatMap(x=>[-.32,.32].map(z=><Block key={`${x}${z}`} p={[12+x,ground+1.15,18.1+z]} s={[.1,2.3,.1]} c="#b69a70"/>))}
<Curve points={points} r={.065}/><Curve points={points.map(p=>[p[0],p[1],p[2]-.6])} r={.065}/>
{[0,1,2,3,4,5,6].map(i=><Rod key={i} a={[10.5+i*.5,ground+2.25+Math.sin(i/6*Math.PI)*.85,17.5]} b={[10.5+i*.5,ground+2.25+Math.sin(i/6*Math.PI)*.85,18.1]} r={.045}/>)}
<group name="garden-gate" position={[10.7,ground,18.3]} rotation={[0,-.2,0]}>
{Array.from({length:9},(_,i)=><Block key={i} p={[i*.27,.6,0]} s={[.13,1.15,.07]} c="#aa8c61"/>)}
<Block p={[1.08,.28,-.03]} s={[2.35,.09,.07]} c="#947650"/><Block p={[1.08,.9,-.03]} s={[2.35,.09,.07]} c="#947650"/>
</group>
</group>}
function Boundary(){const pickets=useMemo(()=>{const a=[];for(let i=0;i<139;i++){const x=-18.5+i*.267;if(x>10.4&&x<13.6)continue;a.push({p:[x,ground+.57,18.4],s:[.105,1.05,.06],c:'#e3ddc8'})}for(let i=0;i<104;i++)a.push({p:[-18.5,ground+.57,-12+i*.295],s:[.06,1.05,.105],c:'#e3ddc8'});return a},[]);return <group name="country-boundary">
<Batch kind="picket" items={pickets} name="cream-picket-fence"/>
<Block p={[-4.15,ground+.32,18.4]} s={[28.7,.07,.065]} c="#d2c8b0"/><Block p={[-4.15,ground+.83,18.4]} s={[28.7,.07,.065]} c="#d2c8b0"/>
<Block p={[16.1,ground+.32,18.4]} s={[5,.07,.065]} c="#d2c8b0"/><Block p={[16.1,ground+.83,18.4]} s={[5,.07,.065]} c="#d2c8b0"/>
<Block p={[-18.5,ground+.32,3.3]} s={[.065,.07,30.6]} c="#d2c8b0"/><Block p={[-18.5,ground+.83,3.3]} s={[.065,.07,30.6]} c="#d2c8b0"/>
<Block p={[0,ground+.4,-12.5]} s={[37.5,.8,.35]} c="#bbae94"/>
</group>}
function Tree({p,size=1}){const {leaves,branches}=useMemo(()=>{const leaves=[],branches=[];for(let i=0;i<13;i++){const a=i*2.4,y=1.4+i*.12,end=[Math.cos(a)*(1+i%3*.25),2.5+(i%4)*.25,Math.sin(a)*(1+i%3*.25)];branches.push([[0,y,0],end]);for(let j=0;j<60;j++){const theta=j*2.4,yy=1-2*(j+.5)/60,r=Math.sqrt(1-yy*yy)*.65;leaves.push({p:[end[0]+Math.cos(theta)*r,end[1]+yy*.45,end[2]+Math.sin(theta)*r],s:[.1,.022,.036],rot:[j*.3,theta,.4],c:['#7c8964','#9ba07c','#687a56'][j%3]})}}return{leaves,branches}},[]);return <group name="olive-tree" position={p} scale={size}>
<Curve points={[[0,0,0],[.1,1,0],[-.1,2,0],[.07,3,.1]]} r={.1} c="#817051"/>
{branches.map(([a,b],i)=><Rod key={i} a={a} b={b} r={.034} c="#817051"/>)}<Batch kind="leaf" items={leaves}/>
</group>}
function Bench(){return <group name="country-bench" position={[14.7,ground,1.3]} rotation={[0,-Math.PI/2,0]}>
{[-.85,.85].flatMap(x=>[-.23,.23].map(z=><Rod key={`${x}${z}`} a={[x,0,z]} b={[x,.55,z]} r={.04}/>))}
{[-.22,0,.22].map(z=><Block key={z} p={[0,.55,z]} s={[2.1,.08,.18]} c="#b59161"/>)}
{[-1,1].map(x=><Rod key={x} a={[x,.4,-.25]} b={[x,1.2,-.25]} r={.04}/>)}
{[.8,1.02].map(y=><Block key={y} p={[0,y,-.25]} s={[2.1,.13,.07]} c="#b59161"/>)}
</group>}
function Shed(){return <group name="garden-shed" position={[14.8,ground,-7.8]}>
<Block p={[0,1,0]} s={[2.8,2,2.2]} c="#ae9979"/>
{Array.from({length:13},(_,i)=><Block key={i} p={[-1.3+i*.215,1,1.13]} s={[.2,1.98,.035]} c={i%2?'#ae9776':'#baa485'}/>)}
<Block p={[.5,.9,1.17]} s={[.76,1.77,.045]} c="#9a8668"/>
{[-1,1].map(side=><Block key={side} p={[side*.72,2.28,0]} s={[1.65,.12,2.5]} c="#a37454" rot={[0,0,-side*.35]}/>)}
<Block p={[-.65,1.3,1.18]} s={[.75,.65,.04]} c="#596956"/>
<Block p={[-.65,1.3,1.21]} s={[.04,.7,.04]} c="#d0bb96"/><Block p={[-.65,1.3,1.21]} s={[.8,.04,.04]} c="#d0bb96"/>
</group>}
export default function Garden({night,showLabels,labelPortal}){return <group name="european-cottage-garden">
<Lawn/><BrickPath/><Terrace night={night}/><Flowers/><Arbor/><Boundary/>
<Tree p={[-15.6,ground,11.5]} size={1.65}/><Tree p={[-16.4,ground,-6.9]} size={1.8}/><Tree p={[15.9,ground,-10.5]} size={1.25}/>
<Bench/><Shed/>
<Html portal={labelPortal} position={[12,3.2,18]} center distanceFactor={25} style={{display:showLabels?'block':'none'}}><div className="room-label">玫瑰花園 COTTAGE GARDEN</div></Html>
</group>}
