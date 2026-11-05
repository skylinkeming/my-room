import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceResident,createResidentMotion} from '../src/residentMotion.js';

test('resident walks at a consistent speed at high and low frame rates',()=>{
 const fast=createResidentMotion(),slow=createResidentMotion();
 for(let i=0;i<600;i++)advanceResident(fast,1/60);
 for(let i=0;i<20;i++)advanceResident(slow,.5);
 assert.ok(Math.hypot(fast.x-slow.x,fast.z-slow.z)<.05);
 assert.ok(fast.x<0,'resident should have entered the bedroom');
});
test('resident repeatedly visits both rooms without invalid positions',()=>{
 const state=createResidentMotion();let crossings=0,last=state.x;
 for(let i=0;i<7000;i++){
  advanceResident(state,.05);
  assert.ok(Number.isFinite(state.x)&&Number.isFinite(state.z));
  if(last*state.x<0)crossings++;
  last=state.x;
 }
 assert.ok(crossings>=4,'route should continue back and forth');
});
test('returning from a suspended tab limits catch-up rather than teleporting',()=>{
 const state=createResidentMotion();state.wait=0;
 const start=[state.x,state.z];advanceResident(state,60);
 const distance=Math.hypot(state.x-start[0],state.z-start[1]);
 assert.ok(distance>0&&distance<.25);
});
test('invalid or nonpositive elapsed time leaves the resident unchanged',()=>{
 const state=createResidentMotion(),before={...state};
 for(const dt of [NaN,Infinity,-1,0])advanceResident(state,dt);
 assert.deepEqual(state,before);
});
