import React, {useRef,useState,useEffect,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,ContactShadows,Html} from '@react-three/drei';
import * as THREE from 'three';
import House from './House.jsx';
import Garden from './Garden.jsx';
import './style.css';

const views={
 all:{position:[8,40,66],target:[0,0,6]},
 house:{position:[6,21,28],target:[0,.7,0]},
 bedroom:{position:[-5,14,18],target:[-4.2,.7,0]},
 living:{position:[14,15,20],target:[4,.7,0]},
 garden:{position:[33,22,40],target:[16,0,12]},
 sakura:{position:[-22,12,38],target:[-15.5,1.6,20]},
};
function CameraRig({view,reset}){
 const controls=useRef(),moving=useRef(true),{camera,invalidate}=useThree();
 const destination=useRef(new THREE.Vector3());
 useEffect(()=>{
  destination.current.set(...views[view].position);
  if(innerWidth<560)destination.current.multiplyScalar(view==='garden'?1.2:1.32);
  controls.current?.target.set(...views[view].target);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(destination.current);moving.current=false;controls.current?.update()}
  else moving.current=true;
  invalidate();
 },[view,reset,camera,invalidate]);
 useFrame((_,dt)=>{if(!moving.current)return;camera.position.lerp(destination.current,1-Math.exp(-Math.min(dt,.15)*4));if(camera.position.distanceTo(destination.current)<.04){camera.position.copy(destination.current);moving.current=false}invalidate()});
 return <OrbitControls ref={controls} makeDefault minDistance={6} maxDistance={125} maxPolarAngle={Math.PI/2.08} onStart={()=>{moving.current=false}} enablePan={false}/>;
}
function App(){
 const [mode,setMode]=useState('design');
 const [view,setView]=useState('all'),[night,setNight]=useState(false),[labels,setLabels]=useState(false),[reset,setReset]=useState(0);
 const [doorOpen,setDoorOpen]=useState(true),[flowing,setFlowing]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches);
 const navigate=id=>{setMode('three');setView(id);setReset(n=>n+1)};
 const enterGarden=()=>{setDoorOpen(true);navigate('garden')};
 return <main className={mode==='three'&&night?'app night':'app'}>
 <header><a className="brand" href="." aria-label="日日小屋首頁"><span className="brand-icon">⌂</span><span>日日小屋<small>LITTLE WARM HOME</small></span></a><span className="header-note">把日子，過成喜歡的樣子。</span><div className="view-mode" role="group" aria-label="呈現方式"><button className={mode==='design'?'selected':''} aria-pressed={mode==='design'} onClick={()=>setMode('design')}>設計稿</button><button className={mode==='three'?'selected':''} aria-pressed={mode==='three'} onClick={()=>setMode('three')}>3D 漫遊</button></div>{mode==='three'&&<button className="round-button" onClick={()=>setNight(v=>!v)} title="切換日夜">{night?'☾':'☀'}</button>}</header>
 <section className="intro"><div className="eyebrow"><i/> A LITTLE GARDEN TO SLOW DOWN</div><h1>住進一點<span>溫柔。</span></h1><p>推開一扇門，走進四季與流水。<br/>一座小屋，一方開闊櫻庭。</p><div className="scene-tag"><span>✳</span> 櫻花綠庭 <b>·</b> 小橋流水 <b>·</b> 木質暖居</div></section>
 {mode==='design'?<section className="design-scene" aria-label="櫻花庭園設計稿"><div className="design-board"><img src={`${import.meta.env.BASE_URL}design/sakura-garden.png`} alt="寬敞的日式庭園設計稿：左下兩棵櫻花樹，中央開闊草地，右側溪流木橋，客廳玻璃拉門連接木平台。"/><div className="design-caption">櫻庭 · 空間設計定稿<span>選擇下方空間，進入 3D 漫遊</span></div></div></section>:<div className="scene"><Suspense fallback={<div className="loading">正在為小屋點亮燈光…</div>}>
 <Canvas frameloop="demand" shadows camera={{position:[8,40,66],fov:36,far:220}} dpr={[1,1.6]}>
 <color attach="background" args={[night?'#343b3b':'#f4eee5']}/>
 <ambientLight intensity={night?.48:1.2}/>
 <directionalLight position={[-12,23,9]} intensity={night?.45:2.5} color={night?'#cbd8ee':'#fff1d5'} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-36} shadow-camera-right={36} shadow-camera-top={36} shadow-camera-bottom={-36} shadow-normalBias={.04}/>
 <Garden night={night} flowing={flowing} showLabels={labels}/>
 <House night={night} showLabels={labels} doorOpen={doorOpen} onDoorToggle={()=>setDoorOpen(v=>!v)}/>
 {(view==='living'||view==='garden'||view==='house')&&<Html position={[9,1,4.8]} center distanceFactor={24}><button className="garden-link" onClick={enterGarden}>走進庭園 ↗</button></Html>}
 <ContactShadows frames={1} position={[0,-.97,0]} opacity={.25} scale={76} blur={2.8} far={10}/>
 <CameraRig view={view} reset={reset}/>
 </Canvas></Suspense></div>}
 {mode==='three'&&<aside className="view-tools">
 <button className={labels?'active':''} onClick={()=>setLabels(v=>!v)} title="顯示空間標籤" aria-pressed={labels}>⌗</button>
 <button className={doorOpen?'active':''} onClick={()=>setDoorOpen(v=>!v)} title="客廳庭園門" aria-label={doorOpen?'關閉客廳庭園門':'打開客廳庭園門'} aria-pressed={doorOpen}>扉</button>
 <button className={flowing?'active':''} onClick={()=>setFlowing(v=>!v)} title="流水動畫" aria-label={flowing?'暫停流水動畫':'播放流水動畫'} aria-pressed={flowing}>≈</button>
 <button onClick={()=>navigate('all')} title="重設視角">↺</button>
 </aside>}
 {mode==='three'&&<div className="window-note"><span>↗</span><div>推門，便是庭園<small>沿著石徑，聽一段流水。</small></div></div>}
 <footer><div className="explore"><span className="section-label">EXPLORE YOUR HOME & GARDEN</span><nav aria-label="空間導覽">{[['all','全景','⌂'],['house','屋內','▱'],['bedroom','寢室','☾'],['living','客廳','♧'],['garden','庭園','❋'],['sakura','櫻花','✿']].map(([id,name,icon])=><button key={id} className={view===id?'selected':''} aria-pressed={view===id} onClick={()=>navigate(id)}><span>{icon}</span>{name}{view===id&&<i/>}</button>)}</nav></div><div className="interaction-hint"><span>◉</span> {mode==='design'?'切換 3D，探索每個角落':'拖曳旋轉 · 滾輪縮放'}<small>MADE FOR YOUR QUIET MOMENTS</small></div></footer>
 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
