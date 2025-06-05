import { z } from 'zod';
import {
    uuidSchema,
} from './common.js';

// Base analytics time range schema
export const analyticsTimeRangeSchema = z.object({
    period: z.enum(['hour', 'day', 'week', 'month', 'quarter', 'year']).default('day'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    timezone: z.string().default('UTC'),
});

// Analytics aggregation schema
export const analyticsAggregationSchema = z.object({
    groupBy: z.array(z.enum(['date', 'category', 'source', 'aiAgent', 'user', 'tag'])).default(['date']),
    metrics: z.array(z.enum([
        'count',
        'storage_size',
        'embedding_cost',
        'storage_cost', // optional ?
        'api_calls',
        'search_queries',
        'unique_users',
        'average_importance',
        'response_time',
        'error_rate'
    ])).min(1),
});

// Memory analytics schema to track memory creation, usage, categories and costs
export const memoryAnalyticsSchema = z.object({
    userId: uuidSchema.optional(),
    timeRange: analyticsTimeRangeSchema.optional(),
    aggregation: analyticsAggregationSchema.optional(),
    filters: z.object({
        categories: z.array(z.string()).optional(),
        sources: z.array(z.enum(['mcp', 'api', 'web', 'import', 'system'])).optional(),
        aiAgents: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        importanceRange: z.object({
            min: z.number().min(0).max(1).optional(),
            max: z.number().min(0).max(1).optional(),
        }).optional(),
        status: z.array(z.enum(['active', 'archived', 'deleted'])).optional(),
    }).optional(),
    includeBreakdown: z.boolean().default(false),
});

// Usage analytics schema to monitor api calls, operations and user behavior
export const usageAnalyticsSchema = z.object({
    userId: uuidSchema.optional(),
    timeRange: analyticsTimeRangeSchema.optional(),
    metrics: z.array(z.enum([
        'api_calls',
        'memory_operations',
        'search_queries',
        'vector_operations',
        'storage_usage',
        'bandwidth_usage',
        'cost_breakdown',
        'response_times',
        'error_counts'
    ])).default(['api_calls']),
    groupBy: z.enum(['endpoint', 'operation_type', 'user', 'date']).default('date'),
    includeDetails: z.boolean().default(false),
});

// Performance analytics schema to track system performance, response times and SLA metrics
export const performanceAnalyticsSchema = z.object({
    timeRange: analyticsTimeRangeSchema.optional(),
    metrics: z.array(z.enum([
        'response_time',
        'throughput',
        'error_rate',
        'availability',
        'memory_usage',
        'cpu_usage',
        'database_performance',
        'cache_hit_rate'
    ])).default(['response_time']),
    aggregation: z.enum(['avg', 'min', 'max', 'p50', 'p95', 'p99']).default('avg'),
    groupBy: z.enum(['endpoint', 'operation', 'service', 'date']).default('date'),
    includeAlerts: z.boolean().default(false),
});

// User analytics schema to track user engagement, retention and segmentation
export const userAnalyticsSchema = z.object({
    timeRange: analyticsTimeRangeSchema.optional(),
    metrics: z.array(z.enum([
        'active_users',
        'new_registrations',
        'user_retention',
        'session_duration',
        'feature_usage',
        'churn_rate',
        'engagement_score'
    ])).default(['active_users']),
    segmentation: z.object({
        byPlan: z.boolean().default(false),
        byRegion: z.boolean().default(false),
        byUsageLevel: z.boolean().default(false),
    }).optional(),
    includeDetails: z.boolean().default(false),
});

// Search analytics schema to track search queries, performance and relevance
export const searchAnalyticsSchema = z.object({
    userId: uuidSchema.optional(),
    timeRange: analyticsTimeRangeSchema.optional(),
    metrics: z.array(z.enum([
        'query_count',
        'average_response_time',
        'result_relevance',
        'zero_result_queries',
        'popular_queries',
        'search_patterns'
    ])).default(['query_count']),
    filters: z.object({
        queryLength: z.object({
            min: z.number().int().min(0).optional(),
            max: z.number().int().optional(),
        }).optional(),
        resultCount: z.object({
            min: z.number().int().min(0).optional(),
            max: z.number().int().optional(),
        }).optional(),
        responseTimeRange: z.object({
            min: z.number().min(0).optional(),
            max: z.number().optional(),
        }).optional(),
    }).optional(),
    includeQueryDetails: z.boolean().default(false),
});

// #REVIEW: Cost analytics schema for financial tracking with breakdowns and projections (not needed for our use case)
export const costAnalyticsSchema = z.object({
    userId: uuidSchema.optional(),
    timeRange: analyticsTimeRangeSchema.optional(),
    breakdown: z.array(z.enum([
        'embedding_costs', // arweave insertion costs
        'storage_costs',
        'compute_costs',
        'bandwidth_costs', // Data transfer costs
        'api_costs', // Third-party API costs
        'total_costs'
    ])).default(['total_costs']),
    currency: z.enum(['USD', 'AR']).default('USD'),
    includeProjections: z.boolean().default(false),
    compareWith: z.enum(['previous_period', 'last_month', 'last_year']).optional(),
});

// Real-time analytics schema for live monitoring and alerting
export const realtimeAnalyticsSchema = z.object({
    metrics: z.array(z.enum([
        'concurrent_users',
        'active_sessions',
        'current_requests',
        'memory_operations',
        'search_queries',
        'error_rate',
        'response_time'
    ])).default(['concurrent_users']),
    refreshInterval: z.number().int().min(1).max(300).default(30), // seconds
    includeAlerts: z.boolean().default(false),
});

// Custom analytics schema for user-defined queries and visualizations
export const customAnalyticsSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    query: z.object({
        metrics: z.array(z.string()).min(1),
        dimensions: z.array(z.string()).optional(),
        filters: z.record(z.any()).optional(),
        timeRange: analyticsTimeRangeSchema.optional(),
    }),
    visualization: z.enum(['line', 'bar', 'pie', 'table', 'heatmap']).default('line'),
    schedule: z.object({
        enabled: z.boolean().default(false),
        frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
        recipients: z.array(z.string().email()).optional(),
    }).optional(),
});

// Response schemas
export const analyticsDataPointSchema = z.object({
    timestamp: z.string().datetime(),
    value: z.number(),
    metadata: z.record(z.any()).optional(),
});

export const analyticsSeriesSchema = z.object({
    metric: z.string(),
    data: z.array(analyticsDataPointSchema),
    aggregation: z.string().optional(),
    unit: z.string().optional(),
});

export const memoryAnalyticsResponseSchema = z.object({
    timeRange: analyticsTimeRangeSchema,
    series: z.array(analyticsSeriesSchema),
    summary: z.object({
        totalMemories: z.number().int().nonnegative(),
        totalStorage: z.number().nonnegative(),
        totalCost: z.number().nonnegative(),
        averageImportance: z.number().min(0).max(1),
        growthRate: z.number(),
        topCategories: z.array(z.object({
            category: z.string(),
            count: z.number().int().nonnegative(),
            percentage: z.number().min(0).max(100),
        })),
        topSources: z.array(z.object({
            source: z.string(),
            count: z.number().int().nonnegative(),
            percentage: z.number().min(0).max(100),
        })),
    }),
    breakdown: z.record(z.any()).optional(),
    alerts: z.array(z.object({
        type: z.enum(['warning', 'error', 'info']),
        message: z.string(),
        threshold: z.number().optional(),
        currentValue: z.number().optional(),
    })).optional(),
});

export const usageAnalyticsResponseSchema = z.object({
    timeRange: analyticsTimeRangeSchema,
    series: z.array(analyticsSeriesSchema),
    summary: z.object({
        totalApiCalls: z.number().int().nonnegative(),
        totalOperations: z.number().int().nonnegative(),
        averageResponseTime: z.number().nonnegative(),
        errorRate: z.number().min(0).max(100),
        topEndpoints: z.array(z.object({
            endpoint: z.string(),
            calls: z.number().int().nonnegative(),
            averageResponseTime: z.number().nonnegative(),
        })),
        quotaUsage: z.object({
            current: z.number().nonnegative(),
            limit: z.number().nonnegative(),
            percentage: z.number().min(0).max(100),
        }).optional(),
    }),
    details: z.array(z.object({
        endpoint: z.string(),
        method: z.string(),
        calls: z.number().int().nonnegative(),
        averageResponseTime: z.number().nonnegative(),
        errorCount: z.number().int().nonnegative(),
    })).optional(),
});

export const performanceAnalyticsResponseSchema = z.object({
    timeRange: analyticsTimeRangeSchema,
    series: z.array(analyticsSeriesSchema),
    summary: z.object({
        averageResponseTime: z.number().nonnegative(),
        throughput: z.number().nonnegative(),
        errorRate: z.number().min(0).max(100),
        uptime: z.number().min(0).max(100),
        slaCompliance: z.number().min(0).max(100).optional(),
    }),
    alerts: z.array(z.object({
        type: z.enum(['warning', 'critical', 'resolved']),
        metric: z.string(),
        threshold: z.number(),
        currentValue: z.number(),
        message: z.string(),
        timestamp: z.string().datetime(),
    })).optional(),
});

export const searchAnalyticsResponseSchema = z.object({
    timeRange: analyticsTimeRangeSchema,
    series: z.array(analyticsSeriesSchema),
    summary: z.object({
        totalQueries: z.number().int().nonnegative(),
        averageResponseTime: z.number().nonnegative(),
        averageResultCount: z.number().nonnegative(),
        zeroResultRate: z.number().min(0).max(100),
        popularQueries: z.array(z.object({
            query: z.string(),
            count: z.number().int().nonnegative(),
            averageResponseTime: z.number().nonnegative(),
        })),
    }),
    patterns: z.object({
        queryLengthDistribution: z.record(z.number()),
        timeOfDayPattern: z.record(z.number()),
        categoryPreferences: z.record(z.number()),
    }).optional(),
});

export const costAnalyticsResponseSchema = z.object({
    timeRange: analyticsTimeRangeSchema,
    series: z.array(analyticsSeriesSchema),
    summary: z.object({
        totalCost: z.number().nonnegative(),
        projectedMonthlyCost: z.number().nonnegative().optional(),
        costPerOperation: z.number().nonnegative(),
        breakdown: z.object({
            embedding: z.number().nonnegative(),
            storage: z.number().nonnegative(),
            compute: z.number().nonnegative(),
            bandwidth: z.number().nonnegative(),
        }),
        comparison: z.object({
            period: z.string(),
            change: z.number(),
            changePercentage: z.number(),
        }).optional(),
    }),
    currency: z.string(),
    recommendations: z.array(z.object({
        type: z.enum(['cost_optimization', 'usage_pattern', 'plan_upgrade']),
        message: z.string(),
        potentialSavings: z.number().nonnegative().optional(),
    })).optional(),
});

export const realtimeAnalyticsResponseSchema = z.object({
    timestamp: z.string().datetime(),
    metrics: z.record(z.number()),
    status: z.enum(['healthy', 'warning', 'critical']),
    alerts: z.array(z.object({
        metric: z.string(),
        value: z.number(),
        threshold: z.number(),
        severity: z.enum(['warning', 'critical']),
    })).optional(),
});

// Export type definitions
export type AnalyticsTimeRange = z.infer<typeof analyticsTimeRangeSchema>;
export type AnalyticsAggregation = z.infer<typeof analyticsAggregationSchema>;
export type MemoryAnalytics = z.infer<typeof memoryAnalyticsSchema>;
export type UsageAnalytics = z.infer<typeof usageAnalyticsSchema>;
export type PerformanceAnalytics = z.infer<typeof performanceAnalyticsSchema>;
export type UserAnalytics = z.infer<typeof userAnalyticsSchema>;
export type SearchAnalytics = z.infer<typeof searchAnalyticsSchema>;
export type CostAnalytics = z.infer<typeof costAnalyticsSchema>;
export type RealtimeAnalytics = z.infer<typeof realtimeAnalyticsSchema>;
export type CustomAnalytics = z.infer<typeof customAnalyticsSchema>;
export type AnalyticsDataPoint = z.infer<typeof analyticsDataPointSchema>;
export type AnalyticsSeries = z.infer<typeof analyticsSeriesSchema>;
export type MemoryAnalyticsResponse = z.infer<typeof memoryAnalyticsResponseSchema>;
export type UsageAnalyticsResponse = z.infer<typeof usageAnalyticsResponseSchema>;
export type PerformanceAnalyticsResponse = z.infer<typeof performanceAnalyticsResponseSchema>;
export type SearchAnalyticsResponse = z.infer<typeof searchAnalyticsResponseSchema>;
export type CostAnalyticsResponse = z.infer<typeof costAnalyticsResponseSchema>;
export type RealtimeAnalyticsResponse = z.infer<typeof realtimeAnalyticsResponseSchema>;