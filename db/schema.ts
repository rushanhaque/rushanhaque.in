import { sqliteTable,text,integer,index } from 'drizzle-orm/sqlite-core';
export const submissions=sqliteTable('submissions',{
  id:text('id').primaryKey(),
  kind:text('kind',{enum:['contact','call','review']}).notNull(),
  name:text('name').notNull(),email:text('email').notNull(),
  payload:text('payload').notNull(),
  status:text('status').notNull().default('pending'),
  createdAt:integer('created_at').notNull(),
},table=>[index('idx_submissions_status_created').on(table.status,table.createdAt)]);
export const submissionLimits=sqliteTable('submission_limits',{
  key:text('key').primaryKey(),count:integer('count').notNull().default(0),expiresAt:integer('expires_at').notNull(),
},table=>[index('idx_submission_limits_expiry').on(table.expiresAt)]);
export const contentDrafts=sqliteTable('content_drafts',{
  key:text('key').primaryKey(),body:text('body').notNull(),baseSha:text('base_sha').notNull().default(''),revision:integer('revision').notNull().default(1),updatedAt:integer('updated_at').notNull(),
});
export const contentPublications=sqliteTable('content_publications',{
 key:text('key').primaryKey(),body:text('body').notNull(),previousBody:text('previous_body').notNull(),revision:integer('revision').notNull().default(1),updatedAt:integer('updated_at').notNull(),
});
export const eventCounts=sqliteTable('event_counts',{
 key:text('key').primaryKey(),day:text('day').notNull(),event:text('event').notNull(),path:text('path').notNull(),count:integer('count').notNull().default(0),
},table=>[index('idx_event_counts_day').on(table.day)]);
