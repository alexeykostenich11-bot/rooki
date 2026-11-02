import type { Metadata } from 'next';
import { ReviewsAdmin } from './reviews-admin';
export const metadata: Metadata = {title:'Отзывы · ROOKI',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function Page(){return <ReviewsAdmin/>;}
