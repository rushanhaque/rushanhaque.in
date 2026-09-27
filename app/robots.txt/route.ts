// Private review deployment. Change only alongside an intentional public launch.
export function GET(){return new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
