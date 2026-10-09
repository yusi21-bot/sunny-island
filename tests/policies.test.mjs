import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {roomId,checkState}=require('../cloudfunctions/islandState/policy.js');
const {validateInput,validateAnalysis}=require('../cloudfunctions/analyzeMeal/policy.js');
test('different room tokens never share the same document identifier',()=>{
 assert.notEqual(roomId('a'.repeat(64)),roomId('b'.repeat(64)));
 assert.throws(()=>roomId('main'));assert.throws(()=>roomId('../family'));
});
test('reject oversized or malformed state before database write',()=>{
 assert.throws(()=>checkState({}));
 const state={currentUser:'brother',statuses:[],tasks:[],schedule:[],messages:[],activity:[],habits:{},island:{}};
 assert.equal(checkState(state),state);
 assert.throws(()=>checkState({...state,messages:[{image:'x'.repeat(900000)}]}));
});
test('meal input rejects arbitrary remote URLs and empty submissions',()=>{
 assert.throws(()=>validateInput({}));assert.throws(()=>validateInput({imageDataUrl:'https://example.com/picture.jpg'}));
 assert.deepEqual(validateInput({description:' 米饭和青菜 '}),{description:'米饭和青菜',imageDataUrl:undefined});
});
test('incomplete model responses fail before reaching UI',()=>{
 assert.throws(()=>validateAnalysis({dishes:['米饭']}));
 assert.throws(()=>validateAnalysis({dishes:[],strengths:[],cautions:[],nutrition:[{name:'蔬菜',level:'很健康',note:''}],suggestion:'',familyNote:''}));
 const result=validateAnalysis({dishes:['青菜'],strengths:[],cautions:['份量未知'],nutrition:[],suggestion:'搭配主食',familyNote:'今天有蔬菜'});
 assert.equal(result.estimatedCalories,'无法可靠估算');
});
