# Quinn's Custom Memory MCP Server

[![smithery badge](https://smithery.ai/badge/@quinn/memory)](https://smithery.ai/server/@quinn/memory)

A personalized Model Context Protocol (MCP) server that provides memory storage and retrieval capabilities using [Mem0](https://github.com/mem0ai/mem0), customized for Quinn May's May Marketing SEO workflow.

## Features

- 🧠 **Personalized Memory**: Defaults to Quinn's userId (`quinn`)
- 🏷️ **Auto-Categorization**: 9 custom categories for May Marketing SEO workflow
- 🔍 **Smart Search**: Relevance-scored memory retrieval
- 🎯 **Client-Focused**: Tracks client work, AI projects, SEO content
- ⚡ **Context-Aware**: Maintains session continuity and "left off" context

## Custom Memory Categories

1. **clients** - May Marketing, Cowboy Property, Flyers Edge, Woods Roofing, Pave Worx
2. **ai_projects** - AI automation, bot development, Notion databases
3. **seo_content** - Blog posts, Google My Business, keyword research, rankings
4. **technical_infrastructure** - Railway, Docker, Supabase, n8n, APIs
5. **daily_tracking** - Work sessions, "left off" context, daily accomplishments
6. **billing_payments** - Client payments, invoices, monthly subscriptions
7. **meeting_notes** - Client meetings, decisions, action items
8. **personal_family** - Family activities, home automation, personal notes
9. **lifestyle_management_concerns** - Daily routines, work-life balance

## Installation

### Local Usage

```bash
npm install
npm run build
npm start
```

### Environment Variables

```bash
MEM0_API_KEY=your_memo_api_key_here
```

## Available Tools

### 1. Add Memory (`add-memory`)
Automatically categorizes and stores memories with Quinn's custom categories.

```json
{
  "name": "add-memory",
  "arguments": {
    "content": "Completed SEO optimization for Cowboy Property blog posts",
    "userId": "quinn"
  }
}
```

### 2. Search Memories (`search-memories`)
Search through categorized memories with relevance scoring.

```json
{
  "name": "search-memories",
  "arguments": {
    "query": "cowboy property seo work",
    "userId": "quinn"
  }
}
```

## Deployment

Ready for deployment to [Smithery](https://smithery.ai/new) for hosted access.

## Author

Quinn May - May Marketing SEO
Email: quinn@maymarketingseo.com