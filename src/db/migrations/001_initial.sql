CREATE TABLE IF NOT EXISTS networks (
  id SERIAL PRIMARY KEY,
  joinKey varchar(8) UNIQUE, -- NanoID
  masterGuildId BIGINT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
  id SERIAL PRIMARY KEY,
  guildId BIGINT UNIQUE NOT NULL,
  networkId int NOT NULL,
  CONSTRAINT fk_network_nodes
    FOREIGN KEY (networkId)
    REFERENCES networks(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    networkId int NOT NULL,
    name varchar(255),
    type varchar(255) NOT NULL,
    config JSONB,
    CONSTRAINT fk_network_policies
      FOREIGN KEY (networkId)
      REFERENCES networks(id)
      ON DELETE CASCADE
);
