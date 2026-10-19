# Lộ trình

## ✅ Hiện tại

- [x] Bản đồ 34 tỉnh, pan/zoom/pinch, chọn tỉnh, tìm kiếm không dấu
- [x] Hoàng Sa, Trường Sa
- [x] Trang tỉnh, trang địa danh, trình xem GLB 360°
- [x] Pipeline bản đồ, pipeline nén mô hình

## Nội dung

- [ ] Xuất toàn bộ mô hình từ Blender (Nhà thờ Núi, tháp Ponagar…)
- [ ] Ảnh thumbnail cho mỗi mô hình (render từ Blender), hiển thị trong danh sách
- [ ] Chuyển dữ liệu địa danh sang CMS hoặc DB qua `LandmarkRepository`, upload GLB lên R2/S3

## Hướng web game

Tham khảo các game nông trại hoặc khám phá bản đồ:

- [ ] **Tiến trình người chơi:** "đã ghé thăm" tỉnh, sưu tầm địa danh. Thêm vào zustand store với middleware `persist` (localStorage), sau đó đồng bộ server khi có tài khoản.
- [ ] **Mở khoá dần:** tỉnh chưa mở hiển thị xám, mở khi hoàn thành nhiệm vụ. Thêm `data-locked` cho `ProvinceLayer` và CSS tương ứng.
- [ ] **Đối tượng trên bản đồ:** thêm một `<g>` overlay trong layer của `VietnamMap` cho pin hoặc nhân vật. Toạ độ dùng hệ viewBox, tức cùng hệ với `label`/`bounds` của tỉnh.
- [ ] **Bản đồ 3D:** extrude path các tỉnh thành mesh (`three` `ExtrudeGeometry` từ chính các path đã sinh) rồi đặt mô hình GLB lên trên, R3F đã có sẵn.
- [ ] **Âm thanh:** howler.js. **Hiệu ứng UI:** `motion` (đã cài).
- [ ] **Backend realtime** (nếu cần nhiều người chơi): Supabase Realtime hoặc Colyseus.
- [ ] Đổi `?tinh=` sang route song song hoặc intercepting route nếu muốn panel có URL riêng và hỗ trợ nút back.
