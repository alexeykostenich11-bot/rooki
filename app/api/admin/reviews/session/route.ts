import { NextResponse } from 'next/server';
import { adminCookie, exchangeAdminLink, logoutReviewAdmin, validAdminCsrf } from '@/lib/review-admin';
export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({error:'invalid'},{status:400});
  try {
    const raw=await request.text();
    if(raw.length>500)return NextResponse.json({error:'invalid'},{status:400});
    const {token}=JSON.parse(raw);
    if(typeof token!=='string')return NextResponse.json({error:'invalid'},{status:400});
    const session=await exchangeAdminLink(token);
    if(!session)return NextResponse.json({error:'expired'},{status:401});
    const response=NextResponse.json({ok:true});
    response.cookies.set(adminCookie,session,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:43200});
    response.headers.set('Cache-Control','no-store');return response;
  }catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
export async function DELETE(request: Request) {
  if(!await validAdminCsrf(request))return NextResponse.json({error:'forbidden'},{status:403});
  try{await logoutReviewAdmin();const response=NextResponse.json({ok:true});response.cookies.set(adminCookie,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});return response;}catch{return NextResponse.json({error:'unavailable'},{status:503});}
}
