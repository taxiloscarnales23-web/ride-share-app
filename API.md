# RideShare API Documentation

## Overview

The RideShare API provides comprehensive endpoints for managing rides, drivers, riders, payments, and platform administration. All API requests require authentication via JWT tokens.

## Base URL

```
https://api.rideshare.com/api
```

## Authentication

All API requests require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- **Standard**: 1000 requests per hour per user
- **Premium**: 5000 requests per hour per user
- **Admin**: Unlimited

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Response Format

All responses are in JSON format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-02-19T22:45:00Z"
}
```

## Error Handling

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal server error |

## Rides API

### Request a Ride

**Endpoint:** `POST /rides`

**Description:** Create a new ride request

**Request Body:**
```json
{
  "pickupLat": 40.7128,
  "pickupLng": -74.0060,
  "pickupAddress": "123 Main St, New York, NY",
  "dropoffLat": 40.7580,
  "dropoffLng": -73.9855,
  "dropoffAddress": "Times Square, New York, NY",
  "rideType": "standard",
  "scheduledTime": "2024-02-19T23:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ride_123abc",
    "status": "searching",
    "fare": 12.50,
    "estimatedDuration": 15,
    "createdAt": "2024-02-19T22:45:00Z"
  }
}
```

### Get Ride Details

**Endpoint:** `GET /rides/{rideId}`

**Description:** Get details of a specific ride

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ride_123abc",
    "status": "active",
    "rider": { "id": "rider_1", "name": "John Doe" },
    "driver": { "id": "driver_1", "name": "Jane Smith", "vehicle": "Toyota Prius" },
    "pickupAddress": "123 Main St",
    "dropoffAddress": "Times Square",
    "fare": 12.50,
    "estimatedDuration": 15,
    "actualDuration": 8,
    "distance": 2.5,
    "createdAt": "2024-02-19T22:45:00Z"
  }
}
```

### Cancel Ride

**Endpoint:** `POST /rides/{rideId}/cancel`

**Description:** Cancel an active or scheduled ride

**Request Body:**
```json
{
  "reason": "Driver not arriving",
  "feedback": "Driver was not responding to messages"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ride_123abc",
    "status": "cancelled",
    "cancellationFee": 2.50,
    "refundAmount": 10.00
  }
}
```

### Rate Ride

**Endpoint:** `POST /rides/{rideId}/rate`

**Description:** Rate and provide feedback for a completed ride

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Great driver, clean car",
  "categories": {
    "cleanliness": 5,
    "driving": 5,
    "communication": 4
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ride_123abc",
    "rating": 5,
    "feedbackSubmitted": true
  }
}
```

## Drivers API

### Get Available Rides

**Endpoint:** `GET /drivers/available-rides`

**Description:** Get list of available ride requests near driver location

**Query Parameters:**
- `latitude` (required): Driver's current latitude
- `longitude` (required): Driver's current longitude
- `radius` (optional): Search radius in km (default: 5)
- `limit` (optional): Maximum results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ride_123abc",
      "pickupAddress": "123 Main St",
      "dropoffAddress": "Times Square",
      "distance": 1.2,
      "estimatedFare": 12.50,
      "pickupTime": 5,
      "riderRating": 4.8
    }
  ]
}
```

### Accept Ride

**Endpoint:** `POST /drivers/rides/{rideId}/accept`

**Description:** Accept a ride request

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ride_123abc",
    "status": "accepted",
    "riderDetails": {
      "name": "John Doe",
      "rating": 4.8,
      "phone": "+1 (555) 123-4567"
    },
    "pickupAddress": "123 Main St",
    "dropoffAddress": "Times Square"
  }
}
```

### Update Driver Status

**Endpoint:** `PUT /drivers/status`

**Description:** Update driver online/offline status

**Request Body:**
```json
{
  "isOnline": true,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isOnline": true,
    "lastUpdated": "2024-02-19T22:45:00Z"
  }
}
```

### Complete Ride

**Endpoint:** `POST /drivers/rides/{rideId}/complete`

**Description:** Mark ride as completed

**Request Body:**
```json
{
  "finalLat": 40.7580,
  "finalLng": -73.9855,
  "actualDistance": 2.5,
  "actualDuration": 8
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ride_123abc",
    "status": "completed",
    "finalFare": 12.50,
    "earnings": 10.00,
    "completedAt": "2024-02-19T22:53:00Z"
  }
}
```

## Payments API

### Get Payment Methods

**Endpoint:** `GET /payments/methods`

**Description:** Get available payment methods for user

**Response:**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "cash",
        "name": "Cash",
        "available": true
      }
    ]
  }
}
```

### Record Cash Payment

**Endpoint:** `POST /payments/cash`

**Description:** Record cash payment for completed ride

**Request Body:**
```json
{
  "rideId": "ride_123abc",
  "amountPaid": 15.00,
  "tip": 2.50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_123abc",
    "rideId": "ride_123abc",
    "amount": 15.00,
    "tip": 2.50,
    "status": "completed",
    "timestamp": "2024-02-19T22:53:00Z"
  }
}
```

## Users API

### Get User Profile

**Endpoint:** `GET /users/profile`

**Description:** Get authenticated user's profile

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1 (555) 123-4567",
    "role": "rider",
    "rating": 4.8,
    "totalRides": 45,
    "joinedAt": "2023-01-15T00:00:00Z"
  }
}
```

### Update User Profile

**Endpoint:** `PUT /users/profile`

**Description:** Update user profile information

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1 (555) 123-4567",
  "emergencyContact": "+1 (555) 987-6543"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "updatedAt": "2024-02-19T22:45:00Z"
  }
}
```

## Analytics API

### Get Ride Statistics

**Endpoint:** `GET /analytics/rides`

**Description:** Get ride statistics for time period

**Query Parameters:**
- `startDate` (required): Start date (ISO 8601)
- `endDate` (required): End date (ISO 8601)
- `period` (optional): Aggregation period (day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRides": 1247,
    "totalRevenue": 12470,
    "averageFare": 9.99,
    "averageRating": 4.7,
    "completionRate": 96.2,
    "byDay": [
      {
        "date": "2024-02-19",
        "rides": 156,
        "revenue": 1560,
        "averageRating": 4.8
      }
    ]
  }
}
```

### Get Driver Earnings

**Endpoint:** `GET /analytics/driver-earnings`

**Description:** Get driver earnings for time period

**Query Parameters:**
- `startDate` (required): Start date
- `endDate` (required): End date
- `driverId` (optional): Specific driver ID

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 3450.00,
    "totalRides": 156,
    "averagePerRide": 22.12,
    "byDay": [
      {
        "date": "2024-02-19",
        "earnings": 245.00,
        "rides": 12,
        "averagePerRide": 20.42
      }
    ]
  }
}
```

### Get Platform Metrics

**Endpoint:** `GET /analytics/platform`

**Description:** Get overall platform metrics (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "activeDrivers": 89,
    "activeRiders": 342,
    "totalRides": 1247,
    "totalRevenue": 12470,
    "averageRating": 4.7,
    "completionRate": 96.2,
    "peakHour": "18:00-19:00",
    "topRoute": "Downtown → Airport"
  }
}
```

## Promo Codes API

### Apply Promo Code

**Endpoint:** `POST /promos/apply`

**Description:** Apply promo code to ride

**Request Body:**
```json
{
  "code": "WELCOME20",
  "rideId": "ride_123abc"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": "WELCOME20",
    "discount": 2.50,
    "discountType": "fixed",
    "newFare": 10.00,
    "originalFare": 12.50
  }
}
```

### Get Available Promos

**Endpoint:** `GET /promos/available`

**Description:** Get available promo codes for user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "WELCOME20",
      "description": "20% off first ride",
      "discount": 20,
      "discountType": "percentage",
      "expiresAt": "2024-12-31T23:59:59Z"
    }
  ]
}
```

## Support API

### Create Support Ticket

**Endpoint:** `POST /support/tickets`

**Description:** Create a new support ticket

**Request Body:**
```json
{
  "title": "Driver was late",
  "description": "Driver arrived 15 minutes late",
  "category": "driver_behavior",
  "rideId": "ride_123abc",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ticket_123abc",
    "title": "Driver was late",
    "status": "open",
    "priority": "medium",
    "createdAt": "2024-02-19T22:45:00Z"
  }
}
```

### Get Support Tickets

**Endpoint:** `GET /support/tickets`

**Description:** Get user's support tickets

**Query Parameters:**
- `status` (optional): Filter by status (open, in_progress, resolved)
- `limit` (optional): Maximum results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket_123abc",
      "title": "Driver was late",
      "status": "open",
      "priority": "medium",
      "createdAt": "2024-02-19T22:45:00Z",
      "updatedAt": "2024-02-19T22:50:00Z"
    }
  ]
}
```

## Webhooks

Webhooks allow you to receive real-time notifications about ride events.

### Supported Events

- `ride.created` - New ride requested
- `ride.accepted` - Driver accepted ride
- `ride.started` - Ride started
- `ride.completed` - Ride completed
- `ride.cancelled` - Ride cancelled
- `payment.completed` - Payment processed

### Webhook Payload

```json
{
  "event": "ride.completed",
  "timestamp": "2024-02-19T22:53:00Z",
  "data": {
    "rideId": "ride_123abc",
    "status": "completed",
    "fare": 12.50,
    "rating": 5
  }
}
```

### Register Webhook

**Endpoint:** `POST /webhooks`

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/rideshare",
  "events": ["ride.completed", "payment.completed"]
}
```

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.rideshare.com/api',
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`
  }
});

// Request a ride
const ride = await api.post('/rides', {
  pickupLat: 40.7128,
  pickupLng: -74.0060,
  dropoffLat: 40.7580,
  dropoffLng: -73.9855
});

console.log(ride.data);
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {JWT_TOKEN}'
}

response = requests.post(
    'https://api.rideshare.com/api/rides',
    headers=headers,
    json={
        'pickupLat': 40.7128,
        'pickupLng': -74.0060,
        'dropoffLat': 40.7580,
        'dropoffLng': -73.9855
    }
)

print(response.json())
```

### cURL

```bash
curl -X POST https://api.rideshare.com/api/rides \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLat": 40.7128,
    "pickupLng": -74.0060,
    "dropoffLat": 40.7580,
    "dropoffLng": -73.9855
  }'
```

## Support

For API support, contact: `api-support@rideshare.com`

## Changelog

### v1.0.0 (2024-02-19)
- Initial API release
- Rides, Drivers, Payments, Users endpoints
- Analytics and Promo Codes support
- Webhook integration
