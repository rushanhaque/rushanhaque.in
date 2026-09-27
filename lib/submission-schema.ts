import { z } from 'zod';
const base={id:z.string().uuid(),name:z.string().trim().min(2,'Please enter your name.').max(100),email:z.string().trim().email('Please enter a valid email.').max(254),company:z.string().trim().max(120).default(''),website:z.string().max(0,'Please leave this field blank.').optional(),consent:z.literal(true,{errorMap:()=>({message:'Please accept the privacy note.'})})};
export const submissionSchema=z.discriminatedUnion('kind',[
  z.object({...base,kind:z.literal('contact'),service:z.string().trim().min(1).max(100),budget:z.string().max(60),timeline:z.string().max(60),message:z.string().trim().min(20,'Tell me a little more (at least 20 characters).').max(5000)}),
  z.object({...base,kind:z.literal('call'),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.enum(['10:00','11:00','12:00','14:00','15:00','16:00','17:00']),timezone:z.literal('Asia/Kolkata'),message:z.string().trim().min(10,'Share a little context for our conversation.').max(3000)}),
  z.object({...base,kind:z.literal('review'),rating:z.number().int().min(1).max(5),message:z.string().trim().min(20,'Please write at least 20 characters.').max(3000),publishConsent:z.literal(true,{errorMap:()=>({message:'Please allow publication of your review.'})})}),
]);
export type Submission=z.infer<typeof submissionSchema>;
