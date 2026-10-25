import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const familyArchive = sqliteTable('family_archive', {
  id: integer('id').primaryKey(),
  document: text('document').notNull(),
  revision: integer('revision').notNull().default(0),
  ownerId: text('owner_id').notNull(),
  updatedAt: text('updated_at').notNull(),
});
