# Yiya Agent API

A public API for AI agents to query course information and user progress.

## Authentication

Most endpoints are public and read-only. The `/progress` endpoint requires an API key.

```
X-Agent-API-Key: your_api_key_here
```

Set `AGENT_API_KEY` in your environment variables.

## Endpoints

### GET /api/agent/courses

Returns a list of all available courses.

**Query Parameters:**
- `format=simple` - Returns plain text format for easy parsing

**Response (JSON):**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Spanish",
      "imageSrc": "/es.svg",
      "units": 5,
      "lessons": 50
    }
  ],
  "total": 6
}
```

**Response (Simple format):**
```
1. Spanish (5 units, 50 lessons)
2. French (4 units, 40 lessons)
...
```

### GET /api/agent/courses/[courseId]

Returns detailed information about a specific course.

**Response:**
```json
{
  "course": {
    "id": 1,
    "title": "Spanish",
    "imageSrc": "/es.svg"
  },
  "units": [
    {
      "id": 1,
      "title": "Unit 1",
      "description": "Basics",
      "order": 1,
      "lessons": [
        { "id": 1, "title": "Lesson 1", "order": 1 }
      ]
    }
  ],
  "totalUnits": 5,
  "totalLessons": 50
}
```

### GET /api/agent/progress?userId=xxx

Returns a user's learning progress. **Requires API key.**

**Headers:**
```
X-Agent-API-Key: your_api_key
```

**Response:**
```json
{
  "userId": "user_123",
  "activeCourse": {
    "id": 1,
    "title": "Spanish"
  },
  "hearts": 5,
  "points": 1200,
  "streak": 15,
  "longestStreak": 20,
  "dailyGoal": 1,
  "completedLessons": 45,
  "lastLessonAt": "2026-03-04T10:30:00Z"
}
```

## Use Cases

### Personal Learning Assistant

Agents can use this API to:
1. Check user's current course and progress
2. Recommend next lessons based on completed content
3. Provide personalized study tips

### Course Recommendation

```typescript
// Example: Agent recommending a course based on user interests
const response = await fetch('https://yiya.app/api/agent/courses?format=simple');
const courses = await response.text();
// Agent uses this to suggest relevant courses
```

### Progress Tracking

```typescript
// Example: Agent checking user's progress
const response = await fetch(
  'https://yiya.app/api/agent/progress?userId=user_123',
  { headers: { 'X-Agent-API-Key': apiKey } }
);
const progress = await response.json();
// Agent can encourage user or suggest practice based on streak
```

## Rate Limits

- Course endpoints: 100 requests/hour (cached for 1 hour)
- Progress endpoint: 60 requests/minute per API key

## Caching

Course data is cached for 1 hour (`Cache-Control: max-age=3600`).
Progress data is not cached.

## Error Codes

- `400` - Bad request (invalid parameters)
- `401` - Unauthorized (missing or invalid API key)
- `404` - Resource not found
- `500` - Internal server error

## Support

For API access or issues, contact: hello@yiya.app
