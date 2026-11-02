const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const Module=require('node:module');const ts=require('typescript');
function load(file,overrides={}){const filename=path.join(__dirname,'..',file);const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));const req=m.require.bind(m);m.require=id=>id in overrides?overrides[id]:req(id);m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);return m.exports;}
const json={'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}}};
test('/myid reports only the private sender ID and never changes moderation rights',async()=>{
 const sent=[];let decisions=0;
 const a=load('app/api/telegram/reviews/route.ts',{...json,'@/lib/review-store':{moderateReview:async()=>{decisions++;}},'@/lib/review-moderation':{validWebhookSecret:()=>true,telegramCall:async(method,body)=>sent.push({method,body})}});
 const req=type=>new Request('https://example.test/api/telegram/reviews',{method:'POST',body:JSON.stringify({message:{text:'/myid',from:{id:123},chat:{type,id:123}}})});
 assert.equal((await a.POST(req('private'))).status,200);assert.equal(sent.length,1);assert.match(sent[0].body.text,/123/);assert.equal(decisions,0);
 await a.POST(req('group'));assert.equal(sent.length,1);
});
test('only the configured numeric owner can moderate; missing secrets fail closed',()=>{
 const old=process.env.TELEGRAM_REVIEW_OWNER_ID, secret=process.env.TELEGRAM_REVIEW_WEBHOOK_SECRET;
 try{process.env.TELEGRAM_REVIEW_OWNER_ID='123';process.env.TELEGRAM_REVIEW_WEBHOOK_SECRET='test-secret';const a=load('lib/review-moderation.ts');assert.equal(a.isReviewOwner(123),true);assert.equal(a.isReviewOwner(124),false);assert.equal(a.isReviewOwner(undefined),false);assert.equal(a.validWebhookSecret('test-secret'),true);assert.equal(a.validWebhookSecret('wrong'),false);delete process.env.TELEGRAM_REVIEW_WEBHOOK_SECRET;assert.equal(a.validWebhookSecret(''),false);assert.equal(a.parseReviewAction('publish:anything'),null);assert.equal(a.parseReviewAction('review:publish:11111111-1111-4111-8111-111111111111').status,'published');}
 finally{for(const [k,v] of [['TELEGRAM_REVIEW_OWNER_ID',old],['TELEGRAM_REVIEW_WEBHOOK_SECRET',secret]])if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
test('unauthenticated webhook and another Telegram user never write a decision',async()=>{
 let writes=0;const a=load('app/api/telegram/reviews/route.ts',{...json,'@/lib/review-store':{moderateReview:async()=>{writes++;}},'@/lib/review-moderation':{validWebhookSecret:s=>s==='secret',isReviewOwner:id=>id===123,parseReviewAction:()=>({id:'test',status:'published'}),telegramCall:async()=>{}}});
 const req=(secret,id)=>new Request('https://example.test/api/telegram/reviews',{method:'POST',headers:{'x-telegram-bot-api-secret-token':secret},body:JSON.stringify({callback_query:{id:'q',from:{id},data:'review:publish:test'}})});
 assert.equal((await a.POST(req('bad',123))).status,403);assert.equal((await a.POST(req('secret',456))).status,200);assert.equal(writes,0);assert.equal((await a.POST(req('secret',123))).status,200);assert.equal(writes,1);
});
test('public reader excludes pending and rejected and strips audit fields',async()=>{
 const originalFetch=global.fetch;const u=process.env.UPSTASH_REDIS_REST_URL,t=process.env.UPSTASH_REDIS_REST_TOKEN;
 try{process.env.UPSTASH_REDIS_REST_URL='https://redis.example';process.env.UPSTASH_REDIS_REST_TOKEN='test';let call=0;global.fetch=async()=>Response.json({result:++call===1?['a','b','c']:[JSON.stringify({status:'pending',name:'private'}),JSON.stringify({status:'published',name:'Client',text:'Good',object:'Apartment',rating:5,moderatedBy:'secret'}),JSON.stringify({status:'rejected',name:'private'})]});const a=load('lib/review-store.ts');const r=await a.publishedReviews();assert.equal(r.length,1);assert.equal(r[0].name,'Client');assert.equal('moderatedBy' in r[0],false);}
 finally{global.fetch=originalFetch;for(const [k,v] of [['UPSTASH_REDIS_REST_URL',u],['UPSTASH_REDIS_REST_TOKEN',t]])if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
