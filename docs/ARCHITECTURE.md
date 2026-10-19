# Kiến trúc

## Nguyên tắc

- **Một nguồn chuẩn cho mỗi loại dữ liệu.** `entities/province/model/provinces.ts` định nghĩa 34 tỉnh (`as const satisfies`). Kiểu `ProvinceId` được suy ra từ đây, nên mọi chỗ dùng id tỉnh (dữ liệu địa danh, URL, store) đều được kiểm tra kiểu. Test đảm bảo dữ liệu bản đồ đã sinh khớp với danh sách này.
- **Validate tại biên.** Dữ liệu từ ngoài vào (seed, env, sau này là API hoặc CMS) đều đi qua zod. Bên trong ứng dụng chỉ dùng kiểu đã được validate.
- **Repository pattern.** UI chỉ phụ thuộc vào interface `LandmarkRepository`. Khi đổi từ seed tĩnh sang Postgres/Supabase/CMS, chỉ cần thêm một implementation mới.
- **Server Component mặc định.** Chỉ những phần thật sự cần tương tác (bản đồ, trình xem 3D) mới là client component. three.js được tách thành chunk riêng bằng `next/dynamic`, nên trang bản đồ không phải tải nó.

## Bản đồ (`features/map-explorer`)

```
VietnamMap
├── usePanZoom(svgRef, layerRef)   camera: wheel/drag/pinch/double-click/flyTo
│     ghi thẳng transform lên <g> trong requestAnimationFrame, không re-render React
│     đặt --map-k (mức zoom) và data-zoom để CSS điều chỉnh nhãn và nét vẽ
├── ProvinceLayer (memo)           34 <path>, xử lý sự kiện tập trung ở <g> cha
└── MapLabels (memo)               nhãn tỉnh, biển, quần đảo
```

- **Camera** (`lib/viewport.ts`) là các hàm thuần, có unit test: `zoomAround`, `constrain`, `fitBounds`, `interpolate` (zoom nội suy theo log để chuyển động đều).
- **State** (`model/map-store.ts`, zustand + `subscribeWithSelector`): `selectedId`, `hoveredId`. Module khác (HUD game, cảnh 3D, analytics) có thể subscribe mà không cần truyền props.
- **URL** `?tinh=khanh-hoa` đồng bộ hai chiều với store, nên có thể chia sẻ link tới một tỉnh.
- Nét viền dùng `vector-effect: non-scaling-stroke`, nên giữ nguyên độ dày khi zoom. Cỡ chữ nhãn giảm theo `pow(k, 0.65)` để luôn dễ đọc.
- Khi bottom sheet trên mobile che bản đồ, `flyToBounds` nhận `insets` để tỉnh được chọn nằm trong vùng còn nhìn thấy.
- Hỗ trợ bàn phím: Tab tới tỉnh, Enter hoặc Space để chọn. Tôn trọng `prefers-reduced-motion`.

## Trình xem 3D (`features/model-viewer`)

- `useGLTF(url, false, true)`: bật giải nén meshopt. Bộ giải mã đi kèm three nên không phải tải từ CDN.
- `<Bounds fit clip observe>` tự căn camera theo kích thước mô hình, nên mô hình xuất từ Blender không cần chuẩn hoá tỉ lệ.
- Ánh sáng studio dựng bằng `Lightformer`, không cần tải file HDRI.
- Lỗi tải mô hình được bắt bởi error boundary bên trong `<Canvas>` rồi báo ra ngoài, nên WebGL context không bị huỷ. Thông báo lỗi và tiến độ tải hiển thị bằng DOM thường.

## Hiệu năng

- Dữ liệu bản đồ được chiếu sẵn lúc build và import dạng JSON, không có d3 trong bundle.
- `/models/*` được cache 1 ngày, kèm `stale-while-revalidate` 7 ngày (xem `next.config.ts`). Khi chuyển sang CDN, đặt tên file có version (ví dụ `nha-tho-nui.v2.glb`) và để cache `immutable`.
- `optimizePackageImports` cho three và drei.
