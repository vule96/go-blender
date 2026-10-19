import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mat-surface grid min-h-dvh place-items-center px-4">
      <div className="max-w-sm rounded-sm bg-paper p-6 shadow-[4px_6px_0_rgb(8_28_22/0.45)]">
        <h1 className="text-2xl font-extrabold type-wide">Không có trang này</h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Đường dẫn có thể đã sai, hoặc tỉnh hay địa danh này chưa có trên GoBlender.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-ink px-4 py-2.5 text-[15px] font-semibold text-paper hover:bg-black"
        >
          Về bản đồ
        </Link>
      </div>
    </main>
  );
}
