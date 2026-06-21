CREATE TABLE "trending_video_snapshots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trending_video_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"video_id" varchar(32) NOT NULL,
	"region_code" varchar(2) NOT NULL,
	"category_id" varchar(16) NOT NULL,
	"title" varchar(500) NOT NULL,
	"tags_json" jsonb NOT NULL,
	"view_count" bigint NOT NULL,
	"like_count" bigint NOT NULL,
	"comment_count" bigint NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "trending_snapshots_lookup_idx" ON "trending_video_snapshots" USING btree ("region_code","category_id","video_id","collected_at");--> statement-breakpoint
CREATE INDEX "trending_snapshots_collected_at_idx" ON "trending_video_snapshots" USING btree ("collected_at");
