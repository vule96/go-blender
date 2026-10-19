import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="ocean grid min-h-dvh place-items-center px-4 text-center text-white">
      <div className="space-y-4">
        <p className="font-display text-7xl font-extrabold">404</p>
        <p className="text-lg">Vùng biển này chưa có trên bản đồ.</p>
        <Link
          href="/"
          className="inline-block rounded-full bg-white px-5 py-2.5 font-semibold text-ocean-700 shadow"
        >
          Về bản đồ
        </Link>
      </div>
    </main>
  );
}
