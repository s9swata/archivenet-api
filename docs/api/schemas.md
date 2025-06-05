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

## **4. ANALYTICS.TS - Comprehensive Analytics & Monitoring**

### **Base Configuration Schemas:**

**`analyticsTimeRangeSchema`**

- **Function**: Standardizes time period definitions across all analytics
- **ArchiveNET Use**: Dashboard time filters, report generation, trend analysis
- **Features**:
  - **Period**: Predefined intervals (hour/day/week/month/quarter/year)
  - **Custom Range**: Optional start/end dates for specific periods
  - **Timezone**: UTC default with timezone-aware calculations
  - **Validation**: Ensures end date is after start date

**`analyticsAggregationSchema`**

- **Function**: Defines how data should be grouped and measured
- **ArchiveNET Use**: Flexible data aggregation for different dashboard views
- **Features**:
  - **GroupBy**: Multiple dimensions (date, category, source, aiAgent, user, tag)
  - **Metrics**: Performance indicators (count, storage, costs, response times)
  - **Validation**: Requires at least one metric, prevents empty aggregations

### **Memory Analytics:**

**`memoryAnalyticsSchema`**

- **Function**: Comprehensive memory usage and performance tracking
- **ArchiveNET Use**: Memory lifecycle analysis, storage optimization, user insights
- **Features**:
  - **User Filtering**: Per-user or system-wide analytics
  - **Source Tracking**: MCP vs API vs web usage patterns
  - **Category Analysis**: Content categorization trends
  - **Importance Metrics**: Memory significance distribution
  - **Status Monitoring**: Active/archived/deleted memory lifecycle
  - **Breakdown Options**: Detailed drill-down capabilities

**`memoryAnalyticsResponseSchema`**

- **Function**: Rich memory analytics dashboard data
- **ArchiveNET Use**: Memory management insights, optimization recommendations
- **Features**:
  - **Time Series**: Historical memory creation/access patterns
  - **Summary Stats**: Total memories, storage usage, average importance
  - **Growth Metrics**: Memory creation rate and trends
  - **Top Categories/Sources**: Most used content types and input methods
  - **Alert System**: Threshold-based warnings for unusual patterns

### **Usage Analytics:**

**`usageAnalyticsSchema`**

- **Function**: API and system usage monitoring
- **ArchiveNET Use**: Performance monitoring, quota management, billing calculations
- **Features**:
  - **Endpoint Tracking**: Per-endpoint usage statistics
  - **Operation Types**: Memory operations, searches, vector operations
  - **Performance Metrics**: Response times, error rates
  - **Resource Usage**: Storage and bandwidth consumption
  - **Cost Analysis**: Operation-based cost tracking

**`usageAnalyticsResponseSchema`**

- **Function**: Usage dashboard and billing data
- **ArchiveNET Use**: User dashboards, quota enforcement, billing reports
- **Features**:
  - **API Statistics**: Total calls, average response times, error rates
  - **Top Endpoints**: Most used API endpoints with performance data
  - **Quota Monitoring**: Current usage vs limits with percentage tracking
  - **Performance Insights**: Response time trends and bottlenecks

### **Performance Analytics:**

**`performanceAnalyticsSchema`**

- **Function**: System performance and SLA monitoring
- **ArchiveNET Use**: Infrastructure monitoring, performance optimization, uptime tracking
- **Features**:
  - **System Metrics**: Response time, throughput, error rate, availability
  - **Resource Monitoring**: Memory usage, CPU usage, database performance
  - **Cache Analytics**: Hit rates and performance impact
  - **Aggregation Types**: Statistical aggregations (avg, min, max, percentiles)
  - **Alert Integration**: Performance threshold monitoring

**`performanceAnalyticsResponseSchema`**

- **Function**: System health dashboard data
- **ArchiveNET Use**: Operations monitoring, SLA compliance, capacity planning
- **Features**:
  - **Performance Summary**: Key metrics overview with SLA compliance
  - **Alert Management**: Active alerts with severity levels and thresholds
  - **Trend Analysis**: Historical performance patterns
  - **Service Health**: Individual service status and performance

### **User Analytics:**

**`userAnalyticsSchema`**

- **Function**: User behavior and engagement analysis
- **ArchiveNET Use**: Product analytics, user retention, feature adoption
- **Features**:
  - **Engagement Metrics**: Active users, session duration, feature usage
  - **Retention Analysis**: User retention rates and churn analysis
  - **Segmentation**: Analysis by plan, region, usage level
  - **Growth Tracking**: New registrations and user acquisition

### **Search Analytics:**

**`searchAnalyticsSchema`**

- **Function**: Search performance and user behavior analysis
- **ArchiveNET Use**: Search optimization, relevance tuning, user experience improvement
- **Features**:
  - **Query Analysis**: Search volume, response times, result quality
  - **Pattern Recognition**: Common search patterns and popular queries
  - **Performance Metrics**: Response times, result counts, zero-result rates
  - **Relevance Tracking**: Result utilization and user satisfaction
  - **Query Filters**: Length analysis, response time ranges

**`searchAnalyticsResponseSchema`**

- **Function**: Search optimization dashboard data
- **ArchiveNET Use**: Search performance monitoring, relevance optimization
- **Features**:
  - **Search Summary**: Total queries, performance metrics, result quality
  - **Popular Queries**: Most common searches with performance data
  - **Usage Patterns**: Query length distribution, time-of-day patterns
  - **Optimization Insights**: Category preferences and search behavior

### **Cost Analytics:**

**`costAnalyticsSchema`**

- **Function**: Financial tracking and cost optimization
- **ArchiveNET Use**: Billing calculations, cost optimization, budget planning
- **Features**:
  - **Arweave Costs**: Storage insertion costs (searches are free)
  - **AI Costs**: Embedding generation and processing costs
  - **Infrastructure Costs**: Compute, storage, bandwidth costs
  - **Currency Support**: USD and AR token tracking
  - **Projections**: Future cost estimates based on usage trends
  - **Comparisons**: Period-over-period cost analysis

**`costAnalyticsResponseSchema`**

- **Function**: Financial dashboard and optimization recommendations
- **ArchiveNET Use**: Cost monitoring, billing transparency, optimization guidance
- **Features**:
  - **Cost Breakdown**: Detailed cost analysis by service type
  - **Projections**: Monthly cost estimates and trending
  - **Optimization**: Cost-saving recommendations and efficiency insights
  - **Arweave Metrics**: Storage costs, transaction counts, free search tracking

### **Real-time Analytics:**

**`realtimeAnalyticsSchema`**

- **Function**: Live system monitoring and alerting
- **ArchiveNET Use**: Real-time dashboard, incident response, capacity monitoring
- **Features**:
  - **Live Metrics**: Concurrent users, active sessions, current load
  - **Refresh Control**: Configurable update intervals (1-300 seconds)
  - **Alert Integration**: Real-time threshold monitoring
  - **System Health**: Live error rates and response times

**`realtimeAnalyticsResponseSchema`**

- **Function**: Live monitoring dashboard data
- **ArchiveNET Use**: Operations dashboard, incident response, real-time insights
- **Features**:
  - **Current State**: Live metric values with timestamps
  - **Health Status**: Overall system health assessment
  - **Active Alerts**: Real-time threshold violations and warnings

### **Custom Analytics:**

**`customAnalyticsSchema`**

- **Function**: User-defined analytics and reporting
- **ArchiveNET Use**: Custom dashboards, specialized reports, automated insights
- **Features**:
  - **Flexible Queries**: User-defined metrics, dimensions, and filters
  - **Visualization Options**: Multiple chart types (line, bar, pie, table, heatmap)
  - **Automation**: Scheduled reports with email delivery
  - **Persistence**: Named and saved custom analytics configurations

### **Key Design Principles:**

1. **Arweave-Optimized**: Recognizes that Arweave searches are free, only storage costs money
2. **Time-Aware**: All schemas support flexible time ranges and timezone handling
3. **User-Isolated**: Analytics can be filtered by user for multi-tenant scenarios
4. **Performance-Focused**: Includes execution time tracking and optimization metrics
5. **Cost-Conscious**: Detailed cost tracking for transparent billing and optimization
6. **Alert-Enabled**: Built-in threshold monitoring and alerting capabilities
7. **Extensible**: Custom analytics support for specialized use cases

### **Usage Examples:**

**Memory Growth Analysis**:
```typescript
const memoryGrowth = {
  timeRange: { period: 'month', startDate: '2024-01-01' },
  aggregation: { groupBy: ['date'], metrics: ['count', 'storage_size'] },
  filters: { sources: ['mcp'], status: ['active'] }
}
```

**Cost Optimization Report**:
```typescript
const costAnalysis = {
  timeRange: { period: 'month' },
  breakdown: ['arweave_insertion_costs', 'embedding_generation_costs'],
  includeProjections: true,
  compareWith: 'previous_period'
}
```

**Real-time Monitoring**:
```typescript
const liveMetrics = {
  metrics: ['concurrent_users', 'memory_operations', 'error_rate'],
  refreshInterval: 30,
  includeAlerts: true
}
```

---
