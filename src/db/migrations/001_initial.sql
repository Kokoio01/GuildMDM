CREATE TABLE IF NOT EXISTS networks (
  id SERIAL PRIMARY KEY,
  name varchar(255),
  joinKey char(8) UNIQUE -- NanoID
);

CREATE TABLE IF NOT EXISTS nodes (
  id SERIAL PRIMARY KEY,
  type int NOT NULL, -- 0/node 1/master
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

CREATE TABLE IF NOT EXISTS joinRequests (
    id SERIAL PRIMARY KEY,
    networkId int NOT NULL,
    guildId BIGINT NOT NULL,
    status int NOT NULL, -- 0/pending 1/accepted 2/rejected
    message TEXT,
    CONSTRAINT fk_network_joinrequests
      FOREIGN KEY (networkId)
      REFERENCES networks(id)
      ON DELETE CASCADE
);
