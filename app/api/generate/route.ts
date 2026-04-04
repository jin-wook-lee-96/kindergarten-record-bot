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
교사가 입력한 유아 정보를 바탕으로 유치원생활기록부의 유아발달상황을 두 파트로 나누어 작성해 주세요.

[출력 형식 - 반드시 준수]
아래 순서대로 총 11개 섹션을 작성하세요. 번호, 불릿(-), 별표(**), 마크다운 기호는 절대 사용하지 마세요.
각 섹션은 헤더 + 빈 줄 하나 + 하나의 연속된 문단(줄바꿈 없이)으로 구성하세요.

--- 누리과정 5개 영역 ---

[신체운동•건강]

(8~12문장의 연속 문단)

[의사소통]

(8~12문장의 연속 문단)

[사회관계]

(8~12문장의 연속 문단)

[예술경험]

(8~12문장의 연속 문단)

[자연탐구]

(8~12문장의 연속 문단)

--- 입력 항목별 상세 서술 ---

[좋아하는 놀이나 활동]

(입력된 활동을 중심으로 8~12문장의 연속 문단)

[수업태도와 활동 참여도]

(입력된 수업태도를 중심으로 8~12문장의 연속 문단)

[또래관계에서의 특성]

(입력된 또래관계 특성을 중심으로 8~12문장의 연속 문단)

[성장한 모습이나 칭찬할 점]

(입력된 칭찬할 점을 중심으로 8~12문장의 연속 문단)

[개선할 점]

(입력된 개선할 점을 중심으로 8~12문장의 연속 문단. 가정 연계 방법도 포함.)

📌요약

(전체 내용을 종합한 하나의 긴 문단. 가정 연계 지도 권고사항으로 마무리.)

[작성 규칙]
- 번호 목록, 불릿(-), 굵게(**), 기울임(*) 등 마크다운 서식은 절대 사용하지 마세요.
- 문체는 ~함, ~임, ~보임, ~요구됨 형태의 격식체(간접 서술체)로 작성하세요.
- 각 섹션은 입력된 정보를 구체적인 상황이나 사례로 풀어서 전문적으로 서술하세요.`;

  const userPrompt = `유아 정보:
- 연령: ${age}
- 좋아하는 놀이나 활동: ${activities}
- 수업태도와 활동 참여도: ${classAttitude}
- 또래관계에서의 특성: ${peerRelationship}
- 성장한 모습이나 칭찬할 점: ${growthPoints}
- 개선할 점: ${improvementPoints}

위 정보를 바탕으로 유치원생활기록부 유아발달상황을 5개 누리과정 영역별로 작성하고, 마지막에 📌요약을 작성해 주세요.`;

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
          max_tokens: 4000,
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
