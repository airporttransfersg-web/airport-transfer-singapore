import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyFactBaseline,bodyDigest,baselineDigest} from './fact-baseline.mjs';
function fixture() {
  const url='https://example.com/';
  const mdx='---\napprovedForProduction: true\n---\nThe minimum is four hours.\nFour hours cost 400.';
  const result = {mdx,armed:true,providers:[{rank:1,name:'Example',home:url,pages:[url]}],facts:[{id:'minimum',rank:1,provider:'Example',type:'terms',url,snippet:'Bookings require four hours.',sentences:['The minimum is four hours.'],checkedAt:'2026-11-18',sourceSha256:'response-hash'}],evidence:{[url]:{text:'Bookings require four hours.',blocks:[],checkedAt:'2026-11-18',sha256:'response-hash'}},audit:{complete:true,bodySha256:bodyDigest(mdx),unresolved:[]}};
  result.audit.baselineSha256=baselineDigest(result);return result;
}
test('arming requires complete review of the exact body; metadata-only changes preserve review',()=>{
 const a=fixture();assert.equal(verifyFactBaseline(a),1);
 a.mdx=a.mdx.replace('approvedForProduction: true','approvedForProduction: false');assert.equal(verifyFactBaseline(a),1);
 a.mdx+='\nNew factual statement.';assert.throws(()=>verifyFactBaseline(a),/exact article body/);
 const b=fixture();b.audit.complete=false;assert.throws(()=>verifyFactBaseline(b),/complete|Complete/);
 b.armed=false;assert.equal(verifyFactBaseline(b),1);
 const c=fixture();c.facts[0].value='Changed audited baseline';assert.throws(()=>verifyFactBaseline(c),/exact article body/);
});
test('a plausible paraphrase or orphaned claim cannot pass as verbatim evidence',()=>{
 const a=fixture();a.facts[0].snippet='A four-hour minimum applies.';assert.throws(()=>verifyFactBaseline(a),/not verbatim/);
 const b=fixture();b.facts[0].sentences=['A statement not in this post.'];assert.throws(()=>verifyFactBaseline(b),/carriers/);
});
test('negative claims are checked against the full cited scope, even when the old positive excerpt remains',()=>{
 const a=fixture();Object.assign(a.facts[0],{type:'absence',absencePattern:'GST',absenceScopeUrls:['https://example.com/'],alwaysReviewOnSourceChange:true});
 a.audit.baselineSha256=baselineDigest(a);assert.equal(verifyFactBaseline(a),1);a.evidence['https://example.com/'].text+=' GST is now included.';assert.throws(()=>verifyFactBaseline(a),/Absence contradicted/);
});
test('owner rates require the card by domain, regardless of list position; no MSD monetary rate is allowed',()=>{
 const a=fixture(),url='https://blackcarservicesingapore.com/';a.evidence[url]=a.evidence['https://example.com/'];a.providers[0].pages=[url];a.providers[0].home=url;Object.assign(a.facts[0],{type:'price',url});assert.throws(()=>verifyFactBaseline(a),/card authority/);
 const b=fixture(),msd='https://mysingaporedriver.com/';b.evidence[msd]=b.evidence['https://example.com/'];b.providers[0].pages=[msd];b.providers[0].home=msd;Object.assign(b.facts[0],{type:'price',url:msd});assert.throws(()=>verifyFactBaseline(b),/MSD rates/);
});
test('wrong arithmetic and dependency cycles cannot be signed off',()=>{
 const a=fixture();a.facts[0].calculation={operator:'multiply',inputs:[4,100],result:500};assert.throws(()=>verifyFactBaseline(a),/arithmetic/);
 const b=fixture();b.facts.push({...b.facts[0],id:'second',dependencies:['minimum']});b.facts[0].dependencies=['second'];assert.throws(()=>verifyFactBaseline(b),/circular/);
});
test('excerpt caches cannot turn missing full-page checks into an absence claim',()=>{
 const a=fixture(),url='https://example.com/';Object.assign(a.facts[0],{type:'absence',absencePattern:'GST',absenceScopeUrls:[url],alwaysReviewOnSourceChange:true});Object.assign(a.evidence[url],{mode:'verified-primary-excerpts',fullTextSha256:'full-page-hash',fullTextLength:1000,absenceScans:[]});
 assert.throws(()=>verifyFactBaseline(a),/full-page verification/);
 a.evidence[url].absenceScans.push({pattern:'GST',matched:false,scope:'complete-visible-primary-page'});a.audit.baselineSha256=baselineDigest(a);assert.equal(verifyFactBaseline(a),1);
 a.evidence[url].absenceScans[0].matched=true;assert.throws(()=>verifyFactBaseline(a),/full-page verification/);
});
