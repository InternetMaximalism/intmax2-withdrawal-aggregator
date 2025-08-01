import { bool, cleanEnv, num, str } from "envalid";
import { version } from "../../../../package.json";

export const config = cleanEnv(process.env, {
  // app
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: num({ default: 3000 }),
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace"],
    default: "info",
  }),
  SERVICE_NAME: str({ default: "intmax2-withdrawal-aggregator" }),
  SERVICE_VERSION: str({ default: version }),
  // db
  EVENT_DATABASE_URL: str(),
  WITHDRAWAL_DATABASE_URL: str(),
  USE_DATABASE_SSL: bool({ default: false }),
  // db pool
  DB_POOL_MAX: num({ default: 5 }),
  DB_MAX_LIFETIME: num({ default: 3600 }),
  DB_MAX_USES: num({ default: 1000 }),
  DB_IDLE_TIMEOUT: num({ default: 60000 }),
  DB_KEEPALIVE_DELAY: num({ default: 30000 }),
  DB_CONNECTION_TIMEOUT: num({ default: 3000 }),
  DB_STATEMENT_TIMEOUT: num({ default: 10000 }),
  DB_QUERY_TIMEOUT: num({ default: 8000 }),
  DB_IDLE_IN_TRANSACTION_TIMEOUT: num({ default: 30000 }),
  // redis
  REDIS_URL: str(),
  REDIS_ENABLED: bool({ default: true }),
  // blockchain
  NETWORK_ENVIRONMENT: str({
    choices: ["mainnet", "sepolia"],
    default: "sepolia",
  }),
  ALCHEMY_API_KEY: str(),
  // contracts
  LIQUIDITY_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  LIQUIDITY_CONTRACT_DEPLOYED_BLOCK_NUMBER: num({ devDefault: 0 }),
  WITHDRAWAL_CONTRACT_ADDRESS: str({ devDefault: "0x" }),
  // private key
  INTMAX2_OWNER_MNEMONIC: str(),
  // zkp
  ZKP_PROVER_URL: str({ default: "http://localhost:3001" }),
  // queue
  QUEUE_CONCURRENCY: num({ default: 2 }),
  // group
  WITHDRAWAL_GROUP_SIZE: num({ default: 50 }),
  WITHDRAWAL_MIN_BATCH_SIZE: num({ default: 5 }),
  WITHDRAWAL_MIN_WAIT_MINUTES: num({ default: 5 }), // 5 minutes
  // scroll
  SCROLL_GAS_MULTIPLIER: num({ default: 2 }), // for l1 fee
});

export const isProduction = config.NODE_ENV === "production";
