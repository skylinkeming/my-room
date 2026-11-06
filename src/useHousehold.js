import {useCallback,useEffect,useRef,useState} from 'react';
import {STORE_KEY,CONNECTION_KEY,BACKUP_KEY,createState,decodeState,mergeLocal,operation,applyOperation,acknowledge,mergeRemote,allRowsAsOperations} from './householdStore.js';
import {createCloudHome,cloudSnapshot,cloudApply,decodeInvite,normalizeConnection} from './householdCloud.js';
function readInitial(){try{const raw=localStorage.getItem(STORE_KEY);return{state:raw?decodeState(raw):createState(),warning:''}}catch{try{const raw=localStorage.getItem(STORE_KEY);if(raw)localStorage.setItem(STORE_KEY+'.unreadable',raw)}catch{}return{state:createState(),warning:'無法讀取先前資料；原始內容保留於本機 unreadable 備份，請檢查瀏覽器儲存設定'}}}
function readConnection(){try{const raw=JSON.parse(localStorage.getItem(CONNECTION_KEY));return raw?normalizeConnection(raw):null}catch{return null}}
export default function useHousehold(){
 const initial=useRef(null);if(!initial.current)initial.current=readInitial();
 const [state,setState]=useState(initial.current.state),stateRef=useRef(state),[connection,setConnection]=useState(readConnection),connectionRef=useRef(connection);
 const [sync,setSync]=useState({phase:connection?'pending':'local',error:'',lastSynced:null}),[storageWarning,setStorageWarning]=useState(initial.current.warning),[busy,setBusy]=useState(false),syncing=useRef(false),generation=useRef(0),syncRequest=useRef(()=>{});
 const commit=useCallback(updater=>{const next=typeof updater==='function'?updater(stateRef.current):updater;stateRef.current=next;setState(next);try{localStorage.setItem(STORE_KEY,JSON.stringify(next));setStorageWarning('')}catch{setStorageWarning('瀏覽器無法保存資料；目前變更只在這個頁面，請下載備份後再離開')}return next},[]);
 useEffect(()=>{if(!initial.current.warning)commit(s=>s)},[commit]);
 const change=useCallback((collection,id,patch,deleted=false)=>{commit(s=>applyOperation(s,operation(collection,id,patch,deleted)));if(connectionRef.current){setSync(s=>({...s,phase:'pending'}));queueMicrotask(()=>syncRequest.current())}},[commit]);
 const setName=useCallback(name=>commit(s=>({...s,profile:{...s.profile,name:name.trim().slice(0,20)}})),[commit]);
 const synchronize=useCallback(async()=>{
  const c=connectionRef.current;if(!c||syncing.current)return;syncing.current=true;const epoch=generation.current;setSync(s=>({...s,phase:'syncing',error:''}));
  try{while(stateRef.current.pending.length&&epoch===generation.current){const op=stateRef.current.pending[0],row=await cloudApply(c,op);if(epoch!==generation.current)return;commit(s=>acknowledge(s,op.operationId,row))}if(epoch!==generation.current)return;const rows=await cloudSnapshot(c);if(epoch!==generation.current)return;commit(s=>mergeRemote(s,rows));setSync({phase:stateRef.current.pending.length?'pending':'synced',error:'',lastSynced:new Date().toISOString()})}
  catch(error){if(epoch===generation.current)setSync(s=>({...s,phase:'error',error:error.message}))}
  finally{syncing.current=false}
 },[commit]);syncRequest.current=synchronize;
 useEffect(()=>{synchronize();const timer=setInterval(()=>{if(document.visibilityState==='visible')synchronize()},8000);const online=()=>synchronize();addEventListener('online',online);return()=>{clearInterval(timer);removeEventListener('online',online)}},[connection,synchronize]);
 useEffect(()=>{const handler=e=>{if(e.key===CONNECTION_KEY){location.reload();return}if(e.key===STORE_KEY&&e.newValue){try{const other=decodeState(e.newValue);stateRef.current=mergeLocal(stateRef.current,other);setState(stateRef.current)}catch{setStorageWarning('另一個頁面的資料格式無法讀取，這個頁面的資料仍保留')}}};addEventListener('storage',handler);return()=>removeEventListener('storage',handler)},[]);
 const backup=useCallback(()=>{try{const old=JSON.parse(localStorage.getItem(BACKUP_KEY)??'[]');localStorage.setItem(BACKUP_KEY,JSON.stringify([{at:new Date().toISOString(),state:stateRef.current},...old].slice(0,3)))}catch{throw Error('無法備份目前資料，請先下載備份後再加入小屋')}},[]);
 const connect=useCallback(async({url,key,invite})=>{
  if(syncing.current)throw Error('目前正在同步，請稍候再操作');setBusy(true);
  try{if(invite){const config=decodeInvite(invite),rows=await cloudSnapshot(config);backup();const next=mergeRemote(createState({seed:false,profile:stateRef.current.profile}),rows);generation.current++;localStorage.setItem(CONNECTION_KEY,JSON.stringify(config));connectionRef.current=config;commit(next);setConnection(config)}
   else{const config=await createCloudHome({url,key});backup();const next={...stateRef.current,pending:allRowsAsOperations(stateRef.current)};generation.current++;localStorage.setItem(CONNECTION_KEY,JSON.stringify(config));connectionRef.current=config;commit(next);setConnection(config)}
   history.replaceState(null,'',location.pathname+location.search);setSync({phase:'pending',error:'',lastSynced:null})
  }finally{setBusy(false)}
 },[backup,commit]);
 const disconnect=useCallback(()=>{generation.current++;connectionRef.current=null;setConnection(null);localStorage.removeItem(CONNECTION_KEY);setSync({phase:'local',error:'',lastSynced:null})},[]);
 const restoreBackup=useCallback(index=>{if(connectionRef.current)throw Error('請先中斷同步，再還原本機備份');const saved=JSON.parse(localStorage.getItem(BACKUP_KEY)??'[]')[index];if(!saved)throw Error('找不到這份備份');backup();commit(decodeState(saved.state))},[backup,commit]);
 return{state,change,setName,connection,sync,storageWarning,busy,connect,disconnect,synchronize,restoreBackup};
}
