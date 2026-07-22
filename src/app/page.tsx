'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Định nghĩa cấu trúc dữ liệu màn chơi
interface TopicSummary {
  set_id: string;
  theme: string[];
  story_context: string;
  mechanic_type: string;
}

export default function Home() {
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu từ SQLite/Prisma khi vào trang
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch('/api/topics');
        const json = await res.json();
        if (json.success) {
          setTopics(json.data);
        }
      } catch (error) {
        console.error('Lỗi lấy danh sách màn chơi:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-extrabold text-blue-400">
            🎮 UNESCO Hackathon - Chọn Nhiệm Vụ
          </h1>
          <p className="text-slate-400 mt-1">
            Danh sách các bài toán rèn luyện kỹ năng nhận biết thông tin giả
          </p>
        </header>

        {loading ? (
          <div className="text-center py-12 text-slate-400 animate-pulse">
            ⏳ Đang tải danh sách màn chơi từ Database...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((item) => (
              <div
                key={item.set_id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-600/20 text-blue-400 font-bold px-3 py-1 rounded-md text-sm border border-blue-500/30">
                      Màn: {item.set_id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.mechanic_type}
                    </span>
                  </div>

                  <p className="text-slate-200 text-sm mt-3 line-clamp-3">
                    {item.story_context}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.theme.map((tag, index) => (
                      <span
                        key={index}
                        className="text-[11px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/play/${item.set_id}`}
                  className="mt-5 block w-full text-center py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  Vào chơi
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}