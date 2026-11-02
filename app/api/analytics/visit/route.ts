import { NextResponse } from 'next/server';
import { sameOrigin,reviewAdmin } from '@/lib/review-admin';
import { recordVisit } from '@/lib/visit-stats';
export async function POST(request:Request){
  if(!sameOrigin(request))return new Response(null,{status:403});
  try{
    const raw=await request.text();if(raw.length>500)return new Response(null,{status:400});
    const {event}=JSON.parse(raw);
    if(typeof event!=='string'||! /^[a-f0-9-]{36}$/.test(event))return new Response(null,{status:400});
    if(await reviewAdmin())return new Response(null,{status:204});
    await recordVisit(event);return new Response(null,{status:204});
  }catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
