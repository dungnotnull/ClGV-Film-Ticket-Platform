# Frontend Issues Tracking

This file tracks active and resolved frontend bugs and issues. The FE-agent should update this file when an issue is discovered or fixed.

| Issue ID | Date Logged | Description | Status | Resolution / Notes |
| -------- | ----------- | ----------- | ------ | ------------------ |
| FE-001   | 2026-08-07  | Lỗi Frontend không render được sơ đồ ghế do Backend thiếu dữ liệu `roomMatrix`. API `GET /api/v1/showtimes/:id/seats` hiện tại chỉ trả về mảng `seats` phẳng, không có dữ liệu `grid` để biết vị trí khoảng trống (aisle) giữa các ghế. | OPEN   | **Yêu cầu Backend update:** Trong `showtime.service.ts` -> `getShowtimeSeats`, cần lấy thêm trường `roomMatrix` từ bảng `hall` và map trả về dưới dạng thuộc tính `matrix` trong response. |
