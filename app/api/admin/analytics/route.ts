import { NextResponse } from 'next/server';
import { reviewAdmin } from '@/lib/review-admin';
import { visitStats } from '@/lib/visit-stats';
export async function GET(){try{if(!await reviewAdmin())return NextResponse.json({error:'unauthorized'},{status:401});return NextResponse.json(await visitStats(),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'unavailable'},{status:503});}}
