#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MemoryClient } from 'mem0ai';
import dotenv from 'dotenv';

dotenv.config();

const MEM0_API_KEY = process?.env?.MEM0_API_KEY || '';

// Initialize mem0ai client
const memoryClient = new MemoryClient({ apiKey: MEM0_API_KEY });

// Tool definitions
const ADD_MEMORY_TOOL: Tool = {
  name: 'add-memory',
  description:
    'Add a new memory. This method is called everytime the user informs anything about themselves, their preferences, or anything that has any relevent information whcih can be useful in the future conversation. This can also be called when the user asks you to remember something.',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The content to store in memory',
      },
      userId: {
        type: 'string',
        description: "User ID for memory storage. Defaults to 'quinn_may' if not provided.",
        default: 'quinn_may',
      },
    },
    required: ['content', 'userId'],
  },
};

const SEARCH_MEMORIES_TOOL: Tool = {
  name: 'search-memories',
  description: 'Search through stored memories. This method is called ANYTIME the user asks anything.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: "The search query. This is the query that the user has asked for. Example: 'What did I tell you about the weather last week?' or 'What did I tell you about my friend John?'",
      },
      userId: {
        type: 'string',
        description: "User ID for memory storage. Defaults to 'quinn_may' if not provided.",
        default: 'quinn_may',
      },
    },
    required: ['query', 'userId'],
  },
};

// Create server instance
const server = new Server(
  {
    name: 'memory',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
  }
);

// Quinn's custom memory categories for May Marketing SEO workflow
const MEMORY_CATEGORIES = {
  lifestyle_management_concerns: /daily routines|habits|hobbies|cooking|time management|work-life balance/i,
  daily_tracking: /daily work|left off|session|accomplished|today|yesterday/i,
  clients: /may marketing|cowboy property|flyers edge|woods roofing|pave worx|client|project/i,
  ai_projects: /ai automation|bot development|notion database|ai project|automation/i,
  seo_content: /seo|blog post|google my business|keyword|content generation|ranking/i,
  billing_payments: /payment|invoice|subscription|billing|financial|monthly fee/i,
  technical_infrastructure: /railway|docker|supabase|n8n|api|deployment|error log/i,
  meeting_notes: /meeting|discussion|decision|action item|follow-up|call/i,
  personal_family: /raven|family|home automation|personal/i,
  preferences: /preference|like|dislike|favorite|prefer|setting/i
};

// Helper function to categorize content
function categorizeContent(content: string): string[] {
  const categories: string[] = [];
  for (const [category, pattern] of Object.entries(MEMORY_CATEGORIES)) {
    if (pattern.test(content)) {
      categories.push(category);
    }
  }
  return categories.length > 0 ? categories : ['general'];
}

// Helper function to add memories
async function addMemory(content: string, userId: string) {
  try {
    const categories = categorizeContent(content);
    const enhancedContent = `[${categories.join(', ')}] ${content}`;
    
    const messages = [
      { role: 'user' as const, content: enhancedContent }
    ];
    await memoryClient.add(messages, { user_id: userId });
    return true;
  } catch (error) {
    console.error('Error adding memory:', error);
    return false;
  }
}

// Helper function to search memories
async function searchMemories(query: string, userId: string) {
  try {
    const results = await memoryClient.search(query, { user_id: userId });
    return results;
  } catch (error) {
    console.error('Error searching memories:', error);
    return [];
  }
}

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [ADD_MEMORY_TOOL, SEARCH_MEMORIES_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    if (!args) {
      throw new Error('No arguments provided');
    }
    
    switch (name) {
      case 'add-memory': {
        const { content, userId = 'quinn_may' } = args as { content: string, userId?: string };
        await addMemory(content, userId);
        return {
          content: [
            {
              type: 'text',
              text: 'Memory added successfully',
            },
          ],
          isError: false,
        };
      }
      
      case 'search-memories': {
        const { query, userId = 'quinn_may' } = args as { query: string, userId?: string };
        const results = await searchMemories(query, userId);
        const formattedResults = results.map((result: any) => 
          `Memory: ${result.memory}\nRelevance: ${result.score}\n---`
        ).join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: formattedResults || 'No memories found',
            },
          ],
          isError: false,
        };
      }
      
      default:
        return {
          content: [
            { type: 'text', text: `Unknown tool: ${name}` },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Function to log safely
function safeLog(
  level: 'error' | 'debug' | 'info' | 'notice' | 'warning' | 'critical' | 'alert' | 'emergency',
  data: any
): void {
  // For stdio transport, log to stderr to avoid protocol interference
  console.error(`[${level}] ${typeof data === 'object' ? JSON.stringify(data) : data}`);
  
  // Send to logging capability if available
  try {
    server.sendLoggingMessage({ level, data });
  } catch (error) {
    // Ignore errors when logging is not available
  }
}

// Server startup
async function main() {
  try {
    console.error('Initializing Quinn\'s Custom Memory MCP Server...');
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    safeLog('info', 'Quinn\'s Custom Memory MCP Server initialized successfully');
    console.error('Quinn\'s Custom Memory MCP Server running on stdio - May Marketing SEO Edition');
  } catch (error) {
    console.error('Fatal error running server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});