'use client';
import { createContext, useContext } from 'react';
import type { z } from 'zod';
import type { projectsSchema, editorialSchema } from '@/lib/content-schema';
export type PortfolioContent = z.infer<typeof editorialSchema> & { projects: z.infer<typeof projectsSchema> };
const ContentContext = createContext<PortfolioContent | null>(null);
export function ContentProvider({ value, children }: { value: PortfolioContent; children: React.ReactNode }) { return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>; }
export function useContent() { const value=useContext(ContentContext);if(!value)throw Error('ContentProvider is required');return value; }
