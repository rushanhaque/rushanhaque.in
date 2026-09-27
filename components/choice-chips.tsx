'use client';
import { useId } from 'react';
import { RadioGroup,RadioGroupItem } from '@/components/ui/radio-group';
export function ChoiceChips({options,value,onChange,label}:{options:string[];value:string;onChange:(value:string)=>void;label:string}){const id=useId();return <RadioGroup aria-label={label} value={value} onValueChange={onChange} className="choice-chips">{options.map((option,i)=><label key={option} htmlFor={`${id}-${i}`} className={option===value?'selected':''}><RadioGroupItem id={`${id}-${i}`} value={option}/><span>{option}</span></label>)}</RadioGroup>;}
