import { OpenAI } from 'openai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { age, activities, classAttitude, peerRelationship, growthPoints, improvementPoints } = body;

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API 키가 설정되지 않았습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = `당신은 유치원 교사를 위한 생활기록부 작성 전문가입니다.
교사가 입력한 유아 정보를 바탕으로 유치원생활기록부의 유아발달상황을 따뜻하고 전문적으로 작성해 주세요.

[출력 형식 - 반드시 준수]
아래 순서대로 총 11개 섹션을 빠짐없이 작성하세요. 번호, 불릿(-), 별표(**), 마크다운 기호는 절대 사용하지 마세요.
각 섹션은 헤더 + 빈 줄 하나 + 하나의 연속된 문단(줄바꿈 없이)으로 구성하세요.

[신체운동•건강]

(문단)

[의사소통]

(문단)

[사회관계]

(문단)

[예술경험]

(문단)

[자연탐구]

(문단)

📌요약

(문단)

[좋아하는 놀이나 활동]

(문단)

[수업태도와 활동 참여도]

(문단)

[또래관계에서의 특성]

(문단)

[성장한 모습이나 칭찬할 점]

(문단)

[개선할 점]

(문단)

📌요약

(문단)

[작성 규칙]
- 각 섹션당 10~15문장의 충분히 긴 문단으로 작성하세요. 문단 내 줄바꿈 없이 이어서 쓰세요.
- 번호 목록, 불릿 기호(-), 굵게(**), 기울임(*) 등 마크다운 서식은 절대 사용하지 마세요.
- 문체는 ~함, ~임, ~보임, ~요구됨 형태의 격식체(간접 서술체)로 작성하세요.
- 단순히 사실을 나열하지 말고, 구체적인 상황과 에피소드를 풍부하게 담아 생동감 있게 서술하세요.
- 유아의 좋아하는 활동, 수업태도, 또래관계, 칭찬할 점, 개선할 점을 각 영역에 자연스럽게 녹여 서술하세요.
- 각 문장은 앞 문장과 자연스럽게 이어지도록 흐름을 유지하며, 유아의 성장 가능성과 긍정적인 면을 따뜻하게 표현하세요.
- 📌요약은 전체 내용을 종합하여 더욱 풍부하게 작성하고, 마지막에 가정 연계 지도 권고사항을 구체적으로 포함하세요.
- 【중요】 각 섹션의 첫 문장을 매번 다르게 시작하세요. "유아는"으로 시작하는 것을 금지합니다. 아래와 같이 다양한 방식으로 시작하세요.
  예시 시작 표현: "활동 시간에", "또래 친구들과", "일과 중", "교실에서", "놀이 장면을 살펴보면", "평소 생활 속에서", "자유선택활동 시간이면", "교사의 안내에", "관찰 결과", "이 시기의 발달 특성상" 등 섹션마다 다른 표현으로 시작할 것.`;

  const userPrompt = `유아 정보:
- 연령: ${age}
- 좋아하는 놀이나 활동: ${activities}
- 수업태도와 활동 참여도: ${classAttitude}
- 또래관계에서의 특성: ${peerRelationship}
- 성장한 모습이나 칭찬할 점: ${growthPoints}
- 개선할 점: ${improvementPoints}

위 정보를 바탕으로 유치원생활기록부 유아발달상황을 5개 누리과정 영역([신체운동•건강], [의사소통], [사회관계], [예술경험], [자연탐구])과 5개 입력 항목별 상세([좋아하는 놀이나 활동], [수업태도와 활동 참여도], [또래관계에서의 특성], [성장한 모습이나 칭찬할 점], [개선할 점]), 그리고 📌요약까지 총 11개 섹션을 빠짐없이 작성해 주세요.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 10000,
        });

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : '알 수 없는 오류';
        controller.enqueue(encoder.encode(`\n오류가 발생했습니다: ${errMsg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
