'use client';

import { useState } from 'react';

interface Props {
  result: string;
  loading: boolean;
}

const SECTION_COLORS: Record<string, string> = {
  // 누리과정 영역
  '[신체운동•건강]': 'bg-green-50 border-green-200 text-green-800',
  '[의사소통]': 'bg-blue-50 border-blue-200 text-blue-800',
  '[사회관계]': 'bg-purple-50 border-purple-200 text-purple-800',
  '[예술경험]': 'bg-pink-50 border-pink-200 text-pink-800',
  '[자연탐구]': 'bg-teal-50 border-teal-200 text-teal-800',
  // 입력 항목별
  '[좋아하는 놀이나 활동]': 'bg-orange-50 border-orange-200 text-orange-800',
  '[수업태도와 활동 참여도]': 'bg-sky-50 border-sky-200 text-sky-800',
  '[또래관계에서의 특성]': 'bg-violet-50 border-violet-200 text-violet-800',
  '[성장한 모습이나 칭찬할 점]': 'bg-emerald-50 border-emerald-200 text-emerald-800',
  '[개선할 점]': 'bg-rose-50 border-rose-200 text-rose-800',
  // 요약
  '📌요약': 'bg-yellow-50 border-yellow-300 text-yellow-900',
};

const SECTION_KEYS = [
  '[신체운동•건강]',
  '[의사소통]',
  '[사회관계]',
  '[예술경험]',
  '[자연탐구]',
  '[좋아하는 놀이나 활동]',
  '[수업태도와 활동 참여도]',
  '[또래관계에서의 특성]',
  '[성장한 모습이나 칭찬할 점]',
  '[개선할 점]',
  '📌요약',
];

const NURIWA_SECTIONS = new Set([
  '[신체운동•건강]', '[의사소통]', '[사회관계]', '[예술경험]', '[자연탐구]',
]);

const INPUT_SECTIONS = new Set([
  '[좋아하는 놀이나 활동]', '[수업태도와 활동 참여도]', '[또래관계에서의 특성]',
  '[성장한 모습이나 칭찬할 점]', '[개선할 점]',
]);

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseResult(text: string) {
  const pattern = new RegExp(
    `(${SECTION_KEYS.map(escapeRegex).join('|')})`,
    'g'
  );
  const parts = text.split(pattern);
  const sections: { title: string; content: string }[] = [];

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
  const nuriSections = sections.filter(s => NURIWA_SECTIONS.has(s.title));
  const inputSections = sections.filter(s => INPUT_SECTIONS.has(s.title));
  const summarySections = sections.filter(s => s.title === '📌요약');
  const otherSections = sections.filter(
    s => !NURIWA_SECTIONS.has(s.title) && !INPUT_SECTIONS.has(s.title) && s.title !== '📌요약'
  );

  const isStreaming = loading && sections.length > 0;
  const lastSectionIdx = sections.length - 1;

  const renderCard = (title: string, content: string, idx: number) => {
    const colorClass = SECTION_COLORS[title] || 'bg-gray-50 border-gray-200 text-gray-800';
    const isSummary = title === '📌요약';
    const isLast = sections.findIndex(s => s.title === title && s.content === content) === lastSectionIdx;

    return (
      <div
        key={`${title}-${idx}`}
        className={`rounded-2xl border p-5 ${isSummary ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-100'}`}
      >
        {title && (
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${colorClass}`}>
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
          {isStreaming && isLast && (
            <span className="inline-block w-1.5 h-4 bg-yellow-400 ml-0.5 animate-pulse align-middle" />
          )}
        </p>
      </div>
    );
  };

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

      {/* 누리과정 5개 영역 */}
      {nuriSections.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">누리과정 영역</p>
          <div className="space-y-4">
            {nuriSections.map(({ title, content }, i) => renderCard(title, content, i))}
          </div>
        </div>
      )}

      {/* 입력 항목별 상세 서술 */}
      {inputSections.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">입력 항목별 상세</p>
          <div className="space-y-4">
            {inputSections.map(({ title, content }, i) => renderCard(title, content, i))}
          </div>
        </div>
      )}

      {/* 기타 파싱 안된 섹션 */}
      {otherSections.length > 0 && (
        <div className="space-y-4 mb-6">
          {otherSections.map(({ title, content }, i) => renderCard(title, content, i))}
        </div>
      )}

      {/* 요약 */}
      {summarySections.length > 0 && (
        <div className="space-y-4">
          {summarySections.map(({ title, content }, i) => renderCard(title, content, i))}
        </div>
      )}
    </div>
  );
}
