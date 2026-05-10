# BookStore 2.0 — HLD + Concurrency + Schema + Tech Stack + APIs + OOSD + CQRS + Saga
> Project: Rebuild legacy Node.js Bookstore into Java 25 + Spring Boot (Maven). This document is an in-depth design & implementation plan used for development and future prompting.

---

## Table of Contents
1. Goals & Scope
2. High-Level Architecture (HLD)
3. Technology Stack
4. Data Model (Postgres) & OpenSearch Mapping
5. API Design (REST)
6. Concurrency & Threading Strategy
7. OOSD & Design Patterns (What to use where)
8. CQRS & Event Flow
9. Saga Orchestration (Order flow example)
10. Flow: Add Book → Persist to Postgres + OpenSearch (detailed)
11. Deployment & Runtime Considerations (minimal)
12. Appendix: Useful snippets & configuration pointers

---

## 1. Goals & Scope
- Re-implement a fully-featured Bookstore backend in **Java 25 + Spring Boot 3** using Maven.
- Learn and demonstrate **HLD, LLD, OOSD, concurrency, and distributed patterns** (Outbox, CQRS, Saga).
- Primary functional features: user management, book catalog (CRUD + search), cart, orders, inventory, multipart S3 uploads, HLS-like streaming (if media exists), and notifications.
- Persistence: PostgreSQL as the source of truth; OpenSearch for full-text search.
- Messaging: Kafka for event-driven flows; local task scheduling (Spring Scheduler) for periodic tasks.
- Exclude: Recommendation model, observability, and other non-functional concerns for now (explicitly ignored).

---

## 2. High-Level Architecture (HLD)
### Components
- **API Gateway / REST API** (Spring Boot Monolith or modular microservices)
  - Authentication & API endpoints (Users, Books, Cart, Orders)
- **Auth Service** (module) — JWT + refresh token + roles (stateless)
- **Book Service** (module) — CRUD, S3 presigned upload endpoints, indexing to OpenSearch
- **Cart Service** (module) — Redis-backed carts, concurrency-safe updates
- **Order Service** (module) — transactional order creation, payment simulation, saga orchestration
- **Inventory Service** (module) — maintains stock, triggers low-stock events
- **Search Service** (module) — OpenSearch index management and query APIs
- **Event Bus**: Kafka cluster (topics for domain events)
- **Outbox Publisher**: reads DB outbox table and publishes to Kafka reliably
- **Background Workers**: Spring @Async / ExecutorService or separate worker process for heavy tasks (image processing, indexing)
- **Object Storage**: S3-compatible (MinIO or AWS S3) for book cover images / media

### Deployment Model
- Initially a **modular monolith** (single Spring Boot app with modules). Option to split modules into microservices later.
- Dockerized components for local dev: Postgres, Redis, Kafka (Redpanda), MinIO, OpenSearch.

### Event Topics (Kafka)
- `book.created`, `book.updated`, `book.deleted`
- `order.created`, `order.updated`, `order.cancelled`
- `inventory.updated`, `inventory.low`
- `user.registered`

---

## 3. Technology Stack
- **Language & Runtime**: Java 25 (Loom features available), Maven build.
- **Frameworks**: Spring Boot 3 (Web, Data JPA, Security), Spring Kafka, Spring Cache, Spring Retry, Spring Scheduler.
- **DB**: PostgreSQL (primary), using R2DBC optional later; JPA/Hibernate with explicit SQL for critical paths.
- **Search**: OpenSearch (or Elasticsearch OSS) for indexing and search queries.
- **Cache / Brokers**: Redis (cache, session, Bloom filter store, distributed locks).
- **Messaging**: Kafka (Redpanda for local).
- **File Storage**: S3-compatible (MinIO for local).
- **Background jobs**: Spring @Async + ExecutorService / TaskExecutor; optionally Quartz if needed.
- **Security**: Spring Security, JWT + refresh tokens, token blacklist in Redis.
- **Utilities**: Tika or Apache Commons for file handling; Lombok optional; MapStruct for DTO mapping.

---

## 4. Data Model (Postgres) & OpenSearch Mapping
### Postgres schema (essential tables)
#### users
- id UUID (PK)
- email VARCHAR UNIQUE
- password_hash TEXT
- roles TEXT[]
- created_at timestamptz
- updated_at timestamptz
- is_active boolean

#### books
- id UUID (PK)
- isbn VARCHAR UNIQUE
- title TEXT
- description TEXT
- author VARCHAR
- publisher VARCHAR
- published_date DATE
- price numeric(10,2)
- stock int
- cover_s3_key TEXT
- created_at timestamptz
- updated_at timestamptz
- version int (for optimistic locking, alias `@Version`)

#### book_metadata (optional denormalization)
- book_id UUID FK
- key TEXT
- value JSONB

#### cart_items
- id UUID PK
- user_id UUID FK -> users
- book_id UUID FK -> books
- quantity int
- created_at timestamptz
- updated_at timestamptz
- unique(user_id, book_id)

#### orders
- id UUID PK
- user_id UUID FK
- total_amount numeric(12,2)
- status varchar (PENDING, PROCESSING, COMPLETED, CANCELLED)
- created_at timestamptz
- updated_at timestamptz
- idempotency_key VARCHAR UNIQUE (avoid double-checkout)

#### order_items
- id UUID PK
- order_id FK -> orders
- book_id FK -> books
- quantity int
- price numeric(10,2)

#### outbox_events (Outbox pattern)
- id UUID PK
- aggregate_type TEXT
- aggregate_id UUID
- event_type TEXT
- payload JSONB
- published boolean DEFAULT false
- attempts int DEFAULT 0
- created_at timestamptz
- published_at timestamptz NULLABLE

#### processed_messages (idempotency for consumers)
- message_id UUID PK
- topic TEXT
- processed_at timestamptz

#### inventory_events (historical, optional)
- id UUID PK
- book_id UUID
- change int
- reason TEXT
- created_at timestamptz

### OpenSearch index mapping (books_index)
- id: keyword
- title: text with english analyzer
- author: text
- description: text (with analyzer, highlight enabled)
- price: double
- published_date: date
- isbn: keyword
- cover_s3_key: keyword
- suggest: completion or ngram for autocomplete

---

## 5. API Design (REST) — Important endpoints & contracts
Use REST with JSON. Use DTOs for request/response models. Implement input validation via `@Valid` and `Validation` annotations.

### Auth
- `POST /api/v1/auth/register` `{email, password}` → 201 `{userId, email}` (creates user + writes `user.registered` to outbox)
- `POST /api/v1/auth/login` `{email, password}` → 200 `{accessToken, refreshToken}`
- `POST /api/v1/auth/refresh` `{refreshToken}` → 200 `{accessToken}`
- `POST /api/v1/auth/logout` `{refreshToken}` → 204 (blacklist token in Redis)

### Books
- `POST /api/v1/books` (ADMIN) → starts transaction: insert into `books`, write `outbox` event `book.created`; returns created book id. Accepts JSON plus optionally presigned upload flow.
  - Request: `{isbn, title, author, description, price, stock, ...}`
- `GET /api/v1/books/{id}` → 200 book DTO
- `PUT /api/v1/books/{id}` (ADMIN) → update book, outbox `book.updated`
- `DELETE /api/v1/books/{id}` (ADMIN) → delete book, outbox `book.deleted`
- `GET /api/v1/books` → list with pagination, filters, sort (DB read)
- `GET /api/v1/search` → query param `q`, `page`, `size` → hits from OpenSearch

### S3 Presigned multipart upload
- `POST /api/v1/books/{id}/upload/start` → returns presigned URLs and uploadId (for multipart)
- `POST /api/v1/books/{id}/upload/complete` → completes multipart upload and updates `cover_s3_key` for book (must be idempotent)

### Cart
- `POST /api/v1/cart/items` `{bookId, qty}` → add/update item (atomic update)
- `GET /api/v1/cart` → current cart items (reads Redis or DB fallback)
- `DELETE /api/v1/cart/items/{itemId}` → remove item
- `POST /api/v1/cart/checkout` `{idempotencyKey}` → create order (triggers CQRS / saga)

### Orders
- `GET /api/v1/orders/{id}` → order status & items
- `GET /api/v1/orders` → list user orders
- `POST /api/v1/orders/{id}/cancel` → cancel order (saga to revert stock)

### Admin & Inventory
- `GET /api/v1/admin/low-stock` → list books with stock <= threshold
- `POST /api/v1/admin/stock/adjust` `{bookId, delta, reason}` → adjusts stock and emits inventory events

---

## 6. Concurrency & Threading Strategy
We will use explicit threading where needed and rely on database locking and patterns for data safety.

### Thread Pools & Executors
- Configure beans: `TaskExecutor` (bounded ThreadPoolTaskExecutor) for `@Async` tasks. Example config: corePoolSize=10, maxPoolSize=50, queueCapacity=500. Tune per environment.
- For heavy I/O (S3 multipart assemble), use a separate `ioExecutor` with larger pool. For CPU-heavy tasks (image processing), use `cpuExecutor` limited to CPU count.

### Key Concurrency Patterns
#### 1. Optimistic Locking (primary)
- Use JPA `@Version` field on `books` to prevent lost updates for stock and book updates. On `OptimisticLockException`, retry a limited number of times with exponential backoff.

#### 2. Pessimistic Locking (when necessary)
- For critical sections like checkout stock decrement where concurrency is high, consider `SELECT ... FOR UPDATE` with short transactions to lock rows in Postgres.

#### 3. Distributed Locks (Redis)
- Use Redis `SETNX` with TTL for distributed locks (e.g., for cache rebuilds, or critical scheduler tasks). Use Redisson or Spring Redis support for lock abstraction.

#### 4. Idempotency & Deduplication
- Use `idempotency_key` on orders and check `orders` table uniqueness. For external retries, use dedupe via `processed_messages` or outbox.

#### 5. Bounded Queues / Backpressure
- Use bounded ExecutorService queues to avoid OOM; when queue is full, return HTTP 429 or accept and persist to DB for later async processing.

#### 6. Atomic DB operations for counters
- Use `UPDATE books SET stock = stock - :qty WHERE id = :id AND stock >= :qty` and check affected rows; fallback to pessimistic lock if necessary.

### Concurrency Examples
- **Add to Cart**: Use DB transaction for upsert on `cart_items` with unique constraint on `(user_id, book_id)` and optimistic retry on conflict.
- **Checkout**: Implement local transaction that:
  1. Validate stock via `SELECT stock FROM books WHERE id IN (...) FOR UPDATE` (pessimistic), or optimistic read and `UPDATE ... stock = stock - qty WHERE stock >= qty`.
  2. Create `orders` record with `PENDING`, write to `outbox` events within same transaction.
  3. Commit and let outbox publisher send `order.created` to Kafka.
- **Bulk Indexing**: Use `ExecutorService` + `CountDownLatch` and batch upserts to OpenSearch in parallel (bounded concurrency).

---

## 7. OOSD & Design Patterns — What to use where
This section maps concrete design patterns to modules and code constructs.

### 1. Repository Pattern
- Use Spring Data JPA Repositories for common CRUD. Provide custom repository implementations for performance-critical queries (native SQL).

### 2. Factory Pattern
- Use factories (e.g., `OrderFactory`, `BookFactory`) to handle complex object creation, especially with validations and defaulting.

### 3. Strategy Pattern
- Payment strategies or fulfillment strategies (`PaymentStrategy` interface with `CODPayment`, `CardPayment` implementations).

### 4. Template Method
- Base classes for controllers or services that share common steps. Example: `AbstractCrudService<T>` providing hooks for pre/post processing.

### 5. Observer Pattern / Event Listeners
- Use application events (Spring `ApplicationEventPublisher`) for intra-app events and Kafka for cross-service events. Inventory and notification modules subscribe to domain events.

### 6. Command & CommandHandler (CQRS friendly)
- Implement command objects (`CreateOrderCommand`) and handlers to decouple intent from execution. Use a `CommandBus` abstraction (in-process) that dispatches to handlers.

### 7. Unit of Work / Transaction Script
- Use `@Transactional` to demarcate transactions. For complex multi-step flows, use explicit Unit of Work pattern via domain services.

### 8. Saga Pattern
- See section 9 for orchestration and choreography options.

### 9. Decorator / Adapter
- Use adapters for external services: `S3Adapter`, `OpenSearchAdapter`, `KafkaAdapter` to abstract concrete implementations and enable testing.

---

## 8. CQRS & Event Flow
Adopt a hybrid CQRS model: simple CRUD reads served from Postgres; search reads served from OpenSearch. Write requests go to Postgres (command side) and publish events for eventual consistency.

### Write Path (Commands)
1. Client sends command (e.g., `CreateBookCommand` via `POST /books`).
2. Command handler persists to Postgres inside transaction.
3. Command handler writes an `outbox_event` row (same DB transaction).
4. Transaction commits; outbox publisher picks un-published events and publishes to Kafka.
5. Consumers (e.g., OpenSearch indexer) consume `book.created` and index into OpenSearch (read-side).

### Read Path (Queries)
- Query endpoints read from Postgres for authoritative data (small scale) and from OpenSearch for full-text search / autocomplete / fuzzy queries. Use caching in Redis for hot reads.

### Eventual Consistency
- Indexing into OpenSearch is asynchronous; clients should accept slight lag. Provide a `book.indexed` event and `book.index_status` in book row if needed to show index status.

---

## 9. Saga Orchestration (Order Flow Example)
Orders involve multiple steps that must be consistently applied: reserve stock, charge payment (simulated), and confirm order, or rollback if any step fails. Use Saga for distributed consistency.

### Two approaches: Orchestration vs Choreography
- **Orchestration**: A central Saga orchestrator service coordinates sub-transactions and compensations. Recommended for clarity and debugging.
- **Choreography**: Services react to events. Simpler but harder to reason at scale.

We will use **Orchestration** for the initial implementation.

### Steps in Order Saga (Orchestrator-based)
1. Client submits `checkout` with `idempotencyKey`. Create an `order` with status `PENDING` (DB transaction), write `outbox` event `order.created` with payload `{orderId, items, userId, idempotencyKey}`.
2. Outbox publisher sends `order.created`. Saga orchestrator consumes `order.created` (or is called directly) and begins workflow:
   - **Step 1: Reserve Stock** — call Inventory service (or run local DB updates): attempt to decrement stock using `UPDATE ... stock = stock - qty WHERE stock >= qty` for all items. If any fails, goto compensation.
   - **Step 2: Simulate Payment** — call payment adapter (or simulate) — on success continue; on failure goto compensation.
   - **Step 3: Confirm Order** — set order status `PROCESSING` → `COMPLETED`. Publish `order.confirmed` event.
3. Compensation flow: if reserve stock fails or payment fails, orchestrator triggers compensating actions:
   - If stock was reserved partially, add back stock for reserved items.
   - Set order status `CANCELLED` and publish `order.cancelled` event.
4. Each step is idempotent and writes progress to a `saga_state` table:
   - `saga_id`, `saga_type`, `saga_state` (JSON), `current_step`, `last_updated`

### Saga State & Retries
- Persist saga progress after each step. On orchestrator restart, recover incomplete sagas. Use exponential retry for transient errors and move to manual intervention (DLQ) after N attempts.

---

## 10. Flow: Add Book → Persist to Postgres + OpenSearch (detailed)
This is critical: ensure durability and eventual consistency between Postgres (authority) and OpenSearch (search index).

### Requirements
- Guarantee the book exists in Postgres first.
- Ensure that the book gets indexed in OpenSearch reliably.
- Prevent duplicates and handle retries.

### Implementation (Outbox + Publisher + Indexer)

#### 1) API Request (Client -> POST /api/v1/books)
- Request validated and authorized (ADMIN role).
- Controller constructs `CreateBookCommand` DTO and passes to `BookCommandHandler` (service layer).

#### 2) Command Handler (Transactional)
- Begin DB transaction (`@Transactional`):
  1. Insert row into `books` table (generate `bookId` UUID); set status (optional) initial meta.
  2. Insert any related `book_metadata` records.
  3. Insert an `outbox_events` row with `event_type = 'book.created'`, `payload = {bookId, title, author, ...}`, `published=false`.
- Commit transaction. Because outbox insert is part of same transaction, no event will be published unless DB commit succeeds.

#### 3) Outbox Publisher (background process, in same app or separate)
- Poll `outbox_events` where `published=false` with LIMIT & FOR UPDATE SKIP LOCKED (to avoid multiple publishers).
- For each event:
  1. Publish event to Kafka topic `book.created` with message key = bookId, and include `eventId` (outbox id).
  2. On successful Kafka ack, update `outbox_events` row set `published=true`, `published_at=now()`, attempts++.
  3. If publish fails, attempts++ and apply exponential backoff; after threshold send alert / mark for manual review.

#### 4) Indexer Consumer (separate component / same app)
- Consumer subscribes to `book.created`. On receiving event:
  1. Check `processed_messages` or idempotency store to ensure not processed earlier.
  2. Fetch the latest `book` row from Postgres using bookId to get canonical data (optionally use payload).
  3. Transform book entity to OpenSearch document and bulk index into `books_index` (handle upsert semantics).
  4. Mark messageId in `processed_messages` table.
  5. Optionally publish `book.indexed` event or update `books.index_status` field if you want sync status.

#### 5) Error Handling & Retries
- If indexing fails due to mapping error, log and push event to DLQ topic `book.index.dlq` and notify admin.
- If indexing fails due to temporary ES unavailability, retry with exponential backoff; processed_messages ensures idempotency.

### Notes on Idempotency
- Use `processed_messages` keyed by Kafka partition + offset or unique event id to prevent duplicate processing.
- When indexing, use `PUT books_index/_doc/{bookId}` to upsert the document and ensure idempotency.

---

## 11. Deployment & Runtime Considerations (minimal)
- Docker Compose for local dev (Postgres, Redis, Kafka/Redpanda, MinIO, OpenSearch). Each service has resource limits in compose file.
- JVM tuning: set `-Xms` & `-Xmx` appropriate for container; prefer smaller heap + more CPU for multiple instances.
- Thread pools: tune executors per environment; instrument via /metrics later.
- Database migrations: use Flyway or Liquibase.

---

## 12. Appendix: Useful snippets & configuration pointers
### Example: Outbox poll SQL (Postgres)
```sql
UPDATE outbox_events SET attempts = attempts + 1
WHERE id IN (
  SELECT id FROM outbox_events WHERE published = false ORDER BY created_at LIMIT 20 FOR UPDATE SKIP LOCKED
)
RETURNING *;
