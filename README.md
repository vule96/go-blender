# GoBlender

Bản đồ Việt Nam tương tác với **34 tỉnh, thành** (theo đơn vị hành chính từ 01/7/2025). Bấm vào một tỉnh để xem các địa danh nổi bật, mỗi địa danh có thể có **mô hình 3D dựng bằng Blender**, xoay 360° ngay trên trình duyệt.

Dự án được thiết kế để sau này có thể phát triển thành web game: bản đồ dạng SVG có thể điều khiển camera, state tách khỏi UI, có sẵn lớp 3D (React Three Fiber).

## Bắt đầu

Yêu cầu Node.js **22.11 trở lên** (xem `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Lệnh                                       | Việc                                                               |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `npm run dev`                              | Chạy dev server (Turbopack)                                        |
| `npm run build` / `npm start`              | Build production / chạy bản build                                  |
| `npm run check`                            | typecheck + lint + test, nên chạy trước khi commit                 |
| `npm run typecheck`                        | Sinh type cho route (`next typegen`) rồi chạy `tsc`                |
| `npm run lint` / `lint:fix`                | ESLint (typescript-eslint strict, type-checked)                    |
| `npm run format`                           | Prettier (có sắp xếp class Tailwind)                               |
| `npm test`                                 | Vitest                                                             |
| `npm run map:build`                        | Sinh lại dữ liệu bản đồ từ GeoJSON (`-- --fresh` để tải lại nguồn) |
| `npm run model:optimize -- in.glb out.glb` | Nén mô hình GLB bằng meshopt và đổi texture sang WebP              |

## Công nghệ

- **Next.js 16** (App Router, Turbopack, Cache Components, typed routes) và **React 19**
- **TypeScript 6** ở chế độ nghiêm ngặt nhất: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`…
- **Tailwind CSS v4**, font Be Vietnam Pro + Baloo 2 (tự host, không gọi Google Fonts)
- **three.js + @react-three/fiber + drei** để xem mô hình 3D
- **zustand** cho state phía client, **zod** để validate dữ liệu và biến môi trường
- **d3-geo + topojson** chỉ dùng lúc build bản đồ, không đưa vào bundle trình duyệt
- **Vitest**, **ESLint 9** (flat config), **Prettier**

> TypeScript được ghim ở `~6.0` vì typescript-eslint chưa hỗ trợ TS 7. Khi typescript-eslint hỗ trợ thì có thể nâng lên.

## Cấu trúc

Tổ chức theo hướng feature-sliced: tầng dưới không import tầng trên.

```
src/
├── app/                      Route (chỉ ghép các phần lại, không chứa logic)
│   ├── page.tsx              Trang bản đồ
│   ├── tinh/[provinceId]/    Trang tỉnh (34 trang tĩnh)
│   └── dia-danh/[slug]/      Trang địa danh + trình xem 3D
├── features/
│   ├── map-explorer/         Bản đồ: pan/zoom/pinch, chọn tỉnh, panel thông tin
│   └── model-viewer/         Canvas R3F, chỉ tải phía client
├── entities/
│   ├── province/             Danh sách 34 tỉnh (nguồn chuẩn), hình học bản đồ, minimap
│   └── landmark/             Schema zod, dữ liệu mẫu, repository
└── shared/                   config (env, site), lib, ui dùng chung
scripts/map/                  Pipeline GeoJSON → SVG
public/models/                File .glb
```

Chi tiết xem [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Hướng phát triển thành game xem [docs/ROADMAP.md](docs/ROADMAP.md).

## Thêm địa danh và mô hình 3D

1. **Xuất từ Blender:** File → Export → glTF 2.0, chọn Format **glTF Binary (.glb)**, tích _Apply Modifiers_. Chỉ chọn mesh, bỏ camera và đèn.
2. **Nén:**
   ```bash
   npm run model:optimize -- ~/Desktop/nha-tho-nui.glb public/models/nha-tho-nui.glb
   ```
3. **Khai báo** trong `src/entities/landmark/model/landmarks.seed.ts`:
   ```ts
   {
     slug: 'nha-tho-nui-nha-trang',
     name: 'Nhà thờ Núi (Chánh Tòa Kitô Vua)',
     provinceId: 'khanh-hoa',          // gõ sai id sẽ báo lỗi ngay khi typecheck
     category: 'religious',
     summary: '…',
     coordinates: { lat: 12.2466, lng: 109.1886 },
     model: { path: '/models/nha-tho-nui.glb' },
   }
   ```

Dữ liệu mẫu được zod kiểm tra khi build và khi chạy test. Nếu slug sai định dạng, thiếu trường hoặc `path` không kết thúc bằng `.glb`, build sẽ báo lỗi.

### Đưa mô hình lên CDN

Khi số lượng mô hình tăng, không nên commit file `.glb` vào repo. Upload lên object storage (Cloudflare R2, S3, Vercel Blob…) rồi đặt:

```bash
# .env.local
NEXT_PUBLIC_ASSET_BASE_URL=https://cdn.example.com
```

`assetUrl('/models/x.glb')` sẽ trỏ sang `https://cdn.example.com/models/x.glb`. Code UI không cần sửa. Khi muốn quản lý qua CMS hoặc database, viết một `LandmarkRepository` mới (xem `entities/landmark/api`).

## Bản đồ

`npm run map:build` tải ranh giới 34 tỉnh, chuyển sang TopoJSON để các tỉnh dùng chung đường biên, đơn giản hoá (giữ 12% số điểm), bỏ đảo nhỏ dưới 4 km², chiếu Mercator, rồi xuất sẵn các path SVG vào `vietnam-map.generated.json` (khoảng 220 KB, gzip còn khoảng 80 KB). Trình duyệt không phải tính toán phép chiếu nào.

Quần đảo **Hoàng Sa** (thuộc Đà Nẵng) và **Trường Sa** (thuộc Khánh Hòa) không có trong bộ dữ liệu nguồn, nên được vẽ từ toạ độ các đảo trong script.

**Nguồn dữ liệu:** Bản đồ đơn vị hành chính Việt Nam (sapnhap.bando.com.vn), chuẩn hoá bởi [vietnamese-provinces-database](https://github.com/ThangLeQuoc/vietnamese-provinces-database) (MIT).
