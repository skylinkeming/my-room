import React,{useState} from 'react';
import {Html,useCursor} from '@react-three/drei';

// These props are part of the room: meshes handle touch/raycast clicks, while the
// small portal buttons provide keyboard access at the same physical location.
export function HouseholdObject({name,position,rotation=[0,0,0],kind,onOpen,labelPortal}){
 const [hover,setHover]=useState(false);useCursor(hover);
 const board=kind==='tasks',letter=kind==='letter',width=board?.8:letter?.5:.38,height=board?1:letter?.32:.48;
 const activate=e=>{e.stopPropagation();onOpen(board?'tasks':'messages')};
 const paper=(p,s,color)=> <mesh position={p}><boxGeometry args={s}/><meshStandardMaterial color={color} emissive="#f8d58e" emissiveIntensity={hover?.7:.22} roughness={.9}/></mesh>;
 return <group name={name} position={position} rotation={rotation} onClick={activate} onPointerOver={e=>{e.stopPropagation();setHover(true)}} onPointerOut={()=>setHover(false)}>
 {board&&paper([0,0,-.035],[width+.12,height+.12,.07],'#a47f54')}
 {paper([0,0,.012],[width,height,.025],board?'#eee0bb':letter?'#f6e8ce':'#e9d69b')}
 {letter?<><mesh position={[0,.035,.03]} rotation={[0,0,.52]}><boxGeometry args={[.25,.012,.008]}/><meshStandardMaterial color="#b69b72"/></mesh><mesh position={[0,.035,.032]} rotation={[0,0,-.52]}><boxGeometry args={[.25,.012,.008]}/><meshStandardMaterial color="#b69b72"/></mesh><mesh position={[0,-.02,.04]}><sphereGeometry args={[.035,12,8]}/><meshStandardMaterial color="#bb8977"/></mesh></>:<>{[0,1,2].map(i=><group key={i}>{board&&paper([-width*.32,height*.2-i*.19,.03],[.065,.065,.008],'#8e9b72')}{paper([board?.04:0,height*.2-i*(board?.19:.1),.03],[width*.6,.018,.008],'#9d9a76')}</group>)}{!board&&paper([0,height*.48,.04],[.09,.065,.03],'#a87967')}</>}
 <Html portal={labelPortal} position={[0,0,.075]} center distanceFactor={10}><button className="object-action" aria-label={board?'點擊玄關待辦板開啟共同清單':letter?'點擊書桌信件開啟留言板':'點擊冰箱便條開啟留言板'} title={board?'共同清單': '留言板'} onClick={activate} onFocus={()=>setHover(true)} onBlur={()=>setHover(false)}><span>{board?'✓':'✉'}</span></button></Html>
 </group>;
}
export function DiningAction({labelPortal,onOpen}){return <Html portal={labelPortal} position={[0,1.2,0]} center distanceFactor={12}><button className="object-action dining-action" aria-label="點擊餐桌開啟今天吃什麼" title="今天吃什麼" onClick={e=>{e.stopPropagation();onOpen('meals')}}>♨</button></Html>}
