import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects(){return [{source:'/work',destination:'/projects',permanent:true},{source:'/lab',destination:'/playground',permanent:true},{source:'/index.html',destination:'/',permanent:true},{source:'/contact.html',destination:'/contact',permanent:true},{source:'/about.html',destination:'/about',permanent:true}];}
};

export default nextConfig;
