import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="ocean-surface grid min-h-dvh place-items-center px-4">
      <div className="max-w-sm rounded-3xl border-4 border-sand-300 bg-sand-50 p-6 shadow-2xl">
        <h1 className="font-display text-3xl font-extrabold text-leaf-900">Không có trang này</h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Đường dẫn có thể đã sai, hoặc tỉnh hay địa danh này chưa có trên GoBlender.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-2xl bg-leaf-700 px-5 py-2.5 font-display text-lg font-bold text-white shadow-[0_4px_0_0_var(--color-leaf-900)] transition hover:bg-leaf-600 active:translate-y-0.5"
        >
          Về bản đồ
        </Link>
      </div>
    </main>
  );
}
