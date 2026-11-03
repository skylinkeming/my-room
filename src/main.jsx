import React, {useRef, useState, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {OrbitControls, RoundedBox, ContactShadows, Html} from '@react-three/drei';
import * as THREE from 'three';
import './style.css';

const C={cream:'#f4e8d5',wood:'#ba855b',lightwood:'#d6ab7b',green:'#84977b',pink:'#d9a39a',dark:'#554a3c'};
function Box({p=[0,0,0],s=[1,1,1],c=C.cream,r=0.04,rotation,...props}){return <RoundedBox position={p} args={s} radius={Math.min(r,...s.map(x=>x/3))} smoothness={3} rotation={rotation} castShadow receiveShadow {...props}><meshStandardMaterial color={c} roughness={.85}/></RoundedBox>}
function Ball({p,s=1,c}){return <mesh position={p} scale={Array.isArray(s)?s:[s,s,s]} castShadow><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color={c} roughness={.85}/></mesh>}
function Cylinder({p,r=.15,h=.4,c=C.wood}){return <mesh position={p} castShadow receiveShadow><cylinderGeometry args={[r,r*.85,h,24]}/><meshStandardMaterial color={c}/></mesh>}
function Plant({p=[0,0,0],size=1}){return <group position={p} scale={size}><Cylinder p={[0,.15,0]} r={.18} h={.3} c="#c98969"/>{[0,1,2,3,4].map((v)=><group key={v} rotation={[0,v*1.5,0]}><Box p={[.06,.46+v*.035,0]} s={[.025,.57,.025]} c="#667952"/><Ball p={[.13,.55+v*.035,0]} s={[.19,.09,.09]} c={v%2?'#92a273':'#6f885e'}/></group>)}</group>}
function Legs({x=.7,z=.5,y=.36}){return [-1,1].flatMap(a=>[-1,1].map(b=><Box key={`${a}${b}`} p={[a*x,y/2,b*z]} s={[.08,y,.08]} c={C.wood}/>))}
function Chair({p,rot=0}){return <group position={p} rotation={[0,rot,0]}><Legs x={.2} z={.2} y={.46}/><Box p={[0,.5,0]} s={[.55,.12,.55]} c={C.lightwood}/><Box p={[0,.82,-.23]} s={[.55,.58,.09]} c={C.lightwood}/><Box p={[0,.58,0]} s={[.44,.08,.43]} c="#b2bb97"/></group>}
function Lamp({p}){return <group position={p}><Cylinder p={[0,.05,0]} r={.25} h={.1} c="#b49a72"/><Cylinder p={[0,.9,0]} r={.025} h={1.8} c="#a28459"/><mesh position={[0,1.82,0]}><coneGeometry args={[.38,.45,32,1,true]}/><meshStandardMaterial color="#ffe2a3" side={THREE.DoubleSide}/></mesh><pointLight position={[0,1.7,0]} intensity={2} color="#ffcd87" distance={3}/></group>}
function House({night,showLabels}){return <group>
{/* raised foundation and floorboards */}
<Box p={[0,-.22,0]} s={[8.5,.4,6.6]} c="#d6bd9b" r={.12}/>
{Array.from({length:24},(_,i)=><Box key={i} p={[-4.05+i*.353,.005,0]} s={[.34,.08,6.35]} c={i%3===0?'#d8b48c':i%3===1?'#dfbf99':'#e7c9a4'} r={.005}/>)}
{/* open dollhouse walls */}
<Box p={[0,1.36,-3.18]} s={[8.35,2.7,.15]} c="#eee4d1"/>
<Box p={[-4.13,1.36,1.55]} s={[.15,2.7,3.15]} c="#e8ddc8"/>
<Box p={[-4.13,.45,-1.6]} s={[.15,.85,3.2]} c="#e8ddc8"/>
<Box p={[-4.13,2.53,-1.6]} s={[.15,.35,3.2]} c="#e8ddc8"/>
{[-3.14,-.07].map(z=><Box key={z} p={[-4.13,1.55,z]} s={[.15,1.5,.25]} c="#e8ddc8"/>)}
{/* bedroom window, actual open view */}
{[-2.94,-.29].map(z=><Box key={z} p={[-4.02,1.63,z]} s={[.16,1.53,.09]} c="#fff7e8"/>)}
{[.9,2.36].map(y=><Box key={y} p={[-4.02,y,-1.6]} s={[.2,.1,2.75]} c="#fff7e8"/>)}
<Box p={[-4.01,1.63,-1.6]} s={[.12,1.5,.07]} c="#fff7e8"/>
<Box p={[-3.94,.87,-1.6]} s={[.4,.12,2.95]} c={C.lightwood}/>
{[-2.8,-.4].map(z=><group key={z}>{[0,1,2].map(i=><Box key={i} p={[-3.91,1.65,z+i*.1]} s={[.16,1.53,.14]} c="#e4bd9f" r={.06}/>)}</group>)}
{/* scenery outside bedroom */}
<Box p={[-6.6,-.2,-1.3]} s={[4,.18,5.4]} c="#a4b790" r={.15}/>
{[[-7.6,.1,-3,1.7],[-7.5,0,-.9,1.5],[-7.1,-.1,1,1.2]].map(([x,y,z,s],i)=><Ball key={i} p={[x,y,z]} s={[s,1.5,s]} c={i%2?'#91a58b':'#a8b79d'}/>)}
{[-2.8,-.4,.7].map((z,i)=><group key={z} position={[-5.8-i*.25,0,z]}><Cylinder p={[0,.4,0]} r={.05} h={.8}/><Ball p={[0,1,0]} s={[.4,.62,.4]} c="#7f9871"/></group>)}
<Ball p={[-7.5,2,-2.3]} s={.34} c={night?'#f5eacc':'#f6d494'}/>
{/* bedroom divider, bed and rug */}
{/* Cutaway walls expose the interior while keeping the bedroom separate. */}
<Box p={[-.8,.72,-1.35]} s={[.18,1.4,3.65]} c="#e9deca"/>
<Box p={[-.8,.72,2.45]} s={[.18,1.4,1.45]} c="#e9deca"/>
{[.48,1.72].map(z=><Box key={z} p={[-.8,1.14,z]} s={[.24,2.25,.12]} c={C.lightwood}/>)}
<Box p={[-.8,2.24,1.1]} s={[.24,.14,1.36]} c={C.lightwood}/>
<Box p={[-.8,.08,1.1]} s={[.3,.05,1.12]} c={C.lightwood}/>
{/* Open bedroom door, hinged toward the bedroom. */}
<group position={[-.8,0,1.66]} rotation={[0,Math.PI/2.5,0]}>
<Box p={[0,1.08,-.54]} s={[.08,2.12,1.08]} c="#cba87e"/>
<Ball p={[.065,1.05,-.94]} s={.055} c="#a5834f"/>
</group>
<Box p={[-2.46,.08,-1.12]} s={[2.5,.045,3.25]} c="#e9dbbe" r={.13}/>
<Box p={[-2.5,.27,-1.7]} s={[1.85,.4,2.5]} c={C.wood}/>
<Box p={[-2.5,.58,-1.7]} s={[1.94,.3,2.5]} c="#fff4dc" r={.12}/>
<Box p={[-2.5,.93,-2.88]} s={[2.05,1.2,.14]} c="#c99d76" r={.1}/>
<Box p={[-2.5,.78,-1.2]} s={[1.96,.17,1.55]} c={C.green} r={.08}/>
{[-2.97,-2.03].map(x=><Box key={x} p={[x,.8,-2.46]} s={[.77,.2,.51]} c="#fff8e8" r={.1}/>)}
<Box p={[-2.5,.88,-.6]} s={[1.97,.08,.38]} c="#b4bf9e"/>
<Box p={[-1.24,.3,-2.6]} s={[.55,.6,.6]} c={C.lightwood}/><Cylinder p={[-1.24,.73,-2.6]} r={.15} h={.25} c="#f6d9a1"/>
<Plant p={[-3.8,.93,-.75]} size={.65}/>
{/* sofa */}
<Box p={[2.05,.09,1.65]} s={[3.7,.05,2.7]} c="#d8bea6" r={.2}/>
<group position={[3.42,0,1.6]} rotation={[0,-Math.PI/2,0]}><Legs x={.9} z={.36} y={.22}/><Box p={[0,.42,0]} s={[2.35,.47,.92]} c="#dba99b" r={.15}/><Box p={[0,.8,-.4]} s={[2.35,.7,.22]} c="#e4b4a5" r={.12}/>{[-1.08,1.08].map(x=><Box key={x} p={[x,.67,0]} s={[.22,.65,1]} c="#e4b4a5" r={.1}/>)}{[-.55,.55].map(x=><Box key={x} p={[x,.71,0]} s={[.96,.18,.7]} c="#e9bdad" r={.1}/>)}<Box p={[-.65,1,-.19]} s={[.42,.42,.14]} c="#f5e1b9" rotation={[-.2,0,.2]}/><Box p={[.6,.98,-.18]} s={[.4,.4,.14]} c="#8c9d80" rotation={[-.2,0,-.15]}/></group>
<group position={[1.95,0,1.65]}><Cylinder p={[0,.32,0]} r={.48} h={.12} c={C.lightwood}/><Legs x={.25} z={.22} y={.28}/><Box p={[0,.41,0]} s={[.36,.05,.25]} c="#718d80" rotation={[0,.3,0]}/><Cylinder p={[.2,.45,.12]} r={.07} h={.13} c="#fff1d9"/></group>
<Lamp p={[3.5,0,2.9]}/><Plant p={[.2,0,2.7]} size={1.15}/>
{/* kitchen */}
{[.05,.95,1.85,2.75].map((x,i)=><group key={x}><Box p={[x,.46,-2.65]} s={[.86,.9,.9]} c={i%2?'#a2af94':'#afba9f'}/><Box p={[x,.97,-2.65]} s={[.9,.12,.98]} c="#f6ecda"/><Box p={[x,.65,-2.16]} s={[.26,.035,.035]} c="#8a7756"/></group>)}
<Box p={[3.65,.93,-2.6]} s={[.83,1.85,1]} c="#ece7d9" r={.1}/><Box p={[3.65,1.15,-2.065]} s={[.65,.03,.035]} c="#c6baa4"/><Box p={[3.35,1.47,-2.04]} s={[.04,.32,.04]} c="#9d8b71"/>
<Box p={[.18,1.045,-2.65]} s={[.65,.03,.62]} c="#726d61"/>{[-.16,.16].flatMap(x=>[-.17,.17].map(z=><Cylinder key={`${x}${z}`} p={[.18+x,1.07,-2.65+z]} r={.105} h={.02} c="#393e38"/>))}
<Box p={[1.8,1.045,-2.65]} s={[.62,.03,.56]} c="#b0b8ae" r={.1}/><Box p={[1.8,1.18,-2.97]} s={[.045,.35,.045]} c="#a3967a"/><Box p={[1.8,1.35,-2.88]} s={[.045,.04,.22]} c="#a3967a"/>
<Box p={[1.2,1.98,-3.02]} s={[3,.12,.36]} c={C.lightwood}/>{[.1,.6,1.1].map((x,i)=><Cylinder key={x} p={[x,2.17,-3]} r={.1} h={.27} c={['#d5a887','#eee0bc','#a9b39b'][i]}/>)}<Plant p={[2.2,2.05,-3]} size={.55}/>
{/* dining */}
<group position={[1.55,0,-.65]}><Legs x={.68} z={.4} y={.78}/><Box p={[0,.83,0]} s={[1.9,.13,1.25]} c={C.lightwood} r={.18}/><Box p={[0,.91,0]} s={[.45,.025,1.2]} c="#eae0bd"/>{[-.55,.55].map(x=><group key={x}><Cylinder p={[x,.92,0]} r={.22} h={.025} c="#f5eddb"/><Cylinder p={[x,.95,0]} r={.16} h={.02} c="#e4d4b5"/></group>)}<Cylinder p={[0,1.04,0]} r={.1} h={.22} c="#d89a80"/><Ball p={[0,1.29,0]} s={[.18,.17,.18]} c="#e4ba90"/></group>
<Chair p={[1.55,0,-1.65]}/><Chair p={[1.55,0,.35]} rot={Math.PI}/><Chair p={[2.8,0,-.65]} rot={-Math.PI/2}/>
{/* entry shelf and decorative picture */}
<group position={[-5.3,0,0]}><Box p={[2.85,.36,2.57]} s={[2,.7,.55]} c={C.lightwood}/><Box p={[2.85,.41,2.26]} s={[1.75,.44,.03]} c="#b78d65"/><Plant p={[3.35,.74,2.55]} size={.7}/><Box p={[2.3,.78,2.55]} s={[.42,.08,.29]} c="#e5b89b"/></group><Plant p={[-3.6,0,1.3]} size={1.2}/><Box p={[-2.6,1.94,-3.06]} s={[.72,.64,.05]} c={C.wood}/><Box p={[-2.6,1.94,-3.02]} s={[.61,.53,.025]} c="#f5deb8"/><Ball p={[-2.6,2.03,-2.99]} s={[.13,.13,.015]} c="#d9a16f"/>
{showLabels&&[[-2.5,1.5,-1.6,'寢室 BEDROOM'],[1.9,1.8,.5,'客廳・開放式廚房 LIVING & KITCHEN']].map(([x,y,z,t])=><Html key={t} position={[x,y,z]} center distanceFactor={12}><div className="room-label">{t}</div></Html>)}
</group>}
const views={all:[10,10,13],bedroom:[-7,7,9],living:[8,8,10]};
function CameraRig({view,reset}){const controls=useRef(); const {camera}=useThree();const target=useRef(new THREE.Vector3());useFrame((_,dt)=>{if(!target.current)return; const dest=new THREE.Vector3(...views[view]);if(window.innerWidth<560)dest.multiplyScalar(1.22);camera.position.lerp(dest,1-Math.exp(-dt*3));if(camera.position.distanceTo(dest)<.025)target.current=null;});React.useEffect(()=>{target.current=new THREE.Vector3();if(controls.current)controls.current.target.set(view==='bedroom'?-2: view==='living'?1.5:0,.5,view==='living'?1:0)},[view,reset]);return <OrbitControls ref={controls} makeDefault minDistance={5} maxDistance={23} maxPolarAngle={Math.PI/2.08} onStart={()=>target.current=null} enablePan={false}/>}
function App(){const [view,setView]=useState('all');const [night,setNight]=useState(false);const [labels,setLabels]=useState(false);const [reset,setReset]=useState(0);return <main className={night?'app night':'app'}><header><a className="brand" href="." aria-label="日日小屋首頁"><span className="brand-icon">⌂</span><span>日日小屋<small>LITTLE WARM HOME</small></span></a><span className="header-note">把日子，過成喜歡的樣子。</span><button className="round-button" onClick={()=>setNight(!night)} title="切換日夜">{night?'☾':'☀'}</button></header><section className="intro"><div className="eyebrow"><i/> A LITTLE PLACE TO SLOW DOWN</div><h1>住進一點<span>溫柔。</span></h1><p>一扇窗、一束光，和剛剛好的日常。<br/>一間寢室，一個有廚房的溫暖客廳。</p><div className="scene-tag"><span>✳</span> 木質暖調 <b>·</b> 自然採光 <b>·</b> 慢生活</div></section><div className="scene"><Suspense fallback={<div className="loading">正在為小屋點亮燈光…</div>}><Canvas shadows camera={{position:[10,10,13],fov:36}} dpr={[1,1.8]}><color attach="background" args={[night?'#343b3b':'#f4eee5']}/><ambientLight intensity={night?.65:1.45}/><directionalLight position={[-3,9,5]} intensity={night?.65:2.4} color={night?'#cbd8ee':'#fff1d5'} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-normalBias={.04}/><House night={night} showLabels={labels}/><ContactShadows position={[0,-.46,0]} opacity={.28} scale={30} blur={2.8} far={8}/><CameraRig view={view} reset={reset}/></Canvas></Suspense></div><aside className="view-tools"><button className={labels?'active':''} onClick={()=>setLabels(!labels)} title="顯示空間標籤">⌗</button><button onClick={()=>{setView('all');setReset(v=>v+1)}} title="重設視角">↺</button></aside><div className="window-note"><span>↗</span><div>窗外，有風景<small>讓每一天，都從綠意開始。</small></div></div><footer><div className="explore"><span className="section-label">EXPLORE YOUR HOME</span><nav>{[['all','全屋漫遊','⌂'],['bedroom','寢室','☾'],['living','客廳與廚房','▱']].map(([id,name,icon])=><button key={id} className={view===id?'selected':''} onClick={()=>{setView(id);setReset(v=>v+1)}}><span>{icon}</span>{name}{view===id&&<i/>}</button>)}</nav></div><div className="interaction-hint"><span>◉</span> 拖曳旋轉 <b>·</b> 滾輪縮放<small>MADE FOR YOUR QUIET MOMENTS</small></div></footer></main>}

createRoot(document.getElementById('root')).render(<App/>);
