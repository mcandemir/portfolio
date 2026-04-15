---
title: "SQL or NoSQL"
description: "Thoughts on the famous debate."
date: 2026-02-28
tags: ["SQL", "NoSQL", "Databases"]
---

The answer to this question is actually pretty boring: *it depends*. What are you building? What does the data actually look like? What are the relationships?

**Where SQL usually wins:**

- Relationships are obvious — users, orders, that stuff. JOINs exist for a reason.
- Half the team already writes SQL. Why make everyone learn something new?
- Money or state you can't screw up. ACID isn't just for textbooks.
- You're still figuring it out. Postgres has JSONB when you want to defer schema decisions a bit.

**Where NoSQL makes sense:**

- You're mostly appending — logs, metrics, whatever. Heavy relational reads would be overkill.
- You already know you'll need to scale out. Not "someday" — it's coming.
- Nested blobs you fetch by ID. Weird product catalogs, big configs, etc.
- Prototype mode and migrations every week would hurt. Fine — just remember that gets old once the prototype sticks around.

If you're starting something new and you're unsure, default to PostgreSQL. It's versatile, well-understood, and you can always shard or add read replicas later. Don't choose based on hype or what Twitter said.

The database is rarely the bottleneck.
