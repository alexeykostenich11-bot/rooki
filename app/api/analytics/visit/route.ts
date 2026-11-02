import { NextResponse } from 'next/server';
import { sameOrigin,reviewAdmin } from '@/lib/review-admin';
import { recordVisit } from '@/lib/visit-stats';
export async function POST(request:Request){
  if(!sameOrigin(request))return new Response(null,{status:403});
  try{
    const raw=await request.text();if(raw.length>500)return new Response(null,{status:400});
    const {visitor,event,consent}=JSON.parse(raw);
    if(consent!==true||![visitor,event].every(x=>typeof x==='string'&&/^[a-f0-9-]{36}$/.test(x)))return new Response(null,{status:400});
    if(await reviewAdmin())return new Response(null,{status:204});
    await recordVisit(visitor,event);return new Response(null,{status:204});
  }catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
