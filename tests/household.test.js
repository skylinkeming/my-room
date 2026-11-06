import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,makeId,operation,applyOperation,records,mergeRemote,acknowledge,decodeState,chooseMeal,todayKey,mergeLocal} from '../src/householdStore.js';
import {normalizeConnection,encodeInvite,decodeInvite,cloudApply} from '../src/householdCloud.js';
test('local changes survive serialization, and deletions cannot be undone by old edits',()=>{
 let s=createState({seed:false}),id=makeId();s=applyOperation(s,operation('tasks',id,{title:'買牛奶',category:'購物',done:false}));s=decodeState(JSON.stringify(s));assert.equal(records(s,'tasks')[0].title,'買牛奶');
 s=applyOperation(s,operation('tasks',id,{},true));s=applyOperation(s,operation('tasks',id,{done:true}));assert.equal(records(s,'tasks').length,0);
});
test('remote acknowledgements preserve edits queued while sending and combine read receipts',()=>{
 let s=createState({seed:false}),id=makeId(),a=makeId(),b=makeId();const first=operation('messages',id,{text:'你好',readBy:{[a]:true}});s=applyOperation(s,first);s=applyOperation(s,operation('messages',id,{text:'晚安'}));
 s=acknowledge(s,first.operationId,{collection:'messages',id,value:{text:'你好',readBy:{[a]:true,[b]:true}},revision:1});assert.equal(records(s,'messages')[0].text,'晚安');assert.equal(Object.keys(records(s,'messages')[0].readBy).length,2);assert.equal(s.pending.length,1);
 s=mergeRemote(s,[{collection:'messages',id,value:{text:'舊的'},revision:0}]);assert.equal(records(s,'messages')[0].text,'晚安');
});
test('two tabs merge independent additions without losing either',()=>{const a=createState({seed:false}),b=decodeState(JSON.stringify(a));const x=applyOperation(a,operation('tasks',makeId(),{title:'買菜'})),y=applyOperation(b,operation('tasks',makeId(),{title:'澆花'}));assert.equal(records(mergeLocal(x,y),'tasks').length,2)});
test('meal draw avoids immediate repetition and handles empty/single lists, dates use Taiwan time',()=>{const meals=records(createState(),'meals');assert.notEqual(chooseMeal(meals,meals[0].id,()=>0).id,meals[0].id);assert.equal(chooseMeal([],null),null);assert.equal(chooseMeal([meals[0]],meals[0].id).id,meals[0].id);assert.equal(todayKey(new Date('2026-11-06T18:00:00Z')),'2026-11-07')});
test('invites round trip; private keys and non-HTTPS URLs are refused',()=>{const c={url:'https://example.supabase.co',key:'sb_publishable_test',token:'a'.repeat(64)};assert.deepEqual(decodeInvite(encodeInvite(c)),c);assert.throws(()=>normalizeConnection({...c,key:'sb_secret_private'}));assert.throws(()=>normalizeConnection({...c,url:'http://example.com'}));assert.throws(()=>decodeInvite('broken'))});
test('cloud operation sends public key and idempotency ID; network errors are recoverable',async()=>{const original=globalThis.fetch;const op=operation('tasks',makeId(),{title:'test'});try{globalThis.fetch=async(url,init)=>{assert.match(url,/little_home_apply$/);assert.equal(init.headers.apikey,'sb_publishable_test');assert.equal(JSON.parse(init.body).p_operation,op.operationId);return{ok:true,json:async()=>({revision:3})}};assert.equal((await cloudApply({url:'https://example.com',key:'sb_publishable_test',token:'a'.repeat(64)},op)).revision,3);globalThis.fetch=async()=>{throw new TypeError('offline')};await assert.rejects(()=>cloudApply({url:'https://example.com'},op),/無法連線/)}finally{globalThis.fetch=original}});
