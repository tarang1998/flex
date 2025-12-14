# Hostaway Listings API

## Endpoint

```
GET /api/listings/hostaway
```

## Description

Fetches all property listings from the Hostaway sandbox environment.

## Authentication

Requires environment variables:

- `HOSTAWAY_ACCOUNT_ID`
- `HOSTAWAY_API_KEY`

## Response Format

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 12345,
      "name": "Luxury Downtown Apartment",
      "address": "123 Main St",
      "city": "San Francisco",
      "country": "US",
      "propertyType": "apartment",
      "bedrooms": 2,
      "bathrooms": 1,
      "maxGuests": 4,
      "photos": [
        "https://example.com/photo1.jpg",
        "https://example.com/photo2.jpg"
      ],
      "description": "Beautiful apartment in the heart of downtown...",
      "amenities": ["WiFi", "Kitchen", "Air Conditioning"],
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-12-01T15:45:00Z"
    }
  ]
}
```

## Example Usage

### Using fetch in browser/React

```javascript
async function getListings() {
  const response = await fetch("/api/listings/hostaway");
  const result = await response.json();

  if (result.success) {
    console.log(`Found ${result.count} listings`);
    console.log(result.data);
  }
}
```

### Using curl

```bash
curl http://localhost:3000/api/listings/hostaway
```

### Testing in browser

Navigate to:

```
http://localhost:3000/api/listings/hostaway
```

## Error Responses

### Missing Credentials

```json
{
  "error": "Hostaway credentials not configured",
  "message": "Please set HOSTAWAY_ACCOUNT_ID and HOSTAWAY_API_KEY in .env.local"
}
```

### API Error

```json
{
  "error": "Failed to fetch listings",
  "message": "Hostaway API error: 401"
}
```

## What It Does

1. **Connects to Hostaway API** at `https://api.hostaway.com/v1/listings`
2. **Authenticates** using your API credentials
3. **Fetches** all property listings from the sandbox
4. **Normalizes** the data to match your domain model
5. **Returns** clean, typed listing objects

## Architecture

```
GET /api/listings/hostaway
    ↓
API Route (route.ts)
    ↓
HostawayClient.fetchListings()
    ↓
Hostaway API (https://api.hostaway.com/v1/listings)
    ↓
normalizeListings()
    ↓
Domain Listing[] entities
```

## Clean Architecture Layers

- **Domain**: [`Listing` entity](../src/domain/entities/Listing.ts) (business model)
- **Infrastructure**: [`HostawayClient`](../src/infrastructure/api/HostawayClient.ts) (external API)
- **API Route**: [`/api/listings/hostaway`](../app/api/listings/hostaway/route.ts) (presentation)
