'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function GamePlayPage({
  params,
}: {
  params: Promise<{ setId: string }> | { setId: string };
}) {
  const router = useRouter();

  // Giải mã params an toàn
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const setId = resolvedParams?.setId;

  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      if (!setId) return;

      try {
        setLoading(true);
        
        // CÚ CHỐT NẰM Ở ĐÂY: Thêm cache: 'no-store' để cấm Next.js dùng lại dữ liệu lỗi cũ
        const res = await fetch(`/api/topics/${setId.toUpperCase()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        const json = await res.json();

        if (json.success && json.data) {
          setGameData(json.data);
        } else {
          setGameData(null);
        }
      } catch (err) {
        console.error('Lỗi nạp màn chơi:', err);
        setGameData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [setId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-xl font-bold animate-pulse mb-2 text-blue-400">
            ⏳ Đang tải nội dung nhiệm vụ...
          </div>
          <p className="text-slate-400 text-sm">Mã màn: {setId}</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4 font-sans">
        <div className="text-2xl font-bold text-red-400">
          ❌ Không tìm thấy màn chơi ({setId})!
        </div>
        <p className="text-slate-400 text-sm">
          Vui lòng kiểm tra lại ID đường dẫn hoặc cơ sở dữ liệu.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
        >
          Quay lại Danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Nút quay lại */}
        <button
          onClick={() => router.push('/')}
          className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          ← Quay lại danh sách
        </button>

        {/* Header thông tin màn chơi */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-blue-400">
              Nhiệm vụ: {gameData.set_id}
            </h1>
            <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full">
              {gameData.mechanic_type}
            </span>
          </div>
          <p className="text-slate-300">{gameData.story_context}</p>
        </div>

        {/* Bài viết giả lập (Simulated Post) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
            📱 Bài viết giả lập trên Mạng xã hội
          </h2>

          <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-blue-400">
                {gameData.simulated_post?.author?.[0] || 'U'}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {gameData.simulated_post?.author || 'Anonymous User'}
                </p>
                <p className="text-xs text-slate-500">Vừa xong</p>
              </div>
            </div>

            <p className="text-slate-200 text-base leading-relaxed">
              {gameData.simulated_post?.content ||
                (typeof gameData.simulated_post === 'string'
                  ? gameData.simulated_post
                  : JSON.stringify(gameData.simulated_post))}
            </p>
          </div>
        </div>

        {/* Bẫy / Traps cần tìm */}
        <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            🔍 Danh sách bẫy tâm lý / Thông tin sai lệch:
          </h2>
          <div className="space-y-2">
            {Array.isArray(gameData.traps) &&
              gameData.traps.map((trap: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-700 p-3 rounded-lg text-sm text-slate-300"
                >
                  <span className="font-bold text-amber-400 mr-2">
                    Bẫy {idx + 1}:
                  </span>
                  {trap.matched_text || trap.text || trap.target_text || JSON.stringify(trap)}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}