# API-CONTRACT.md - Single Source of Truth

> **CRITICAL RULE FOR FE & BE AGENTS**:
> This document is the absolute **Source of Truth** for all API endpoints, data types, payload schemas, HTTP status codes, and WebSocket events.
> **BEFORE** modifying any endpoint implementation, schema, or event name in frontend or backend code, you **MUST read and update this document first**.

---

## 1. Universal Standards & Response Wrapper

Base URL: `http://localhost:4000/api/v1`

### 1.1 Standard Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-08-06T09:15:00.000Z",
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### 1.2 Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "SEAT_ALREADY_HELD",
    "message": "Seat H12 is currently held by another user",
    "details": [
      {
        "field": "seatId",
        "issue": "Lock key lock:seat:st_456:H12 exists in Redis"
      }
    ]
  },
  "timestamp": "2026-08-06T09:15:00.000Z"
}
```

### 1.3 Common Error Codes Matrix
| HTTP Code | Error Code String | Description |
| --- | --- | --- |
| `400` | `BAD_REQUEST` | Validation error, malformed JSON payload |
| `401` | `UNAUTHORIZED` | Missing or expired JWT Access Token |
| `403` | `FORBIDDEN` | Insufficient role permission (e.g. Non-admin accessing scheduling) |
| `404` | `NOT_FOUND` | Resource (Movie, Showtime, Seat) not found |
| `409` | `SEAT_ALREADY_HELD` | Seat locked by another user in Redis/DB |
| `409` | `SHOWTIME_CONFLICT` | Showtime schedule overlaps with existing projection/cleaning buffer |
| `422` | `TICKET_EXPIRED` | QR Ticket past expiration time |
| `422` | `INVALID_HMAC_SIGNATURE` | Tampered or invalid HMAC-SHA256 signature on QR scan |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected backend server error |

---

## 2. REST API Endpoints

### 2.1 Authentication Module (`/auth`)

#### `POST /auth/register`
* **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "fullName": "Nguyen Van A",
    "phone": "0901234567"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "usr_101", "email": "user@example.com", "fullName": "Nguyen Van A", "role": "CUSTOMER" },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

#### `POST /auth/login`
* **Request Payload**: `{ "email": "user@example.com", "password": "SecurePassword123!" }`
* **Response `200 OK`**: `{ "success": true, "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }`

#### `POST /auth/refresh`
* **Request Payload**: `{ "refreshToken": "eyJhbGciOi..." }`
* **Response `200 OK`**: `{ "success": true, "data": { "accessToken": "..." } }`

---

### 2.2 Cinemas & Halls Module (`/cinemas`, `/halls`)

#### `GET /cinemas`
* **Query Parameters**: `city` (optional), `page`, `limit`
* **Response `200 OK`**: List of cinema clusters with address, total halls, amenities.

#### `GET /halls/{id}/matrix`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "hallId": "hall_03",
      "name": "Hall 3 (IMAX)",
      "screenType": "IMAX",
      "matrix": {
        "dimensions": { "rows": 10, "cols": 16 },
        "aisles": { "vertical": [4, 12], "horizontal": [5] },
        "grid": [
          [
            { "id": "A1", "row": "A", "col": 1, "type": "STANDARD", "priceModifier": 1.0, "isBlocked": false },
            { "id": "A2", "row": "A", "col": 2, "type": "VIP", "priceModifier": 1.25, "isBlocked": false }
          ]
        ]
      }
    }
  }
  ```

---

### 2.3 Showtime Scheduler Module (`/showtimes`)

#### `GET /showtimes`
* **Query Parameters**: `movieId`, `cinemaId`, `date` (`YYYY-MM-DD`)
* **Response `200 OK`**: Array of showtime objects including starting/ending time, hall, movie, base ticket price.

#### `POST /showtimes` *(Admin Only)*
* **Request Payload**:
  ```json
  {
    "movieId": "mov_88",
    "hallId": "hall_03",
    "startTime": "2026-08-10T14:00:00Z",
    "endTime": "2026-08-10T16:15:00Z",
    "basePrice": 120000
  }
  ```
* **Conflict Check Error `409 Conflict`**: Returns `SHOWTIME_CONFLICT` if overlaps with existing showtimes + 15 min buffer.

---

### 2.4 Booking & Seat Holding Module (`/bookings`)

#### `POST /bookings/hold-seat`
* **Description**: Sets transient 10-minute Redis lock.
* **Request Payload**:
  ```json
  {
    "showtimeId": "st_456",
    "seatIds": ["H12", "H13"]
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "reservationId": "res_99812",
      "showtimeId": "st_456",
      "heldSeats": ["H12", "H13"],
      "expiresAt": "2026-08-06T09:25:00.000Z",
      "ttlSeconds": 600
    }
  }
  ```
* **Response `409 Conflict`**: Returns `SEAT_ALREADY_HELD` if any requested seat is locked in Redis.

#### `POST /bookings/checkout`
* **Request Payload**:
  ```json
  {
    "reservationId": "res_99812",
    "paymentMethod": "VNPAY",
    "comboIds": [
      { "comboId": "cmb_01", "quantity": 1 }
    ]
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "bookingId": "bkg_77123",
      "totalAmount": 280000,
      "status": "PENDING_PAYMENT",
      "paymentUrl": "http://localhost:4000/api/v1/payments/vnpay/mock-gateway?orderId=bkg_77123&amount=280000",
      "paymentQrPayload": "00020101021238540010A000000727012400069704230110bkg_77123530370454062800005802VN5904CLGV6007HA NOI62190815bkg_7712363041D9C",
      "tickets": [
        {
          "ticketId": "tkt_89f3a12b",
          "seatId": "H12",
          "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      ]
    }
  }
  ```

---

### 2.5 Mock VNPAY Payment Module (`/payments/vnpay`)

#### `POST /payments/vnpay/create-url`
* **Request Payload**: `{ "bookingId": "bkg_77123", "amount": 280000, "orderInfo": "Thanh toan ve xem phim ClGV" }`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "paymentUrl": "http://localhost:4000/api/v1/payments/vnpay/mock-gateway?orderId=bkg_77123",
      "qrPayload": "00020101021238540010A000000727012400069704230110bkg_77123530370454062800005802VN..."
    }
  }
  ```

#### `GET /payments/vnpay/callback`
* **Query Parameters**: `vnp_ResponseCode`, `vnp_TxnRef`, `vnp_Amount`, `vnp_SecureHash`
* **Response `200 OK`**: Updates booking status to `PAID`, triggers seat status `SOLD` broadcast, and returns booking receipt.

---

### 2.5 F&B Combos Module (`/combos`)

#### `GET /combos`
* **Response `200 OK`**: Array of popcorn & drink combos with prices and image URLs.

---

### 2.6 Ticket & QR Scanner Check-in (`/tickets`)

#### `GET /tickets/my-tickets`
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: Array of user's purchased tickets with live QR code strings.

#### `POST /tickets/verify-qr` *(Scanner Endpoint)*
* **Headers**: `X-Scanner-Key: <TURNSTILE_SECRET_KEY>`
* **Request Payload**:
  ```json
  {
    "qrToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "verified": true,
      "ticketId": "tkt_89f3a12b",
      "movieTitle": "Avatar 3",
      "hallName": "Hall 3 (IMAX)",
      "seatId": "H12",
      "status": "CHECKED_IN",
      "checkedInAt": "2026-08-06T09:15:04.000Z"
    }
  }
  ```
* **Response `422 Unprocessable Entity`**: Returns `INVALID_HMAC_SIGNATURE` or `TICKET_ALREADY_USED`.

---

## 3. Real-Time WebSocket Protocol (Socket.io)

Gateway URL: `ws://localhost:4000/socket.io`

### 3.1 Client -> Server Events

#### `join:showtime`
* **Payload**: `{ "showtimeId": "st_456" }`
* **Action**: Connects socket to room `showtime:st_456`. Backend sends initial matrix lock state map.

#### `seat:select`
* **Payload**: `{ "showtimeId": "st_456", "seatId": "H12" }`
* **Action**: Requests Redlock for seat `H12`. On success, broadcasts status update to room.

#### `seat:deselect`
* **Payload**: `{ "showtimeId": "st_456", "seatId": "H12" }`
* **Action**: Releases Redlock key for seat `H12` and broadcasts status update.

---

### 3.2 Server -> Client Events

#### `seat:state_changed`
* **Broadcast Room**: `showtime:{showtimeId}`
* **Payload**:
  ```json
  {
    "showtimeId": "st_456",
    "seatId": "H12",
    "status": "HOLDING",
    "heldByUserId": "usr_101",
    "expiresAt": "2026-08-06T09:25:00.000Z"
  }
  ```
  *(Status options: `AVAILABLE`, `HOLDING`, `RESERVED`, `SOLD`, `BLOCKED`)*
