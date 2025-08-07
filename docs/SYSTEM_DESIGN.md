# INTMAX2 Withdrawal Aggregator - System Design

## 1. Overview

The INTMAX2 Withdrawal Aggregator is responsible for consolidating withdrawals and managing requests to the ZKP (Zero-Knowledge Proof). It comprises modular services for collecting withdrawal requests, processing them with ZKP proofs, watching blockchain events, and shared utilities.

### 1.1 Project Structure

```txt
packages/
├── collector/
│   ├── src/
│   │   └── service/
│   └── package.json
├── processor/
│   ├── src/
│   │   ├── lib/
│   │   └── service/
│   └── package.json
├── shared/
│   ├── src/
│   │   ├── abi/
│   │   ├── blockchain/
│   │   ├── config/
│   │   ├── db/
│   │   ├── lib/
│   │   ├── typechainTypes/
│   │   └── types/
│   └── package.json
└── watcher/
    ├── src/
    │   └── service/
    └── package.json
```

This mono-repo is organized under the `packages/` directory, with each package focusing on a distinct role:
- **collector**: gathers pending withdrawal processes and groups them.
- **processor**: generates ZKP proofs based on the grouped withdrawals and executes transactions on the contract.
- **watcher**: monitors events, specifically pending withdrawal processes, collects them, and updates their status accordingly.
- **shared**: common types, utilities, blockchain interfaces, and configuration shared across all packages.

## 2 High-Level Architecture

### 2.1 Withdrawal Aggregation Flow

```txt
  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │  Collector   │ ─────>│  Processor   │ ─────>│   Watcher    │
  └──────────────┘       └──────────────┘       └──────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
 Group Withdrawals       Generate ZKP &           Monitor Events
                         Execute Tx
         │                       │                       │
         ▼                       ▼                       ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                      Data Sources                           │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
    │  │ PostgreSQL  │  │    Redis    │  │   RPC Provider      │  │
    │  │  (Event &   │  │             │  │                     │  │
    │  │ Withdrawal) │  │             │  │                     │  │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘  │
    └─────────────────────────────────────────────────────────────┘
```

The withdrawal aggregation system processes withdrawal requests through three main stages:
1. **Collector** groups and organizes withdrawal requests
2. **Processor** generates ZKP proofs and executes blockchain transactions
3. **Watcher** monitors blockchain events for pending withdrawals

### 2.2 Collector Service

```txt
┌──────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Collector    │ ──>│ Group Pending   │ ──>│ Prepare for │
│              │    │ Withdrawals     │    │ Processing  │
└──────────────┘    └─────────────────┘    └─────────────┘
                           │                  │
                           ▼                  ▼
                     PostgreSQL           Job Queue
```

The Collector service gathers pending withdrawal processes from the database, groups them efficiently for batch processing, and prepares them for ZKP generation and blockchain execution.

### 2.3 Processor Service

```txt
┌──────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Processor    │ ──>│ Generate ZKP    │ ──>│ Execute Tx  │
└──────────────┘    └─────────────────┘    └─────────────┘
                           │                  │
                           ▼                  ▼
                     ZKP Generator        Blockchain
```

The Processor service takes grouped withdrawals, generates Zero-Knowledge Proofs for privacy and verification, and executes the corresponding transactions on the blockchain contract to complete the withdrawal process.

### 2.4 Watcher Service

```txt
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Watcher     │ ──>│ Monitor Events  │ ──>│ Update DB   │
└─────────────┘    └─────────────────┘    └─────────────┘
                          │                  │
                          ▼                  ▼
                     RPC Provider         PostgreSQL
```

The Watcher service runs continuously to monitor on-chain events for pending withdrawal processes. It fetches events from the RPC provider, parses and transforms them using shared utilities, and writes the structured records into PostgreSQL to maintain an up-to-date index.

## 3. Components

### 3.1 Watcher Service

- Monitors blockchain events for pending withdrawal processes
- Continuously scans for withdrawal-related events via RPC provider
- Updates PostgreSQL database with event data and withdrawal status changes
- Ensures all withdrawal requests are captured and tracked

### 3.2 Collector Service

- Gathers pending withdrawal processes from the database
- Groups withdrawals efficiently for batch processing
- Optimizes withdrawal aggregation to reduce gas costs and improve throughput
- Prepares withdrawal batches for ZKP generation

### 3.3 Processor Service

- Generates Zero-Knowledge Proofs for grouped withdrawals
- Executes transactions on the withdrawal contract
- Manages the final stage of withdrawal completion
- Handles proof verification and blockchain interaction

### 3.4 Shared Library

- `@intmax2-withdrawal-aggregator/shared` contains common constants, types, utilities
- Provides blockchain interfaces, ABI definitions, and database schemas
- Includes logging, configuration management, and utility functions
- Offers typechain types for contract interaction

### 3.5 Database & Persistence

- PostgreSQL with separate databases for events and withdrawals
- Redis for job queue management and caching
- Drizzle ORM for database schema management and migrations
- Structured event logging for audit trails

## 4. Data Flow

1. **Data Collection**: Detected events are parsed and stored in PostgreSQL event database
2. **Withdrawal Grouping**: Collector service groups pending withdrawals for efficient batch processing
3. **ZKP Generation**: Processor service generates Zero-Knowledge Proofs for withdrawal batches
4. **Transaction Execution**: Processor executes withdrawal transactions on the blockchain contract
5. **Event Monitoring**: Watcher service continuously monitors blockchain for withdrawal-related events
6. **Status Updates**: System updates withdrawal status throughout the process for tracking and monitoring

## 5. Scalability & Reliability

- **Stateless Services**: All services can scale horizontally with proper job queue management
- **Idempotent Operations**: Watcher, collector, and processor operations can be safely retried
- **Database Separation**: Event and withdrawal data are separated for optimized performance
- **Redis Queue**: Manages job distribution and prevents duplicate processing
- **Health Checks & Monitoring**: Services include health endpoints and structured logging
- **Zero-Knowledge Proofs**: Ensures privacy and verification of withdrawal batches

## 6. Security

- **Zero-Knowledge Proofs**: Withdrawal batches are processed with ZKP for privacy and verification
- **Contract Security**: Smart contract interactions are validated and secured
- **Database Access Control**: PostgreSQL access is restricted and properly configured
- **Environment Variables**: Sensitive configuration is managed through environment variables
- **Input Validation**: Strict validation for all withdrawal data and blockchain interactions

## 7. CI/CD & Testing

- **Vitest** unit and integration tests coverage for services and utilities
- **Tasks**: `yarn test`, `yarn check`, `yarn build` in CI pipeline.
- **Docker**: Containerized deployment with docker-compose for local development
- **Database Migrations**: Drizzle-based migrations for event and withdrawal databases

## 8. Observability

- **Structured Logging**: Centralized logs via `logger` utility from shared package
- **Error Notifications**: Critical failures automatically trigger alerts through cloud-based monitoring services.