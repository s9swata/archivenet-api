## **1. COMMON.TS - Foundation Schemas**

### **Core Utility Schemas:**

**`paginationSchema`**

- **Function**: Handles pagination for large data sets
- **ArchiveNET Use**: When users browse their memory collections, search results, or usage statistics
- **Features**: Page-based pagination with configurable limits (1-100 items per page)

**`sortOrderSchema` & `sortSchema`**

- **Function**: Standardizes sorting across all API endpoints
- **ArchiveNET Use**: Sort memories by date, importance, category, or relevance
- **Features**: Ascending/descending order with flexible sort fields

**`timestampRangeSchema`**

- **Function**: Filters data by time periods
- **ArchiveNET Use**: Search memories from specific date ranges, analyze usage over time
- **Features**: Optional start/end dates for flexible time filtering

**`searchSchema`**

- **Function**: Base text search with filtering capabilities
- **ArchiveNET Use**: General-purpose search across the platform
- **Features**: Query string validation with optional metadata filters

### **Validation Schemas:**

**`uuidSchema`**

- **Function**: Validates UUID format for IDs
- **ArchiveNET Use**: User IDs, memory IDs, API token IDs, session IDs
- **Features**: Ensures proper UUID v4 format

**`emailSchema`**

- **Function**: Email validation for user accounts
- **ArchiveNET Use**: User registration, login, notifications
- **Features**: RFC-compliant email validation

**`arweaveTransactionIdSchema`**

- **Function**: Validates Arweave transaction IDs (43 characters)
- **ArchiveNET Use**: Contract deployment IDs, storage transaction references
- **Features**: Ensures proper Arweave blockchain transaction format

### **Response Schemas:**

**`successResponseSchema` & `errorResponseSchema`**

- **Function**: Standardizes API response format
- **ArchiveNET Use**: Consistent response structure across all endpoints
- **Features**: Success/error status, messages, optional data/error details

**`paginatedResponseSchema`**

- **Function**: Wraps paginated data with pagination metadata
- **ArchiveNET Use**: Memory lists, search results, usage reports
- **Features**: Data array + pagination info (total, pages, navigation)

**`healthCheckSchema`**

- **Function**: API health monitoring
- **ArchiveNET Use**: System monitoring, uptime checks, service status
- **Features**: Overall status + individual service health (DB, Redis, Arweave)

**`apiScopesSchema`**

- **Function**: Defines API token permissions
- **ArchiveNET Use**: Fine-grained access control for MCP servers and user tokens
- **Features**: Granular permissions (memory:read/write/delete, profile, usage)

---

## **2. VECTOR.TS - Core Vector Database Operations**

### **Configuration Schemas:**

**`hnswConfigSchema`**

- **Function**: Configures HNSW algorithm parameters
- **ArchiveNET Use**: Optimizes vector database performance per user needs
- **Features**:
  - `m` (2-48): connections per node - higher = better quality, more memory
  - `efConstruction` (10-800): build quality - higher = better graph, slower build
  - `efSearch` (10-800): search quality - higher = better recall, slower search

### **Core Data Schemas:**

**`vectorEmbeddingSchema`**

- **Function**: Validates vector embedding arrays
- **ArchiveNET Use**: Stores AI-generated embeddings from text content
- **Features**: 1-4096 dimensions, finite numbers only, prevents empty vectors

**`vectorMetadataSchema`**

- **Function**: Flexible metadata for vectors
- **ArchiveNET Use**: Stores searchable information about each memory
- **Features**: Title, content hash, category, tags, importance, embedding model info

### **Operation Schemas:**

**`insertVectorSchema`**

- **Function**: Single vector insertion
- **ArchiveNET Use**: When AI agents store new memories via MCP
- **Features**: Vector + metadata + user context

**`batchInsertVectorSchema`**

- **Function**: Bulk vector insertion (1-100 vectors)
- **ArchiveNET Use**: Bulk memory imports, data migration
- **Features**: Batch processing with reasonable limits

**`searchVectorSchema`**

- **Function**: Vector similarity search
- **ArchiveNET Use**: Core memory retrieval - find similar past conversations
- **Features**: Query vector, result count (k), similarity threshold, advanced filters

**`semanticSearchSchema`**

- **Function**: Text-to-vector search
- **ArchiveNET Use**: Natural language memory search via MCP
- **Features**: Text query → embedding generation → vector search

### **Management Schemas:**

**`getVectorSchema`, `updateVectorSchema`, `deleteVectorSchema`**

- **Function**: Individual vector CRUD operations
- **ArchiveNET Use**: Memory management, corrections, cleanup
- **Features**: Vector ID targeting with user isolation

**`deployContractSchema`**

- **Function**: Deploy new Arweave contracts for users
- **ArchiveNET Use**: User onboarding - each user gets their own blockchain contract
- **Features**: User ID + optional HNSW config + seed data

### **Response Schemas:**

**`vectorSearchResponseSchema`**

- **Function**: Search results with metadata
- **ArchiveNET Use**: Returns relevant memories to AI agents
- **Features**: Results array, query info, execution time, total count

**`vectorInsertResponseSchema` & `batchInsertResponseSchema`**

- **Function**: Insertion confirmation
- **ArchiveNET Use**: Confirms successful memory storage
- **Features**: Vector IDs, contract references, costs, performance metrics

---

## **3. MEMORY.TS - High-Level Memory Management**

### **Core Memory Schema:**

**`memoryEntrySchema`**

- **Function**: Complete memory record structure
- **ArchiveNET Use**: Represents a single AI memory with full context
- **Features**:
  - **Content**: Original text, hash, AI summary
  - **Context**: Conversation context, importance (0-1)
  - **Source**: MCP/API/web/import/system tracking
  - **Relationships**: Parent-child memory hierarchies
  - **Access**: Privacy controls, sharing permissions
  - **Lifecycle**: Status tracking (active/archived/deleted)

### **Operation Schemas:**

**`createMemorySchema`**

- **Function**: New memory creation
- **ArchiveNET Use**: MCP servers creating memories from AI conversations
- **Features**: Content + context + metadata, source tracking

**`updateMemorySchema`**

- **Function**: Memory modification
- **ArchiveNET Use**: Edit importance, add tags, change privacy, update summaries
- **Features**: Partial updates, version tracking

**`searchMemoriesSchema`**

- **Function**: Advanced memory search
- **ArchiveNET Use**: AI agents finding relevant past memories
- **Features**: Semantic search + rich filtering (category, tags, source, time, importance)

**`listMemoriesSchema`**

- **Function**: Browse/paginate memory collections
- **ArchiveNET Use**: User dashboard, memory management UI
- **Features**: Sorting options, filtering, pagination, content inclusion control

### **Advanced Schemas:**

**`bulkMemoryOperationSchema`**

- **Function**: Batch operations (delete/archive/update up to 100 memories)
- **ArchiveNET Use**: Bulk memory management, cleanup operations
- **Features**: Multi-memory operations with error handling

**`exportMemoriesSchema` & `importMemoriesSchema`**

- **Function**: Data portability
- **ArchiveNET Use**: User data export, migration between systems
- **Features**: JSON/CSV/Markdown formats, vector inclusion options

**`memoryAnalyticsSchema`**

- **Function**: Usage analytics and insights
- **ArchiveNET Use**: Dashboard analytics, usage reports for billing
- **Features**: Time-series data, multiple metrics, cost tracking

### **Response Schemas:**

**`memorySearchResponseSchema`**

- **Function**: Rich search results
- **ArchiveNET Use**: MCP responses with full context
- **Features**: Memory objects + similarity scores + related memories

**`memoryAnalyticsResponseSchema`**

- **Function**: Analytics dashboard data
- **ArchiveNET Use**: User insights, billing calculations
- **Features**: Aggregated metrics, summaries, trend data

---
