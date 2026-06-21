import {
    bigint,
    index,
    integer,
    json,
    jsonb,
    pgTable,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
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

export const trendingVideoSnapshots = pgTable(
    "trending_video_snapshots",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        videoId: varchar("video_id", { length: 32 }).notNull(),
        regionCode: varchar("region_code", { length: 2 }).notNull(),
        categoryId: varchar("category_id", { length: 16 }).notNull(),
        title: varchar({ length: 500 }).notNull(),
        tagsJson: jsonb("tags_json").$type<string[]>().notNull(),
        viewCount: bigint("view_count", { mode: "number" }).notNull(),
        likeCount: bigint("like_count", { mode: "number" }).notNull(),
        commentCount: bigint("comment_count", { mode: "number" }).notNull(),
        publishedAt: timestamp("published_at", {
            withTimezone: true,
            mode: "date",
        }).notNull(),
        collectedAt: timestamp("collected_at", {
            withTimezone: true,
            mode: "date",
        }).notNull().defaultNow(),
    },
    (table) => ({
        lookupIndex: index("trending_snapshots_lookup_idx").on(
            table.regionCode,
            table.categoryId,
            table.videoId,
            table.collectedAt,
        ),
        retentionIndex: index("trending_snapshots_collected_at_idx").on(
            table.collectedAt,
        ),
    }),
)
