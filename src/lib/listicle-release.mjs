// The override is a build-test clock only; approval remains mandatory in production.
export function releaseNow(){const value=process.env.LISTICLE_RELEASE_TEST_NOW;if(value&&!Number.isFinite(Date.parse(value)))throw Error('Invalid listicle test clock');return value?Date.parse(value):Date.now();}
export function isListicleReleased(data,production,now=Date.now()){if(!production)return true;const at=new Date(data.publishAt).getTime();return data.approvedForProduction===true&&Number.isFinite(at)&&at<=now;}
