CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY,
    shardId INTEGER,
    name TEXT,
    updatedAt TIMESTAMP
);