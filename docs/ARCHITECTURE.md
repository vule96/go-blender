# Kiến trúc

## Nguyên tắc

- **Một nguồn chuẩn cho mỗi loại dữ liệu.** `entities/province/model/provinces.ts` định nghĩa 34 tỉnh (`as const satisfies`). Kiểu `ProvinceId` được suy ra từ đây, nên mọi chỗ dùng id tỉnh (dữ liệu địa danh, URL, store) đều được kiểm tra kiểu. Test đảm bảo dữ liệu bản đồ đã sinh khớp với danh sách này.
- **Validate tại biên.** Dữ liệu từ ngoài vào (seed, env, sau này là API hoặc CMS) đều đi qua zod. Bên trong ứng dụng chỉ dùng kiểu đã được validate.
- **Repository pattern.** UI chỉ phụ thuộc vào interface `LandmarkRepository`. Khi đổi từ seed tĩnh sang Postgres/Supabase/CMS, chỉ cần thêm một implementation mới.
- **Import trực tiếp, không dùng barrel file** (`index.ts` re-export). Mỗi file import đúng module nó cần, ví dụ `@/entities/province/model/provinces`. Nhờ vậy bundler không kéo theo dữ liệu bản đồ (khoảng 260 KB) vào những chunk không dùng tới. Đây là quy tắc `bundle-barrel-imports` trong skill vercel-react-best-practices.
- **Chỉ gửi xuống client những gì client dùng.** Trang bản đồ truyền `LandmarkListItem` (slug, tên, loại, có mô hình hay không) thay cho cả bản ghi địa danh.
- **Server Component mặc định.** Chỉ những phần thật sự cần tương tác (bản đồ, trình xem 3D) mới là client component. three.js được tách thành chunk riêng bằng `next/dynamic`, nên trang bản đồ không phải tải nó.

## Cache Components và `params`

`params` và `searchParams` là dữ liệu từ URL. Với Cache Components, mọi chỗ đọc chúng phải nằm trong `<Suspense>`, kể cả khi giá trị đã có sẵn từ `generateStaticParams`. Nếu không, `next dev` báo lỗi `instant-shell-url-data`. Vì vậy các trang động có dạng:

```tsx
export default function Page({ params }: PageProps<'/tinh/[provinceId]'>) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content params={params} /> {/* await params ở đây */}
    </Suspense>
  );
}
```

Link tới các trang này dùng `prefetch`, nên khi bấm thì nội dung đã được tải trước và hiện ngay. Trang bản đồ đọc `?tinh=` bằng `useSearchParams`, nên cũng được bọc trong Suspense.

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
- **Nhãn không đè nhau** (`lib/label-tiers.ts`, có test). Lúc tải module, nhãn được xếp theo thứ tự ưu tiên: Hà Nội trước, sau đó tỉnh lớn trước. Nhãn nào đè lên nhãn đã đặt thì lùi xuống mức zoom sâu hơn. CSS hiện từng mức dựa trên `data-zoom` (overview, detail, close) mà hook pan/zoom ghi lên thẻ `<svg>`.
- Lưới kinh, vĩ độ và bóng của cả nước (`land`) được sinh sẵn bởi `map:build`.
- Khi bottom sheet trên mobile che bản đồ, `flyToBounds` nhận `insets` để tỉnh được chọn nằm trong vùng còn nhìn thấy.
- Hỗ trợ bàn phím: Tab tới tỉnh, Enter hoặc Space để chọn. Tôn trọng `prefers-reduced-motion`.

## Trình xem 3D (`features/model-viewer`)

- `useGLTF(url, false, true)`: bật giải nén meshopt. Bộ giải mã đi kèm three nên không phải tải từ CDN.
- `<Bounds fit clip observe>` tự căn camera theo kích thước mô hình, nên mô hình xuất từ Blender không cần chuẩn hoá tỉ lệ.
- Ánh sáng studio dựng bằng `Lightformer`, không cần tải file HDRI.
- Server kiểm tra file `.glb` có tồn tại không (`shared/lib/asset-exists.ts`). Nếu chưa có thì hiện placeholder, trình duyệt không phải tải một file bị 404. Lỗi khi đọc file được bắt bởi error boundary bên trong `<Canvas>`, nên WebGL context không bị huỷ.
- Chunk three.js được tải trước khi người dùng rê chuột hoặc focus vào link tới địa danh có mô hình (`LandmarkLink`, `preloadModelScene`).

## Hiệu năng

- Dữ liệu bản đồ được chiếu sẵn lúc build và import dạng JSON, không có d3 trong bundle.
- `/models/*` được cache 1 ngày, kèm `stale-while-revalidate` 7 ngày (xem `next.config.ts`). Khi chuyển sang CDN, đặt tên file có version (ví dụ `nha-tho-nui.v2.glb`) và để cache `immutable`.
- `optimizePackageImports` cho three và drei.
