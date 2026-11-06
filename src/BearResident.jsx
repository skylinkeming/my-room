import React,{forwardRef,useEffect,useImperativeHandle,useMemo,useRef,useState} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Html,useCursor} from '@react-three/drei';
import * as THREE from 'three';
import {advanceResident,createResidentMotion,residentLocation} from './residentMotion.js';

const furColor='#b6b2a4',thread='#28282a',scale=.48;
function inkMotif(ctx,x,y,size,color,angle=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size,size);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=.1;ctx.lineCap='round';ctx.lineJoin='round';
 // Loose blue/coral animal silhouettes inspired by the worn print on the plush.
 ctx.globalAlpha=.86;ctx.beginPath();ctx.ellipse(0,.08,.32,.25,-.2,0,Math.PI*2);ctx.fill();
 for(const [xx,yy,rot] of [[-.32,-.25,-.4],[.04,-.35,.1],[.32,-.23,.35]]){ctx.beginPath();ctx.ellipse(xx,yy,.09,.29,rot,0,Math.PI*2);ctx.fill()}
 ctx.beginPath();ctx.moveTo(-.28,.18);ctx.quadraticCurveTo(-.5,.45,-.65,.16);ctx.stroke();
 ctx.beginPath();ctx.moveTo(.28,.16);ctx.quadraticCurveTo(.55,.45,.68,.16);ctx.stroke();
 ctx.globalAlpha=.25;ctx.lineWidth=.035;ctx.beginPath();ctx.arc(.1,.01,.6,Math.PI*1.05,Math.PI*1.9);ctx.stroke();ctx.restore();
}
function plushMap(head=false){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle=furColor;ctx.fillRect(0,0,512,512);
 for(let i=0;i<10500;i++){const x=(i*67.13)%512,y=(i*137.71)%512,v=Math.sin(i*1.7);ctx.strokeStyle=i%3?'rgba(230,225,209,.2)':'rgba(102,103,95,.12)';ctx.lineWidth=.6+(i%3)*.25;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+v*2,y+2.5,x+v,y+5);ctx.stroke()}
 ctx.fillStyle='rgba(241,235,213,.3)';for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse((i*97+71)%512,(i*173+85)%512,30,19,i*.7,0,Math.PI*2);ctx.fill()}
 const motifs=head?[[.79,.2,54,'#b87964',-.2],[.74,.65,85,'#697e8d',.25],[.1,.65,65,'#b87964',-.3]]:[[.42,.51,84,'#647c8f',-.3],[.58,.71,85,'#b97761',.2],[.43,.89,70,'#69808c',.8],[.59,.17,55,'#c18b76',-.4]];
 motifs.forEach(([x,y,s,c,a])=>inkMotif(ctx,x*512,y*512,s,c,a));
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function BodyGeometry(){const points=[[.4,.49],[.65,.61],[1,.69],[1.4,.71],[1.8,.69],[2.1,.61]];const n=48,m=36,p=[],uv=[],indices=[];for(let j=0;j<=m;j++){
 const y=.4+j/m*1.7;let k=0;while(k<points.length-2&&y>points[k+1][0])k++;const a=points[k],b=points[k+1],t=(y-a[0])/(b[0]-a[0]),w=THREE.MathUtils.lerp(a[1],b[1],t);
 for(let i=0;i<=n;i++){const u=i/n,theta=(u-.5)*Math.PI*2;p.push(Math.sin(theta)*w,y,Math.cos(theta)*.39);uv.push(u,j/m);if(i<n&&j<m){const q=j*(n+1)+i;indices.push(q,q+1,q+n+1,q+1,q+n+2,q+n+1)}}
 }const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const headShape={x:.83,y:.7,z:.49,centerY:2.02};
function faceDepth(x,y,offset=.009){const {x:rx,y:ry,z:rz,centerY}=headShape;return rz*Math.sqrt(Math.max(.001,1-(x/rx)**2-((y-centerY)/ry)**2))+offset}
function roundHeadGeometry(){const g=new THREE.SphereGeometry(1,64,48);g.scale(headShape.x,headShape.y,headShape.z);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/(2*headShape.x)+.5,p.getY(i)/(2*headShape.y)+.5);uv.needsUpdate=true;g.computeBoundingBox();return g}
function faceStitch(points){return points.map(([x,y])=>[x,y,faceDepth(x,y,.012)])}
function Stitch({points,r=.012}){const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);return <mesh><tubeGeometry args={[curve,20,r,7,false]}/><meshStandardMaterial color={thread} roughness={1}/></mesh>}
function Plush({p,s,material,rot,name}){return <mesh name={name} position={p} scale={s} rotation={rot} material={material} castShadow receiveShadow><sphereGeometry args={[1,32,24]}/></mesh>}
function Nose(){const g=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-.12,.055);s.quadraticCurveTo(0,.075,.12,.055);s.quadraticCurveTo(.1,-.03,0,-.095);s.quadraticCurveTo(-.1,-.03,-.12,.055);const g=new THREE.ExtrudeGeometry(s,{depth:.025,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.009,bevelThickness:.006});return g},[]);useEffect(()=>()=>g.dispose(),[g]);return <mesh position={[0,1.99,faceDepth(0,1.99)]} geometry={g}><meshStandardMaterial color={thread} roughness={1}/></mesh>}
const BearResident=forwardRef(function BearResident({walking,onGreet,greeting,onStatus,labelPortal,focused=false},ref){
 const root=useRef(),leftArm=useRef(),rightArm=useRef(),leftLeg=useRef(),rightLeg=useRef(),head=useRef(),torso=useRef();
 const state=useRef(createResidentMotion()),wave=useRef(0),elapsed=useRef(0),lastStatus=useRef(''),[hover,setHover]=useState(false);
 const {invalidate,camera}=useThree();useCursor(hover);
 const textures=useMemo(()=>({body:plushMap(),head:plushMap(true)}),[]);
 const material=useMemo(()=>new THREE.MeshPhysicalMaterial({map:textures.body,bumpMap:textures.body,bumpScale:.014,roughness:1,sheen:.5,sheenColor:new THREE.Color('#e1d9c6'),sheenRoughness:1}),[textures]);
 const faceMaterial=useMemo(()=>new THREE.MeshPhysicalMaterial({map:textures.head,bumpMap:textures.head,bumpScale:.012,roughness:1,sheen:.5,sheenColor:new THREE.Color('#e1d9c6'),sheenRoughness:1}),[textures]);
 const bodyGeometry=useMemo(BodyGeometry,[]),headGeometry=useMemo(roundHeadGeometry,[]);
 useImperativeHandle(ref,()=>root.current,[]);
 useEffect(()=>()=>{material.dispose();faceMaterial.dispose();textures.body.dispose();textures.head.dispose();bodyGeometry.dispose();headGeometry.dispose()},[material,faceMaterial,textures,bodyGeometry,headGeometry]);
 useEffect(()=>{if(greeting>0){wave.current=3.2;invalidate()}},[greeting,invalidate]);
 useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==='visible'&&(walking||wave.current>0))invalidate()},66);invalidate();return()=>clearInterval(timer)},[walking,invalidate]);
 useFrame((_,delta)=>{
 const dt=Math.min(delta,.5),s=state.current;elapsed.current+=dt;const waving=wave.current>0;
 if(waving){wave.current=Math.max(0,wave.current-dt);s.moving=false;s.heading=Math.atan2(camera.position.x-s.x,camera.position.z-s.z)}
 else if(walking)advanceResident(s,dt);else{s.moving=false;if(focused)s.heading=Math.atan2(camera.position.x-s.x,camera.position.z-s.z)}
 Object.assign(root.current.userData,{resident:true,walkingEnabled:walking,moving:s.moving,waitRemaining:s.wait,nextWaypoint:s.next,delta:dt});
 root.current.position.set(s.x,.015+(s.moving?Math.abs(Math.sin(s.phase))*.012:0),s.z);
 const angle=Math.atan2(Math.sin(s.heading-root.current.rotation.y),Math.cos(s.heading-root.current.rotation.y));root.current.rotation.y+=angle*(1-Math.exp(-dt*6));
 const swing=s.moving?Math.sin(s.phase)*.32:0;
 leftLeg.current.rotation.x=swing;rightLeg.current.rotation.x=-swing;
 leftArm.current.rotation.x=-swing*.65;rightArm.current.rotation.x=swing*.65;
 leftArm.current.rotation.z=-.13;rightArm.current.rotation.z=waving?2.35+Math.sin(elapsed.current*13)*.19:.13;
 head.current.rotation.x=focused||waving?-.12:0;
 torso.current.rotation.z=s.moving?Math.sin(s.phase)*.018:0;
 const status=waving?'正在跟你打招呼':s.moving?`在${residentLocation(s.x)}散步`:walking?`在${residentLocation(s.x)}歇歇腳`:`在${residentLocation(s.x)}休息`;
 if(status!==lastStatus.current){lastStatus.current=status;onStatus(status)}
 });
 return <group name="bear-resident" ref={root} position={[2,.015,3.4]} onClick={e=>{e.stopPropagation();onGreet()}} onPointerOver={e=>{e.stopPropagation();setHover(true)}} onPointerOut={()=>setHover(false)}>
 <group scale={scale}>
 <group ref={torso}>
 <mesh name="bear-plush-body" geometry={bodyGeometry} material={material} castShadow receiveShadow/>
 <group ref={head} position={[0,1.45,0]}><group position={[0,-1.45,0]}>
 <mesh name="bear-head" position={[0,2.02,0]} geometry={headGeometry} material={faceMaterial} castShadow receiveShadow/>
 {[-1,1].map(side=><group key={side}><Plush name={side<0?'bear-left-ear':'bear-right-ear'} p={[side*.61,2.61,-.08]} s={[.28,.27,.22]} material={material}/><Plush p={[side*.61,2.61,.115]} s={[.17,.16,.025]} material={faceMaterial}/><mesh name={side<0?'bear-left-eye':'bear-right-eye'} position={[side*.31,2.22,faceDepth(side*.31,2.22)]} rotation={[-.12,side*.22,0]} scale={[.071,.069,.025]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color={thread} roughness={1}/></mesh></group>)}
 <Nose/><Stitch points={faceStitch([[0,1.91],[0,1.8],[0,1.7]])}/>
 <Stitch points={faceStitch([[0,1.7],[-.08,1.64],[-.145,1.57]])}/><Stitch points={faceStitch([[0,1.7],[.08,1.64],[.145,1.57]])}/>
 </group></group>
 <group ref={leftArm} name="bear-left-arm" position={[-.7,1.66,0]}><Plush p={[0,-.45,0]} s={[.23,.62,.25]} material={material}/></group>
 <group ref={rightArm} name="bear-right-arm" position={[.7,1.66,0]}><Plush p={[0,-.45,0]} s={[.23,.62,.25]} material={material}/></group>
 </group>
 <group ref={leftLeg} position={[-.33,.55,0]}><Plush p={[0,-.25,0]} s={[.27,.31,.32]} material={material}/></group>
 <group ref={rightLeg} position={[.33,.55,0]}><Plush p={[0,-.25,0]} s={[.27,.31,.32]} material={material}/></group>
 </group>
 <Html portal={labelPortal} position={[0,1.85,0]} center distanceFactor={10} style={{display:greeting>0&&wave.current>0?'block':'none',pointerEvents:'none'}}><div className="resident-bubble">Hi~~你回來了~~</div></Html>
 </group>;
});
export default BearResident;
