# Hostaway OAuth 2.0 Authentication

## Overview

The Hostaway API uses **OAuth 2.0 Client Credentials Grant** for authentication. This implementation follows best practices for Next.js applications.

## How It Works

### 1. Token Request

```typescript
POST https://api.hostaway.com/v1/accessTokens
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={HOSTAWAY_ACCOUNT_ID}
&client_secret={HOSTAWAY_CLIENT_SECRET}
&scope=general
```

### 2. Token Response

```json
{
  "token_type": "Bearer",
  "expires_in": 15897600,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiI..."
}
```

**Token Lifetime**: 24 months (15,897,600 seconds)

### 3. Using the Token

```typescript
Authorization: Bearer {access_token}
```

## Implementation Details

### Token Caching

```typescript
interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}
```

**Features**:

- ✅ In-memory token cache (singleton per HostawayClient instance)
- ✅ Automatic token refresh when expired
- ✅ 1-hour buffer before expiration (proactive refresh)
- ✅ Thread-safe singleton pattern

### Authentication Flow

```
1. API Request
   ↓
2. getAccessToken() checks cache
   ↓
3. If valid (> 1hr left) → Return cached token
   ↓
4. If expired/missing → Fetch new token
   ↓
5. Cache new token with expiration
   ↓
6. Use token in Authorization header
```

### Code Example

```typescript
// HostawayClient automatically handles OAuth
const client = new HostawayClient(accountId, clientSecret);

// First call: Fetches token
const listings = await client.fetchListings();

// Subsequent calls: Uses cached token
const reviews = await client.fetchReviews();

// After 24 months: Automatically fetches new token
```

## Environment Variables

### .env.local

```bash
# OAuth 2.0 Client Credentials
HOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_CLIENT_SECRET=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
```

**Where to find these**:

1. Log in to [Hostaway Dashboard](https://dashboard.hostaway.com)
2. Go to **Settings** → **API Settings**
3. Copy your **Account ID** and **Client Secret**

## Best Practices Implemented

### ✅ Token Caching

- Avoids unnecessary token requests
- Reduces API load
- Improves response time

### ✅ Proactive Refresh

- Refreshes token 1 hour before expiration
- Prevents authentication failures
- Ensures seamless operation

### ✅ Error Handling

```typescript
try {
  const token = await this.getAccessToken();
} catch (error) {
  console.error("OAuth token request failed:", error);
  throw error;
}
```

### ✅ Secure Storage

- Tokens stored in memory (not persisted)
- Environment variables for credentials
- No token exposure in logs

### ✅ Singleton Pattern

```typescript
// Same HostawayClient instance = same token cache
const container = DIContainer.getInstance();
const client = container.getHostawayClient(); // Cached
```

## Security Considerations

### ✅ DO's

- Store `CLIENT_SECRET` in environment variables
- Never commit `.env.local` to version control
- Use HTTPS for all API requests
- Implement rate limiting for token requests

### ❌ DON'Ts

- Don't expose `CLIENT_SECRET` in client-side code
- Don't log access tokens
- Don't store tokens in localStorage/cookies
- Don't share credentials across environments

## Token Lifecycle

```
Token Creation:
├─ Issued at: 2024-01-01 00:00:00
├─ Expires at: 2026-01-01 00:00:00 (24 months)
└─ Cached until: 2025-12-31 23:00:00 (1hr buffer)

Auto-Refresh:
├─ Check time: 2025-12-31 23:30:00
├─ Status: Expired (within 1hr buffer)
└─ Action: Fetch new token
```

## Troubleshooting

### Token Request Fails (401/403)

```
Error: OAuth token request failed: 401
```

**Solutions**:

1. Verify `HOSTAWAY_ACCOUNT_ID` is correct
2. Check `HOSTAWAY_CLIENT_SECRET` hasn't expired
3. Ensure API access is enabled in Hostaway dashboard
4. Confirm `scope=general` parameter is included

### Token Expired Mid-Request

```
Error: Hostaway API error: 401
```

**Solutions**:

1. Clear token cache: `client.tokenCache = null`
2. Retry the request (auto-refreshes token)
3. Check system clock is accurate

### Rate Limiting

```
Error: Hostaway API error: 429
```

**Solutions**:

1. Implement exponential backoff
2. Cache API responses when possible
3. Use pagination for large datasets

## API Endpoints Using OAuth

All Hostaway API endpoints use this authentication:

- ✅ `GET /api/listings/hostaway` - Fetch listings
- ✅ `GET /api/reviews/hostaway` - Fetch reviews
- ✅ All future Hostaway endpoints

## Testing Authentication

```typescript
// Test connection
const client = new HostawayClient(accountId, clientSecret);
const isConnected = await client.testConnection();

if (isConnected) {
  console.log("✅ OAuth authentication successful");
} else {
  console.log("❌ OAuth authentication failed");
}
```

## Further Reading

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [Hostaway API Documentation](https://api.hostaway.com/docs)
- [Client Credentials Grant](https://oauth.net/2/grant-types/client-credentials/)
