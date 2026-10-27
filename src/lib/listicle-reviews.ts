import {getCollection,type CollectionEntry} from 'astro:content';
import {IS_PRODUCTION} from './env';
import {isListicleReleased,releaseNow} from './listicle-release.mjs';
export type ReviewEntry=CollectionEntry<'listicleReviews'>;
export const reviewTitle=(entry:ReviewEntry)=>entry.data.title.replace('{year}',String(entry.data.raceYear??entry.data.titleYear));
export async function localListicleReviews(){return (await getCollection('listicleReviews')).filter(({data})=>isListicleReleased(data,IS_PRODUCTION,releaseNow()));}
