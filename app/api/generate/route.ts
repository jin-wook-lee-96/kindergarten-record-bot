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
아래 형식을 정확히 따르세요. 번호, 불릿(-), 별표(**), 마크다운 기호는 절대 사용하지 마세요.

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

[작성 규칙]
- 각 영역당 10~15문장의 충분히 긴 문단으로 작성하세요. 문단 내 줄바꿈 없이 이어서 쓰세요.
- 번호 목록, 불릿 기호(-), 굵게(**), 기울임(*) 등 마크다운 서식은 절대 사용하지 마세요.
- 문체는 ~함, ~임, ~보임, ~요구됨 형태의 격식체(간접 서술체)로 작성하세요.
- 단순히 사실을 나열하지 말고, 구체적인 상황과 에피소드를 풍부하게 담아 생동감 있게 서술하세요.
- 예를 들어 "블록 놀이를 좋아함"이 아니라 "블록을 하나씩 쌓아올리며 무너지지 않도록 집중하는 모습을 자주 보이며, 완성된 구조물을 바라보며 뿌듯해하는 표정을 짓기도 함"처럼 구체적으로 묘사하세요.
- 유아의 좋아하는 활동, 수업태도, 또래관계, 칭찬할 점, 개선할 점을 각 영역에 자연스럽게 녹여 서술하세요.
- 각 문장은 앞 문장과 자연스럽게 이어지도록 흐름을 유지하며, 유아의 성장 가능성과 긍정적인 면을 따뜻하게 표현하세요.
- 📌요약은 전체 내용을 종합하여 더욱 풍부하게 작성하고, 마지막에 가정 연계 지도 권고사항을 구체적으로 포함하세요.`;

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
          max_tokens: 6000,
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
