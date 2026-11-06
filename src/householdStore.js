export const STORE_KEY='little-warm-home.household.v1';
export const CONNECTION_KEY='little-warm-home.connection.v1';
export const BACKUP_KEY='little-warm-home.backups.v1';
export const COLLECTIONS=['messages','tasks','meals','history'];
const categories=['購物','家事','其他'],mealTypes=['外食','自己煮'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function makeId(){if(globalThis.crypto?.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const s=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return`${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`}
export function newToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('')}
export function validId(id){return typeof id==='string'&&uuid.test(id)}
const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
export function cleanPatch(collection,input){
 if(!COLLECTIONS.includes(collection)||!input||Array.isArray(input)||typeof input!=='object')throw Error('資料格式不正確');
 const out={};const fields={messages:{text:500,author:20,authorId:36,createdAt:40},tasks:{title:100,category:10,doneBy:20,createdAt:40},meals:{name:60,type:10,createdAt:40},history:{name:60,mealId:36,type:10,date:10,createdAt:40}}[collection];
 for(const [key,max]of Object.entries(fields))if(Object.hasOwn(input,key))out[key]=text(input[key],max);
 if(collection==='tasks'&&Object.hasOwn(input,'done'))out.done=input.done===true;
 if(collection==='meals'&&Object.hasOwn(input,'favorite'))out.favorite=input.favorite===true;
 if(collection==='messages'&&Object.hasOwn(input,'readBy')){out.readBy={};for(const [id,value]of Object.entries(input.readBy??{}))if(validId(id)&&value===true)out.readBy[id]=true}
 if(out.category&&!categories.includes(out.category))out.category='其他';
 if(out.type&&!mealTypes.includes(out.type))out.type='外食';
 return out;
}
export function operation(collection,id,patch={},deleted=false){if(!validId(id))throw Error('資料編號不正確');return{operationId:makeId(),collection,id,patch:cleanPatch(collection,patch),deleted:Boolean(deleted),at:new Date().toISOString()}}
function patchRow(previous,op){const patch=cleanPatch(op.collection,op.patch);return{id:op.id,value:{...(previous?.value??{}),...patch,...(op.collection==='messages'?{readBy:{...(previous?.value?.readBy??{}),...(patch.readBy??{})}}:{})},deleted:Boolean(previous?.deleted||op.deleted),revision:previous?.revision??0,modifiedAt:op.at}}
export function applyOperation(state,op,enqueue=true){if(!COLLECTIONS.includes(op.collection)||!validId(op.id)||!validId(op.operationId))throw Error('資料格式不正確');const records={...state.records,[op.collection]:{...state.records[op.collection],[op.id]:patchRow(state.records[op.collection][op.id],op)}};return{...state,records,pending:enqueue&&!state.pending.some(p=>p.operationId===op.operationId)?[...state.pending,op]:state.pending}}
export function createState({seed=true,profile}={}){
 let state={version:1,profile:profile??{id:makeId(),name:''},records:Object.fromEntries(COLLECTIONS.map(c=>[c,{}])),pending:[]};
 if(seed)[['牛肉麵','外食'],['咖哩飯','自己煮'],['水餃','自己煮'],['義大利麵','外食'],['火鍋','外食'],['便當','外食']].forEach(([name,type],i)=>{const id=`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`;state=applyOperation(state,{operationId:id,collection:'meals',id,patch:{name,type,favorite:false,createdAt:new Date(0).toISOString()},deleted:false,at:new Date(0).toISOString()},false)});
 return state;
}
export function records(state,collection){return Object.values(state.records[collection]??{}).filter(r=>!r.deleted).map(r=>({id:r.id,...r.value}))}
export function mergeRemote(state,rows){
 const next={...state,records:Object.fromEntries(COLLECTIONS.map(c=>[c,{...state.records[c]}]))};
 for(const row of rows??[]){if(!COLLECTIONS.includes(row.collection)||!validId(row.id))continue;const current=next.records[row.collection][row.id];const revision=Number(row.revision)||0;if(current&&revision<current.revision)continue;next.records[row.collection][row.id]={id:row.id,value:cleanPatch(row.collection,row.value??{}),deleted:row.deleted===true,revision,modifiedAt:row.modifiedAt??new Date().toISOString()}}
 let overlaid=next;for(const op of state.pending)overlaid=applyOperation(overlaid,op,false);return overlaid;
}
export function acknowledge(state,operationId,row){const clean={...state,pending:state.pending.filter(p=>p.operationId!==operationId)};return mergeRemote(clean,row?[row]:[])}
export function decodeState(raw){
 const source=typeof raw==='string'?JSON.parse(raw):raw;if(source?.version!==1||!source.records||!validId(source.profile?.id))throw Error('不支援這份資料格式');
 let result=createState({seed:false,profile:{id:source.profile.id,name:text(source.profile.name,20)}});
 for(const collection of COLLECTIONS)for(const row of Object.values(source.records[collection]??{})){if(!validId(row?.id))continue;result.records[collection][row.id]={id:row.id,value:cleanPatch(collection,row.value??{}),deleted:row.deleted===true,revision:Math.max(0,Number(row.revision)||0),modifiedAt:text(row.modifiedAt,40)}}
 for(const op of source.pending??[]){if(!validId(op?.id)||!validId(op?.operationId)||!COLLECTIONS.includes(op.collection))continue;result.pending.push({...op,patch:cleanPatch(op.collection,op.patch),deleted:op.deleted===true,at:text(op.at,40)})}
 return result;
}
export function mergeLocal(a,b){
 let next={...a,records:Object.fromEntries(COLLECTIONS.map(c=>[c,{...a.records[c]}])),pending:[...a.pending]};
 for(const c of COLLECTIONS)for(const row of Object.values(b.records[c])){const old=next.records[c][row.id];if(!old||row.deleted||row.revision>old.revision||(row.revision===old.revision&&row.modifiedAt>old.modifiedAt))next.records[c][row.id]=row}
 for(const op of b.pending)if(!next.pending.some(p=>p.operationId===op.operationId))next.pending.push(op);
 next.pending.sort((x,y)=>x.at.localeCompare(y.at));for(const op of next.pending)next=applyOperation(next,op,false);return next;
}
export function allRowsAsOperations(state){return COLLECTIONS.flatMap(collection=>Object.values(state.records[collection]).map(row=>operation(collection,row.id,row.value,row.deleted)))}
export function todayKey(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const p=Object.fromEntries(parts.map(p=>[p.type,p.value]));return`${p.year}-${p.month}-${p.day}`}
export function mealCandidates(meals,filter='全部'){return meals.filter(m=>filter==='全部'||(filter==='最愛'?m.favorite:m.type===filter))}
export function chooseMeal(meals,lastId,random=Math.random){if(!meals.length)return null;const candidates=meals.length>1?meals.filter(m=>m.id!==lastId):meals;return candidates[Math.min(candidates.length-1,Math.floor(Math.max(0,Math.min(.999999,random()))*candidates.length))]}
