// Waypoints use the open floor corridors, including the real bedroom doorway.
// Keep furniture scale/positions in House.jsx in sync when changing this route.
export const RESIDENT_RADIUS = .49;
export const RESIDENT_ROUTE = [
 [2,3.4],[.7,3.4],[-1.7,3.4],[-3.4,2.9],[-4.4,1.2],[-4.4,.15],
 [-4.4,1.2],[-3.4,2.9],[-1.7,3.4],[.7,3.4],[2,3.4],[3.7,3.5],
 [4.6,4.1],[5.2,4.1],[5,3.8],[4.4,3.5],[3.7,3.5],
];
export function createResidentMotion(){return{x:RESIDENT_ROUTE[0][0],z:RESIDENT_ROUTE[0][1],next:1,wait:1.3,heading:0,phase:0,moving:false}}
function stepResident(state,dt){
 if(state.wait>0){state.wait=Math.max(0,state.wait-dt);state.moving=false;return state}
 const [tx,tz]=RESIDENT_ROUTE[state.next],dx=tx-state.x,dz=tz-state.z,distance=Math.hypot(dx,dz),step=.48*dt;
 if(distance<=step){state.x=tx;state.z=tz;state.next=(state.next+1)%RESIDENT_ROUTE.length;state.wait=state.next===6?3.5:state.next===14?2.8:0;state.moving=false}
 else{state.x+=dx/distance*step;state.z+=dz/distance*step;state.heading=Math.atan2(dx,dz);state.phase+=dt*7;state.moving=true}
 return state;
}
export function residentLocation(x){return x<-.2?'寢室':x<.2?'房門旁':'客廳'}

// Integrate slower frames in small steps instead of slowing down the resident.
// Bound catch-up after a suspended tab so the resident never teleports.
export function advanceResident(state,elapsed){
 if(!Number.isFinite(elapsed))return state;
 let remaining=Math.max(0,Math.min(elapsed,.5));
 while(remaining>0){const dt=Math.min(remaining,1/30);stepResident(state,dt);remaining=Math.max(0,remaining-dt)}
 return state;
}
