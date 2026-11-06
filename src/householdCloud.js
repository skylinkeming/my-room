import {newToken} from './householdStore.js';
export function normalizeConnection(input){
 let url;try{url=new URL(input.url.trim())}catch{throw Error('請填入正確的 Supabase 專案網址')}
 if(url.protocol!=='https:')throw Error('專案網址必須使用 https');
 const key=String(input.key??'').trim();if(!key)throw Error('請填入公開金鑰');
 if(key.startsWith('sb_secret_'))throw Error('請使用公開 publishable／anon key，不能使用 secret 或 service_role key');
 if(!key.startsWith('sb_publishable_')){try{const part=key.split('.')[1];const payload=JSON.parse(atob(part.replace(/-/g,'+').replace(/_/g,'/')));if(payload.role!=='anon')throw Error()}catch{throw Error('請使用公開 publishable／anon key，不能使用 secret 或 service_role key')}}
 const token=String(input.token??'').trim();if(token&&!/^[a-f0-9]{64}$/.test(token))throw Error('邀請資料不完整');
 return{url:url.origin,key,token};
}
async function rpc(config,name,body){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const response=await fetch(`${config.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal,credentials:'omit'});if(!response.ok){if(response.status===401||response.status===403)throw Error('連線未獲允許，請檢查公開金鑰及資料庫設定');if(response.status===404)throw Error('找不到同步功能，請先執行設定說明中的 SQL');if(response.status===400)throw Error('邀請無效，或資料庫尚未完成設定');throw Error('同步暫時失敗，資料已留在這台裝置，稍後可重試')}return await response.json()}
 catch(error){if(error.name==='AbortError')throw Error('連線逾時，資料已留在這台裝置');if(error instanceof TypeError)throw Error('目前無法連線，請確認網路及專案網址');throw error}finally{clearTimeout(timer)}
}
export async function createCloudHome(input){const c=normalizeConnection({...input,token:newToken()});await rpc(c,'little_home_create',{p_token:c.token});return c}
export async function cloudSnapshot(config){const rows=await rpc(config,'little_home_snapshot',{p_token:config.token});if(!Array.isArray(rows))throw Error('同步回應格式不正確');return rows}
export function cloudApply(config,op){return rpc(config,'little_home_apply',{p_token:config.token,p_collection:op.collection,p_id:op.id,p_patch:op.patch,p_deleted:op.deleted,p_operation:op.operationId})}
export function encodeInvite(config){const c=normalizeConnection(config);if(!c.token)throw Error('尚未建立小屋');return btoa(JSON.stringify({v:1,...c})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
export function decodeInvite(input){let code=input.trim();try{if(code.includes('#'))code=new URLSearchParams(new URL(code).hash.slice(1)).get('home')??'';const data=JSON.parse(atob(code.replace(/-/g,'+').replace(/_/g,'/')));if(data.v!==1)throw Error();const c=normalizeConnection(data);if(!c.token)throw Error();return c}catch{throw Error('這份邀請無法讀取，請重新複製完整連結')}}
export function inviteLink(config){const url=new URL(import.meta.env.BASE_URL,location.origin);url.hash=`home=${encodeInvite(config)}`;return url.toString()}
