'use client';

import { useState, useRef } from 'react';
import ResultSection from '@/components/ResultSection';

const EXAMPLE_DATA = {
  age: '3세',
  activities: '큐브자석 블럭, 점토',
  classAttitude: '참을성 부족, 기다리기 어려움, 자신이 좋아하는 활동에만 집중',
  peerRelationship: '사회성 부족, 친구들과 갈등 발생',
  growthPoints: '편식',
  improvementPoints: '감정 및 행동 조절',
};

export default function Home() {
  const [age, setAge] = useState('5세');
  const [activities, setActivities] = useState('');
  const [classAttitude, setClassAttitude] = useState('');
  const [peerRelationship, setPeerRelationship] = useState('');
  const [growthPoints, setGrowthPoints] = useState('');
  const [improvementPoints, setImprovementPoints] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const fillExample = () => {
    setAge(EXAMPLE_DATA.age);
    setActivities(EXAMPLE_DATA.activities);
    setClassAttitude(EXAMPLE_DATA.classAttitude);
    setPeerRelationship(EXAMPLE_DATA.peerRelationship);
    setGrowthPoints(EXAMPLE_DATA.growthPoints);
    setImprovementPoints(EXAMPLE_DATA.improvementPoints);
    setShowExample(false);
  };

  const handleGenerate = async () => {
    if (!activities.trim()) {
      alert('좋아하는 놀이나 활동을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          activities,
          classAttitude,
          peerRelationship,
          growthPoints,
          improvementPoints,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || '오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setResult(fullText);
        }
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAge('5세');
    setActivities('');
    setClassAttitude('');
    setPeerRelationship('');
    setGrowthPoints('');
    setImprovementPoints('');
    setResult('');
  };

  return (
    <main className="min-h-screen bg-yellow-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-4xl mb-2">☀️</div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            예지를 위한 유치원생활기록부 유아발달상황
            <br />
            진욱봇
          </h1>
          <p className="text-gray-600 text-sm">
            생기부 유아발달상황을 대신 작성해드릴게요 🌟 키워드로 쉽게 입력해서 더 많이 도와드릴 수
            있어요!
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Example Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowExample(!showExample)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              example
            </button>
          </div>

          {showExample && (
            <div className="mb-5 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-gray-700 mb-3 font-medium">아래 예시 데이터로 채울까요?</p>
              <div className="text-xs text-gray-600 space-y-1 mb-3">
                <p>• 연령: {EXAMPLE_DATA.age}</p>
                <p>• 좋아하는 활동: {EXAMPLE_DATA.activities}</p>
                <p>• 수업태도: {EXAMPLE_DATA.classAttitude}</p>
                <p>• 또래관계: {EXAMPLE_DATA.peerRelationship}</p>
                <p>• 칭찬할 점: {EXAMPLE_DATA.growthPoints}</p>
                <p>• 개선할 점: {EXAMPLE_DATA.improvementPoints}</p>
              </div>
              <button
                onClick={fillExample}
                className="text-sm bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
              >
                예시로 채우기
              </button>
            </div>
          )}

          {/* Age Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">유아 연령</label>
            <div className="flex gap-5">
              {['3세', '4세', '5세'].map((a) => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="age"
                    value={a}
                    checked={age === a}
                    onChange={() => setAge(a)}
                    className="w-4 h-4 accent-yellow-400"
                  />
                  <span className="text-sm text-gray-700">{a}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text Fields */}
          {[
            {
              label: '좋아하는 놀이나 활동',
              value: activities,
              setter: setActivities,
              placeholder: '예) 보드게임, 블록쌓기, 그림 그리기',
            },
            {
              label: '수업태도와 활동 참여도',
              value: classAttitude,
              setter: setClassAttitude,
              placeholder: '예) 바른자세, 모범, 적극적 참여',
            },
            {
              label: '또래관계에서의 특성',
              value: peerRelationship,
              setter: setPeerRelationship,
              placeholder: '예) 도움, 배려심, 리더십',
            },
            {
              label: '성장한 모습이나 칭찬할 점',
              value: growthPoints,
              setter: setGrowthPoints,
              placeholder: '예) 어휘력, 창의적 표현, 감정 조절',
            },
            {
              label: '개선할 점',
              value: improvementPoints,
              setter: setImprovementPoints,
              placeholder: '예) 없음, 집중력, 순서 기다리기',
            },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="relative">
                <textarea
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  rows={2}
                  className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition"
                />
                {value && (
                  <button
                    onClick={() => setter('')}
                    className="absolute right-2.5 bottom-2.5 text-gray-300 hover:text-gray-500"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              초기화
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  작성 중...
                </>
              ) : (
                '생기부 1초 짓! ✨'
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        {(result || loading) && (
          <div ref={resultRef} className="mt-8">
            <ResultSection result={result} loading={loading} />
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-10">
          GPT-4o 기반 · 결과는 참고용이며 교사의 검토가 필요합니다
        </p>
      </div>
    </main>
  );
}
