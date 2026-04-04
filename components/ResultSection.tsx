'use client';

import { useState } from 'react';

interface Props {
  result: string;
  loading: boolean;
}

const SECTION_COLORS: Record<string, string> = {
  '[신체운동•건강]': 'bg-green-50 border-green-200 text-green-800',
  '[의사소통]': 'bg-blue-50 border-blue-200 text-blue-800',
  '[사회관계]': 'bg-purple-50 border-purple-200 text-purple-800',
  '[예술경험]': 'bg-pink-50 border-pink-200 text-pink-800',
  '[자연탐구]': 'bg-teal-50 border-teal-200 text-teal-800',
  '📌요약': 'bg-yellow-50 border-yellow-300 text-yellow-900',
};

function parseResult(text: string) {
  const sections: { title: string; content: string }[] = [];
  const sectionPattern = /(\[신체운동•건강\]|\[의사소통\]|\[사회관계\]|\[예술경험\]|\[자연탐구\]|📌요약)/g;

  const parts = text.split(sectionPattern);

  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim();
    const content = (parts[i + 1] || '').trim();
    if (title && content) {
      sections.push({ title, content });
    }
  }

  if (sections.length === 0 && text.trim()) {
    sections.push({ title: '', content: text.trim() });
  }

  return sections;
}

export default function ResultSection({ result, loading }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  const sections = parseResult(result);

  return (
    <div>
      {/* Result Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📄 생성된 유아발달상황</h2>
        {result && !loading && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                복사됨!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                전체 복사
              </>
            )}
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && sections.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-3">
            <svg className="animate-spin w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">GPT-4o가 열심히 작성 중입니다...</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map(({ title, content }, i) => {
          const colorClass = SECTION_COLORS[title] || 'bg-gray-50 border-gray-200 text-gray-800';
          const isSummary = title === '📌요약';

          return (
            <div
              key={i}
              className={`rounded-2xl border p-5 ${isSummary ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-100'}`}
            >
              {title && (
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${colorClass}`}
                  >
                    {title}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(content)}
                    title="이 섹션 복사"
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content}
                {loading && i === sections.length - 1 && (
                  <span className="inline-block w-1.5 h-4 bg-yellow-400 ml-0.5 animate-pulse align-middle" />
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
