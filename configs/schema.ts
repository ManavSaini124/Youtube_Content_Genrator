import { integer, json, pgTable, varchar } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
});

export const AiThumbnail = pgTable('thumbnails',{
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userInput: varchar(),
    thumbnailUrl: varchar(),
    refImage: varchar(),
    userEmail: varchar().references(() => usersTable.email, {onDelete: 'cascade', onUpdate: 'cascade'}),
    createdAt: varchar().notNull(),
})

export const AiContentTable = pgTable('contents',{
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userInput: varchar(),
    content: json(),
    thumbnailUrl: varchar(),
    userEmail: varchar().references(() => usersTable.email, {onDelete: 'cascade', onUpdate: 'cascade'}),
    createdAt: varchar().notNull(),
})