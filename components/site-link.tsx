import type { ComponentPropsWithRef } from 'react';

// Native links keep navigation reliable across the Worker runtime and support
// progressive cross-document view transitions without speculative prefetching.
export default function SiteLink(props:ComponentPropsWithRef<'a'>){return <a {...props}/>;}
