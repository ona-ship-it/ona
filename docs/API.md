# Onagui API Documentation

## Base URL
```
https://www.onagui.com/api
```

For local development:
```
http://localhost:3000/api
```

## Authentication

### Header-based Authentication
All authenticated endpoints require a valid Supabase session. The session is automatically included via HTTP-only cookies set by Supabase Auth.

### API Key (Internal/Cron)
Protected cron endpoints accept:
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

Legacy compatibility (still accepted, do not use for new callers):
- Header: `x-cron-secret`
- Query parameter: `?secret=YOUR_CRON_SECRET`

## Response Format

All endpoints return JSON with the following structure:

**Success Response**
```json
{
  "data": { /* response data */ },
  "error": null,
  "status": "success"
}
```

**Error Response**
```json
{
  "data": null,
  "error": "Error message details",
  "status": "error"
}
```

## Authentication Endpoints

### Send Email Verification

Sends a verification email to the user's email address.

```
POST /auth/send-verification
```

**Request Body**
```json
{
  "email": "user@example.com",
  "redirectUrl": "https://yourapp.com/verify-email"
}
```

**Response**
```json
{
  "message": "Verification email sent",
  "status": "success"
}
```

**Status Codes**
- `200` - Email sent successfully
- `400` - Missing required fields
- `429` - Too many requests (rate limited)
- `500` - Server error

---

### Verify Email Token

Confirms an email verification token and marks the user's email as verified.

```
POST /auth/verify-email
```

**Request Body**
```json
{
  "token": "verification_token_from_email",
  "email": "user@example.com"
}
```

**Response (Success)**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "email_confirmed_at": "2024-03-12T15:30:00Z"
  },
  "status": "success"
}
```

**Response (Error)**
```json
{
  "error": "Invalid or expired token",
  "status": "error"
}
```

**Status Codes**
- `200` - Email verified
- `400` - Invalid token or email
- `404` - User not found
- `410` - Token expired
- `500` - Server error

---

## Raffle Endpoints

### Get Raffles with Search & Filter

Retrieve raffles with optional search, filtering, and sorting.

```
GET /raffles?search=bitcoin&filter=active&sort=newest&limit=20&offset=0
```

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search in title and description |
| `filter` | string | No | Status filter: `active`, `completed`, `cancelled`, or `all` (default: `active`) |
| `sort` | string | No | Sort by: `newest`, `popular`, `ending-soon` (default: `newest`) |
| `limit` | integer | No | Results per page (default: 20, max: 100) |
| `offset` | integer | No | Pagination offset (default: 0) |
| `categoryId` | string | No | Filter by category ID |
| `minPrice` | number | No | Minimum prize value |
| `maxPrice` | number | No | Maximum prize value |

**Response**
```json
{
  "data": {
    "raffles": [
      {
        "id": "raffle_id",
        "title": "Limited Edition Bitcoin Hardware Wallet",
        "description": "Raffle for exclusive hardware wallet",
        "image_urls": ["https://..."],
        "prize_value": 500,
        "prize_currency": "USD",
        "base_ticket_price": 10,
        "total_tickets": 100,
        "tickets_sold": 45,
        "status": "active",
        "end_date": "2024-04-12T00:00:00Z",
        "creator_id": "user_id",
        "creator_name": "Crypto Dev",
        "winner_id": null,
        "winner_drawn_at": null
      }
    ],
    "total": 125,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "status": "success"
}
```

**Status Codes**
- `200` - Success
- `400` - Invalid query parameters
- `500` - Server error

---

### Get Single Raffle

```
GET /raffles/:id
```

**Response**
```json
{
  "data": {
    "id": "raffle_id",
    "title": "Limited Edition Bitcoin Hardware Wallet",
    "description": "Raffle for exclusive hardware wallet",
    "image_urls": ["https://..."],
    "prize_value": 500,
    "prize_currency": "USD",
    "base_ticket_price": 10,
    "total_tickets": 100,
    "tickets_sold": 45,
    "status": "active",
    "end_date": "2024-04-12T00:00:00Z",
    "creator_id": "user_id",
    "creator_avatar_url": "https://...",
    "winner_id": null,
    "winner_drawn_at": null,
    "created_at": "2024-03-12T10:00:00Z"
  },
  "status": "success"
}
```

**Status Codes**
- `200` - Success
- `404` - Raffle not found
- `500` - Server error

---

### Buy Raffle Ticket (Crypto)

Purchase raffle ticket using cryptocurrency.

```
POST /raffles/:id/buy
```

**Request Body**
```json
{
  "quantity": 5,
  "paymentMethod": "solana",
  "walletAddress": "user_wallet_address",
  "transactionSignature": "transaction_hash_from_blockchain"
}
```

**Request Parameters**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quantity` | integer | Yes | Number of tickets (1-100) |
| `paymentMethod` | string | Yes | `solana`, `bitcoin`, or `ethereum` |
| `walletAddress` | string | Yes | Buyer's wallet address |
| `transactionSignature` | string | Yes | Verified transaction hash from blockchain |

**Response (Success)**
```json
{
  "data": {
    "ticketId": "ticket_id",
    "raffleId": "raffle_id",
    "quantity": 5,
    "totalPrice": 50,
    "currency": "USDC",
    "paymentMethod": "solana",
    "status": "confirmed",
    "ticketNumbers": [46, 47, 48, 49, 50],
    "transactionHash": "transaction_hash",
    "confirmedAt": "2024-03-12T15:30:00Z"
  },
  "status": "success"
}
```

**Response (Error)**
```json
{
  "error": "Invalid transaction signature or insufficient funds",
  "status": "error"
}
```

**Status Codes**
- `200` - Ticket purchased
- `400` - Invalid quantity, payment method, or transaction
- `401` - User not authenticated
- `404` - Raffle not found or sold out
- `409` - Raffle already closed
- `500` - Payment processing error

---

## Cron/System Endpoints

### Draw Winners (Daily Cron)

Automatically draws winners for expired raffles. **Restricted: Requires CRON_SECRET.**

```
GET /cron/draw-winners
POST /cron/draw-winners
```

With header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response**
```json
{
  "data": {
    "message": "Draw complete",
    "drawn": 3,
    "raffleIds": ["raffle_id_1", "raffle_id_2", "raffle_id_3"]
  },
  "status": "success"
}
```

**Status Codes**
- `200` - Draw successful
- `401` - Invalid or missing CRON_SECRET
- `500` - Draw failed

---

## Giveaways Endpoints (Coming Soon)

### Get Giveaways
```
GET /giveaways?search=...&filter=...&sort=...
```

### Create Giveaway
```
POST /giveaways
```

### Update Giveaway
```
PATCH /giveaways/:id
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Missing/invalid auth |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - State conflict (e.g., raffle closed) |
| `429` | Rate Limited - Too many requests |
| `500` | Internal Server Error |

---

## Rate Limiting

API requests are rate-limited per user:

- **Free tier**: 100 requests per minute
- **Authenticated**: 500 requests per minute
- **Admin**: Unlimited

Rate limit info is returned in response headers:
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1710345600
```

---

## Webhook Events (Future)

The platform will support webhooks for:
- `raffle.created`
- `raffle.completed`
- `user.transaction.completed`
- `user.ticket.purchased`

---

## Examples

### Example: Search Raffles by Cryptocurrency
```bash
curl "https://www.onagui.com/api/raffles?search=bitcoin&filter=active&sort=ending-soon&limit=10"
```

### Example: Buy Raffle Ticket
```bash
curl -X POST "https://www.onagui.com/api/raffles/raffle-123/buy" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2,
    "paymentMethod": "solana",
    "walletAddress": "EPjFWaJxNvtokMV8...",
    "transactionSignature": "5qbHMLyHXfLdhqsUYvuUQVpLCnK8AZtPZjNnhqVMh2zKDVUzz8r2Xg..."
  }'
```

### Example: Verify Email
```bash
curl -X POST "https://www.onagui.com/api/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "verification_token_from_email"
  }'
```

---

## Best Practices

1. **Always validate input** on the client before sending
2. **Use HTTPS** for all production requests
3. **Handle rate limits** with exponential backoff
4. **Cache responses** when possible
5. **Use pagination** for large result sets
6. **Store transaction hashes** for audit trails
7. **Implement error handling** for all API calls

---

## Support

For API issues and questions:
- GitHub Issues: https://github.com/ona-ship-it/ona/issues
- Email: api-support@onagui.com
