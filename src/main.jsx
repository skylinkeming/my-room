import React, {useRef,useState,useEffect,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,ContactShadows,Html} from '@react-three/drei';
import * as THREE from 'three';
import House from './House.jsx';
import Garden from './Garden.jsx';
import BearResident from './BearResident.jsx';
import HomeHub from './HomeHub.jsx';
import './style.css';

const views={
 all:{position:[23,26,38],target:[0,0,3]},
 house:{position:[13,17,24],target:[0,.7,0]},
 bedroom:{position:[-5,14,18],target:[-4.2,.7,0]},
 living:{position:[14,15,20],target:[4,.7,0]},
 garden:{position:[23,17,30],target:[8,0,10]},
 resident:{position:[4.5,6.8,9.4],target:[2,.8,3.4]},
 terrace:{position:[20,10,16],target:[10.5,1,4]},
};
function bearCameraOffset(x){return Math.abs(x)<1?new THREE.Vector3(5.5,5.2,1.6):new THREE.Vector3(x<0?-5.5:5.5,5.8,1.4)}
function CameraRig({view,reset,bearRef}){
 const controls=useRef(),moving=useRef(true),following=useRef(false),{camera,invalidate}=useThree();
 const destination=useRef(new THREE.Vector3());
 useEffect(()=>{
  following.current=view==='resident';
  destination.current.set(...views[view].position);
  if(view==='resident'&&bearRef.current)destination.current.copy(bearRef.current.position).add(bearCameraOffset(bearRef.current.position.x).multiplyScalar(innerWidth<560?1.2:1));
  if(innerWidth<560&&view!=='resident')destination.current.multiplyScalar(view==='garden'?1.4:1.6);
  controls.current?.target.set(...views[view].target);if(view==='resident'&&bearRef.current)controls.current?.target.copy(bearRef.current.position).add(new THREE.Vector3(0,.8,0));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(destination.current);moving.current=false;controls.current?.update()}
  else moving.current=true;
  invalidate();
 },[view,reset,camera,invalidate]);
 useFrame((_,dt)=>{if(view==='resident'&&following.current&&bearRef.current){const p=bearRef.current.position;destination.current.copy(p).add(bearCameraOffset(p.x).multiplyScalar(innerWidth<560?1.2:1));controls.current?.target.lerp(p.clone().add(new THREE.Vector3(0,.8,0)),1-Math.exp(-dt*5));camera.position.lerp(destination.current,1-Math.exp(-dt*4));return}if(!moving.current)return;camera.position.lerp(destination.current,1-Math.exp(-Math.min(dt,.15)*4));if(camera.position.distanceTo(destination.current)<.04){camera.position.copy(destination.current);moving.current=false}invalidate()});
 return <OrbitControls ref={controls} makeDefault minDistance={6} maxDistance={125} maxPolarAngle={Math.PI/2.08} onStart={()=>{moving.current=false;following.current=false}} enablePan={false}/>;
}
function App(){
 const labelPortal=useRef(),bearRef=useRef();
 const [walking,setWalking]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [greeting,setGreeting]=useState(0),[bearStatus,setBearStatus]=useState('在客廳休息');
 const greet=()=>setGreeting(n=>n+1);
 const [view,setView]=useState('house'),[night,setNight]=useState(false),[labels,setLabels]=useState(false),[reset,setReset]=useState(0);
 const [doorOpen,setDoorOpen]=useState(true),[fireOn,setFireOn]=useState(true);
 const navigate=id=>{setView(id);setReset(n=>n+1)};
 const enterGarden=()=>{setDoorOpen(true);navigate('garden')};
 return <main className={night?'app night':'app'}>
 <header><a className="brand" href="." aria-label="日日小屋首頁"><span className="brand-icon">⌂</span><span>日日小屋<small>LITTLE WARM HOME</small></span></a><span className="header-note">把日子，過成喜歡的樣子。</span><button className="round-button" onClick={()=>setNight(v=>!v)} title="切換日夜">{night?'☾':'☀'}</button></header>
 <HomeHub/>
 <section className="intro"><div className="eyebrow"><i/> A LITTLE COTTAGE TO CALL HOME</div><h1>住進一點<span>溫柔。</span></h1><p>石牆、花香，還有等你回家的燈。<br/>一座鄉村小屋，一方玫瑰花園。</p><div className="scene-tag"><span>✳</span> 石牆陶瓦 <b>·</b> 玫瑰花園 <b>·</b> 暖光壁爐</div></section>
 <div className="scene" ref={labelPortal}><Suspense fallback={<div className="loading">正在為小屋點亮燈光…</div>}>
 <Canvas frameloop="demand" shadows camera={{position:[13,17,24],fov:36,far:160}} dpr={[1,1.6]}>
 <color attach="background" args={[night?'#343b3b':'#f4eee5']}/>
 <hemisphereLight args={['#ffeed8','#8a9672',night?.18:.85]}/><ambientLight intensity={night?.45:.8}/>
 <directionalLight position={[-15,20,8]} intensity={night?.4:3.2} color={night?'#cbd8ee':'#fff1d5'} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-36} shadow-camera-right={36} shadow-camera-top={36} shadow-camera-bottom={-36} shadow-normalBias={.04}/>
 <Garden labelPortal={labelPortal} night={night} showLabels={labels}/>
 <House labelPortal={labelPortal} fireOn={fireOn} night={night} showLabels={labels} doorOpen={doorOpen} onDoorToggle={()=>setDoorOpen(v=>!v)}/>
 <Html portal={labelPortal} position={[9,1,4.8]} center distanceFactor={24} style={{display:(view==='living'||view==='garden'||view==='house'||view==='terrace')?'block':'none'}}><button className="garden-link" onClick={enterGarden}>走進花園 ↗</button></Html>
 <ContactShadows frames={1} position={[0,-.97,0]} opacity={.25} scale={76} blur={2.8} far={10}/>
 <BearResident ref={bearRef} walking={walking} greeting={greeting} onGreet={greet} onStatus={setBearStatus} labelPortal={labelPortal} focused={view==='resident'}/>
 <CameraRig view={view} reset={reset} bearRef={bearRef}/>
 </Canvas></Suspense></div>
 <aside className="view-tools">
 <button className={labels?'active':''} onClick={()=>setLabels(v=>!v)} title="顯示空間標籤" aria-pressed={labels}>⌗</button>
 <button className={doorOpen?'active':''} onClick={()=>setDoorOpen(v=>!v)} title="客廳庭園門" aria-label={doorOpen?'關閉客廳庭園門':'打開客廳庭園門'} aria-pressed={doorOpen}>扉</button>
 <button className={fireOn?'active':''} onClick={()=>setFireOn(v=>!v)} title="壁爐火光" aria-label={fireOn?'熄滅壁爐':'點亮壁爐'} aria-pressed={fireOn}>♨</button>
 <button onClick={()=>navigate('all')} title="重設視角">↺</button>
 </aside>
 <aside className="resident-card" aria-label="熊熊居民"><div className="resident-heading"><span className="resident-dot"/><strong>熊熊</strong><span className="resident-caption">小屋的新居民</span></div><p role="status" aria-live="polite">{bearStatus}</p><div className="resident-actions"><button aria-pressed={view==='resident'} onClick={()=>navigate('resident')}>看看熊熊</button><button onClick={greet}>打招呼 ♡</button><button aria-pressed={walking} onClick={()=>setWalking(v=>!v)}>{walking?'休息一下':'開始散步'}</button></div></aside>
 <footer><div className="explore"><span className="section-label">EXPLORE YOUR HOME & GARDEN</span><nav aria-label="空間導覽">{[['all','全景','⌂'],['house','屋內','▱'],['bedroom','寢室','☾'],['living','客廳','♧'],['garden','花園','❋'],['terrace','露台','☕']].map(([id,name,icon])=><button key={id} className={view===id?'selected':''} aria-pressed={view===id} onClick={()=>navigate(id)}><span>{icon}</span>{name}{view===id&&<i/>}</button>)}</nav></div><div className="interaction-hint"><span>◉</span> 拖曳旋轉 · 滾輪縮放<small>MADE FOR YOUR QUIET MOMENTS</small></div></footer>
 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
