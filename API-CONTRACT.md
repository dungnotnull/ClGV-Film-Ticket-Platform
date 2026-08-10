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
| `409` | `DUPLICATE_CINEMA_NAME` | Cinema cluster name already exists in system |
| `409` | `DUPLICATE_HALL_NAME` | Hall/room name already exists in cinema cluster |
| `422` | `TICKET_EXPIRED` | QR Ticket past expiration time |
| `422` | `INVALID_HMAC_SIGNATURE` | Tampered or invalid HMAC-SHA256 signature on QR scan |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected backend server error |

---

## 2. REST API Endpoints

### 2.0 File Upload Module (`/upload`) *(Authenticated)*

#### `POST /upload`
* **Headers**: `Authorization: Bearer <JWT>`, `Content-Type: multipart/form-data`
* **Form Field**: `file` (File Binary - Max 5MB, JPG/PNG/WEBP/GIF)
* **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "url": "http://localhost:4000/uploads/image-1770560000000-123456789.png",
      "filename": "image-1770560000000-123456789.png",
      "originalName": "banner.png",
      "mimeType": "image/png",
      "size": 102400
    }
  }
  ```

---

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
* **Response `200 OK`**: `{ "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }`

#### `GET /auth/me`
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: `{ "success": true, "data": { "id": "usr_101", "email": "user@example.com", "fullName": "Nguyen Van A", "role": "CUSTOMER", "membershipTier": "MEMBER", "points": 0, "cgvCardBalance": 0 } }`

---

### 2.1b Admin User Management (`/admin/users`) *(Admin Only)*

#### `GET /admin/users`
* **Headers**: `Authorization: Bearer <JWT>`
* **Query Parameters**: `role` (`CUSTOMER`, `ADMIN`, `SCANNER`), `membershipTier` (`MEMBER`, `U22_FANC`, `VIP`, `VVIP`), `search`, `page`, `limit`
* **Response `200 OK`**: Paginated array of user objects excluding passwords.

#### `GET /admin/users/{id}`
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: User profile detail including recent booking history and ticket counts.

#### `PUT /admin/users/{id}/role`
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "role": "ADMIN" }`
* **Response `200 OK`**: Updated user object with new role.

#### `PUT /admin/users/{id}/membership`
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "membershipTier": "VIP", "points": 500, "cgvCardBalance": 1000000, "isU22Verified": true }`
* **Response `200 OK`**: Updated user object with new tier and balance values.

#### `DELETE /admin/users/{id}`
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: `{ "success": true, "message": "Xóa người dùng thành công" }`

---

### 2.2 Cities & Dynamic Homepage Aggregator (`/cities`, `/admin/cities`, `/home`)

#### `GET /cities`
* **Response `200 OK`**: Returns list of cities/locations with total cinema counts.
  ```json
  {
    "success": true,
    "data": [
      { "id": "city_hcm", "name": "TP. Hồ Chí Minh", "code": "HCM", "displayOrder": 1, "cinemaCount": 12 },
      { "id": "city_hn", "name": "Hà Nội", "code": "HN", "displayOrder": 2, "cinemaCount": 8 }
    ]
  }
  ```

#### `GET /cities/{id}`
* **Response `200 OK`**: City detail with assigned cinemas.

#### `POST /admin/cities` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "name": "Cần Thơ", "code": "CT", "displayOrder": 4 }`
* **Response `201 Created`**: Returns newly created city object.

#### `PUT /admin/cities/{id}` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "name": "TP. Cần Thơ", "displayOrder": 4 }`

#### `DELETE /admin/cities/{id}` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`

#### `GET /home`
* **Query Parameters**: `cityId` (optional)
* **Response `200 OK`**: Dynamic homepage aggregator data created by Admin.
  ```json
  {
    "success": true,
    "data": {
      "banners": [ { "id": "b1", "title": "Happy Wednesday", "imageUrl": "...", "linkUrl": "..." } ],
      "movies": {
        "nowShowing": [ { "id": "m1", "title": "Mai", "status": "NOW_SHOWING", "posterUrl": "..." } ],
        "comingSoon": [ { "id": "m2", "title": "Avatar 3", "status": "COMING_SOON", "posterUrl": "..." } ]
      },
      "cities": [ { "id": "city_hcm", "name": "TP. Hồ Chí Minh", "code": "HCM", "cinemaCount": 12 } ],
      "featuredCinemas": [ { "id": "c1", "name": "CGV Vincom Đồng Khởi", "address": "72 Lê Thánh Tôn, Q.1" } ]
    }
  }
  ```

---

### 2.3 Banners CMS Module (`/banners`, `/admin/banners`)

#### `GET /banners/active`
* **Response `200 OK`**: Array of active promotional banners.

#### `GET /admin/banners` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: List of all banners.

#### `POST /admin/banners` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "title": "Culture Day", "imageUrl": "https://...", "linkUrl": "/promotions/culture-day", "displayOrder": 1, "status": "ACTIVE" }`
* **Response `201 Created`**: Returns created banner object.

#### `DELETE /admin/banners/{id}` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`

---

### 2.4 Cinemas & Halls Module (`/cinemas`, `/halls`)

#### `GET /cinemas`
* **Query Parameters**: `cityId` (optional)
* **Response `200 OK`**: List of cinema clusters filtered dynamically by city with assigned halls and amenities.

#### `GET /cinemas/{id}`
* **Response `200 OK`**: Detailed cinema info.

#### `POST /cinemas` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "cityId": "city_hcm",
    "name": "CGV Vincom Đồng Khởi",
    "address": "72 Lê Thánh Tôn, Q.1, TP.HCM",
    "phone": "1900 6017",
    "amenities": ["Parking", "Popcorn Bar", "IMAX Screen"]
  }
  ```

#### `POST /halls` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "cinemaId": "c1", "name": "Hall 1 (IMAX)", "screenType": "IMAX", "roomMatrix": { ... } }`

#### `GET /halls/{id}/matrix`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "hallId": "hall_03",
      "name": "Hall 3 (IMAX)",
      "screenType": "IMAX",
      "cinemaName": "CGV Vincom Đồng Khởi",
      "matrix": {
        "dimensions": { "rows": 8, "cols": 10 },
        "aisles": { "vertical": [4], "horizontal": [4] },
        "grid": [ ... ]
      }
    }
  }
  ```

#### `PUT /halls/{id}/matrix` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "roomMatrix": { ... } }`

---

### 2.5 Movie Catalog Module (`/movies`, `/admin/movies`)

#### `GET /movies`
* **Query Parameters**: `status` (`NOW_SHOWING`, `COMING_SOON`), `genre`, `search`
* **Response `200 OK`**: Array of movie objects.

#### `GET /movies/{id}`
* **Response `200 OK`**: Movie detail including upcoming showtimes and user reviews.

#### `POST /admin/movies` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "title": "Mai",
    "titleOriginal": "Mai (2024)",
    "director": "Trấn Thành",
    "cast": "Phương Anh Đào, Tuấn Trần",
    "genres": ["Tâm lý", "Tình cảm"],
    "durationMinutes": 131,
    "releaseDate": "2024-02-10T00:00:00Z",
    "posterUrl": "https://images.cgv.vn/poster/mai.jpg",
    "trailerUrl": "https://youtube.com/watch?v=123",
    "ageRating": "T18",
    "languageType": "SUB",
    "status": "NOW_SHOWING",
    "description": "Nội dung phim Mai..."
  }
  ```

#### `PUT /admin/movies/{id}` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`

#### `DELETE /admin/movies/{id}` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`

---

### 2.6 Showtime Scheduler Module (`/showtimes`, `/admin/showtimes`)

#### `GET /showtimes`
* **Query Parameters**: `movieId`, `cinemaId`, `date` (`YYYY-MM-DD`)
* **Response `200 OK`**: Array of showtime objects with hall, movie, cinema info.

#### `GET /showtimes/{id}/seats`
* **Response `200 OK`**: Real-time showtime seat grid and seat statuses (`AVAILABLE`, `HOLDING`, `SOLD`).

#### `POST /admin/showtimes` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "movieId": "mov_88",
    "cinemaId": "cin_01",
    "hallId": "hall_03",
    "startTime": "2026-08-10T14:00:00Z",
    "endTime": "2026-08-10T16:15:00Z",
    "basePrice": 120000
  }
  ```
* **Conflict Check Error `409 Conflict`**: Returns `SHOWTIME_CONFLICT` if overlaps with existing showtimes + 15 min cleaning buffer.

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

### 2.5 F&B Combos Module (`/combos`, `/admin/combos`)

#### `GET /combos`
* **Response `200 OK`**: Array of popcorn & drink combos with prices and image URLs.

#### `POST /admin/combos` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "title": "CGV Combo 1", "description": "1 Bắp Ngọt + 2 Nước Ngọt", "price": 119000 }`

---

### 2.6 CGV Vouchers & Coupons Module (`/vouchers`, `/admin/vouchers`)

#### `GET /admin/vouchers` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Query Params**: `search` (string), `status` (`ACTIVE` | `INACTIVE`), `page` (number), `limit` (number)
* **Response `200 OK`**: Paginated list of vouchers with usage stats.

#### `GET /admin/vouchers/:id` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: Detailed voucher object with stats (`totalClaimed`, `totalUsed`, `totalBookingsApplied`).

#### `POST /admin/vouchers` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "code": "CGV50K",
    "title": "Giảm 50K cho đơn từ 200K",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 50000,
    "minOrderValue": 200000,
    "maxDiscountAmount": 100000,
    "status": "ACTIVE",
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }
  ```

#### `PUT /admin/vouchers/:id` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: Partial object of `CreateVoucherDto`.
* **Response `200 OK`**: Updated voucher object.

#### `DELETE /admin/vouchers/:id` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: Deleted voucher or soft-deactivated (INACTIVE if used in bookings).

#### `POST /admin/vouchers/assign` *(Admin Only)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "voucherId": "vch_uuid_123",
    "userIds": ["usr_uuid_1", "usr_uuid_2"]
  }
  ```
* **Response `200 OK`**: `{ "message": "Phát tặng thành công cho 2 người dùng", "count": 2 }`

#### `GET /vouchers/available` *(Public / Customer)*
* **Response `200 OK`**: Array of active & non-expired public vouchers, with `isClaimed` flag.

#### `GET /vouchers/wallet` *(Customer)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Query Params**: `status` (`UNUSED` | `USED` | `EXPIRED`)
* **Response `200 OK`**: Array of user's stored vouchers with `walletStatus`.

#### `POST /vouchers/claim` *(Customer)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "code": "CGV50K" }`
* **Response `200 OK`**: UserVoucher object added to wallet.

#### `POST /vouchers/apply` *(Customer)*
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "code": "CGV50K", "orderAmount": 250000 }`
* **Response `200 OK`**:
  ```json
  {
    "valid": true,
    "voucherId": "vch_uuid_123",
    "code": "CGV50K",
    "title": "Giảm 50K",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 50000,
    "discountAmount": 50000,
    "orderAmount": 250000,
    "finalAmount": 200000
  }
  ```

---


### 2.7 CGV E-Wallet & Member Card (`/cgv-card`)

#### `POST /cgv-card/topup`
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**: `{ "amount": 500000, "paymentMethod": "ATM" }`

#### `GET /cgv-card/balance`
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: Balance amount in VND, loyalty points, and transaction history.

---

### 2.8 Ticket & QR Scanner Check-in (`/tickets`)

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

### 2.7 Admin Dashboard & Operational Analytics (`/admin/analytics`) *(Admin Only)*

#### `GET /admin/analytics/dashboard`
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: Overview metrics including total revenue, tickets sold, active movies, overall occupancy %, top movies, and recent bookings.

#### `GET /admin/analytics/revenue`
* **Headers**: `Authorization: Bearer <JWT>`
* **Query Parameters**: `startDate`, `endDate`, `cinemaId`, `movieId`
* **Response `200 OK`**: Detailed revenue metrics breakdown by cinema, movie, and daily timeline.

#### `GET /admin/analytics/occupancy`
* **Headers**: `Authorization: Bearer <JWT>`
* **Query Parameters**: `cinemaId`, `date` (`YYYY-MM-DD`)
* **Response `200 OK`**: Hall & showtime occupancy percentage analytics (`soldSeats` / `totalSeats` * 100%).

#### `GET /admin/analytics/members`
* **Headers**: `Authorization: Bearer <JWT>`
* **Response `200 OK`**: Membership tier distribution (`MEMBER`, `U22_FANC`, `VIP`, `VVIP`), total points issued, and U22 verification stats.

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

### 2.9 VietQR Payment Gateway (Phase 6 Dev) (`/payments/vietqr`)

#### `POST /payments/vietqr/create-url`
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "bookingId": "bk_99812",
    "amount": 250000,
    "orderInfo": "Thanh toan ve xem phim"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "paymentMethod": "VIETQR",
    "paymentUrl": "https://img.vietqr.io/image/970423-1234567890-compact2.png?amount=250000&addInfo=CLGV_bk_99812&accountName=CLGV%20FILM%20TICKET%20PLATFORM",
    "vietQrImageUrl": "https://img.vietqr.io/image/970423-1234567890-compact2.png?amount=250000&addInfo=CLGV_bk_99812&accountName=CLGV%20FILM%20TICKET%20PLATFORM",
    "qrPayload": "00020101021238570010A00000072701270006970423...",
    "qrDataUrl": "data:image/png;base64,...",
    "bankInfo": {
      "bankName": "TPBank",
      "bin": "970423",
      "accountNo": "1234567890",
      "accountName": "CLGV FILM TICKET PLATFORM",
      "amount": 250000,
      "addInfo": "CLGV_bk_99812"
    }
  }
  ```

#### `POST /payments/vietqr/callback`
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "bookingId": "bk_99812",
    "status": "SUCCESS"
  }
  ```
* **Response `200 OK`**: `{ "success": true, "message": "Xác nhận thanh toán VietQR thành công", "data": { ... } }`

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

