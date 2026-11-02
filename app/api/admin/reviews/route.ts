import { NextResponse } from 'next/server';
import { reviewAdmin, sameOrigin } from '@/lib/review-admin';
import { allReviews, moderateReview } from '@/lib/review-store';
export async function GET(){
  try{if(!await reviewAdmin())return NextResponse.json({error:'unauthorized'},{status:401});return NextResponse.json({reviews:await allReviews()},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'forbidden'},{status:403});
  try{
    const actor=await reviewAdmin();if(!actor)return NextResponse.json({error:'unauthorized'},{status:401});
    const raw=await request.text();if(raw.length>1000)return NextResponse.json({error:'invalid'},{status:400});
    const {id,status}=JSON.parse(raw);
    if(typeof id!=='string'||! /^[a-f0-9-]{36}$/.test(id)||!['published','rejected'].includes(status))return NextResponse.json({error:'invalid'},{status:400});
    const result=await moderateReview(id,status,actor,true);
    return NextResponse.json({status:result},{status:result==='missing'?404:200});
  }catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
