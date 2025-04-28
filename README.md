# intmax2-withdrawal-aggregator

The withdrawal aggregator is responsible for consolidating withdrawals and managing requests to the ZKP (Zero-Knowledge Proof).

## Development

```sh
# install
yarn

# env
cp .env.example .env

# generate
yarn generate

# shared build
yarn build:shared

# collector
yarn workspace collector dev

# processor
yarn workspace processor dev

# watcher
yarn workspace watcher dev
```

## Migration

Note: Migration is handled within the Claim Aggregator. Please execute these commands inside the Claim Aggregator project.

```sh
# create db
docker exec -it intmax2-withdrawal-aggregator-postgres psql -U postgres -d maindb
CREATE DATABASE event;
CREATE DATABASE withdrawal;

# migration
yarn generate:event
yarn migrate:event
```

## Docker

```sh
# db, redis
docker compose -f ./docker-compose.yml up postgres redis -d

# redis
docker compose -f ./docker-compose.yml up redis -d

# postgres
docker compose -f ./docker-compose.yml up postgres -d

# all reset
docker compose down -v

# build and run
docker build -f docker/Dockerfile -t intmax2-withdrawal-aggregator .
docker run --rm -p 3000:3000 --env-file .env intmax2-withdrawal-aggregator workspace collector start
```
