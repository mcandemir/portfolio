---
title: "SQL or NoSQL"
description: "Thoughts on the famous debate."
date: 2026-02-28
tags: ["SQL", "NoSQL", "Databases"]
---

The answer this frequent question is actually pretty boring: *it depends*. Depends on; What are you building? What does the data actually look like? What are the relationships?

**Where SQL usually wins:**

- You've got clear relationships: users, orders, line items, that kind of thing. Normalized tables and JOINs exist for a reason.
- Your team already knows it. Onboarding is cheaper when half the squad has written SQL before.
- You care about consistency. ACID isn't just jargon — it's peace of mind when money or important state is involved.
- You're not sure yet. Schemas can evolve. PostgreSQL's JSONB gives you an escape hatch without going full document store.

**Where NoSQL makes sense:**

- You're writing a firehose of events (logs, metrics, user actions). Append-heavy, rarely queried — document or time-series stores handle this without sweating.
- You need to scale out horizontally from the start. Not "maybe someday" — you know the load is coming.
- The data is naturally nested and you're mostly keying by ID. Product catalogs with deep variants, config blobs, that sort of thing.
- You're prototyping fast and schema changes would slow you down. Just watch out — that flexibility can bite you when the prototype becomes the product.

If you're starting something new and you're unsure, default to PostgreSQL. It's versatile, well-understood, and you can always shard or add read replicas later. Don't choose based on hype or what Twitter said.

The database is rarely the bottleneck.
