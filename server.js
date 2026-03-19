require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || process.env.BASE_PATH || ''; 

let mountPath = '';
let baseHref = '/';

if (BASE_URL) {
    // 1. 전체 URL (http...) 형태인 경우 파싱, 아니면 그냥 경로로 취급
    if (BASE_URL.startsWith('http')) {
        const parsed = new URL(BASE_URL);
        mountPath = parsed.pathname;
        baseHref = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    } else {
        mountPath = BASE_URL.startsWith('/') ? BASE_URL : `/${BASE_URL}`;
        baseHref = mountPath.endsWith('/') ? mountPath : `${mountPath}/`;
    }
    // Express mount path 치환을 위해 끝에 달린 '/' 제거 (루트 제외)
    if (mountPath.length > 1 && mountPath.endsWith('/')) {
        mountPath = mountPath.slice(0, -1);
    }
}

app.use(cors());
app.use(express.json());

// 동적으로 index.html을 읽어 <base> 태그를 절대 주소로 주입
app.get([mountPath || '/', `${mountPath}/`, '/index.html'], (req, res) => {
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    html = html.replace('<!-- BASE_HREF_PLACEHOLDER -->', `<base href="${baseHref}">`);
    res.send(html);
});

// 정적 파일 서빙
const staticOptions = { index: false };
if (mountPath && mountPath !== '/') {
    app.use(mountPath, express.static('./', staticOptions));
}
app.use(express.static('./', staticOptions));

// Unified Fortune API Proxy (환경 변수 경로 지원)
app.post([`${mountPath}/api/fortune`, '/api/fortune'], async (req, res) => {
    const { name, birthdate, gender } = req.body;
    
    if (!name || !birthdate) {
        return res.status(400).json({ error: "Name and Birthdate are required" });
    }

    const apiBase = process.env.API_BASE || process.env.OPENAI_API_BASE;
    const apiKey = process.env.API_KEY || process.env.OPENAI_API_KEY;
    const model = process.env.MODEL || process.env.OPENAI_MODEL;

    if (!apiBase || !apiKey || !model) {
        return res.status(500).json({ error: "Server API configuration missing" });
    }

    const currentTime = new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: false,
        timeZone: 'Asia/Seoul'
    }).format(new Date());

    const systemPromptTemplate = (process.env.SYSTEM_PROMPT || `당신은 계명대학교 쪽문에 위치한 '통계학 도사'입니다. \n아주 용하고 영험하지만, 한편으로는 매우 익살스럽고 B급 감성이 넘칩니다.\n손님 이름: {{name}}, 생년월일: {{birthdate}}, 성별: {{gender}}\n\n다음 6가지 분야에 대해 아주 코믹하고 위트 있게 통계 용어를 섞어서 점괘를 봐주세요:\n1. 공부운: GPA 예측 신뢰구간, 교수님과의 상관계수(양수/음수/무상관), F학점 회피 확률(%), 벼락치기 성공 가능성, R/Python 에러 관상\n2. 연애운: 캠퍼스 내 이상형 표본 추출 확률, 썸→연애 전환의 유의수준(p-value), 이별 리스크 분산 수준, 짝사랑 성취 가능성\n3. 재물운: 등록금 환급 가능성, 편의점 알바 vs 과외 수익 기댓값, 불필요한 지출 이상치(outlier) 경보\n4. 건강운: 기말고사 기간 생존분석(survival rate), 수면 부족 누적 위험도, 라면 과다 섭취 부작용 경보, 멘탈 붕괴 임계점 예측\n5. 행운의 비방: 이달의 행운 아이템(통계/학업 소품), 행운의 컬러, 행운의 숫자(통계적 근거 필수), 이달의 금기사항\n6. 총운: 종합 운세 등급(S/A+/A/B+/B/C/D/F/NaN 중 하나), 이달의 한줄 운세, 소장의 한마디(B급 코멘트 필수)\n\n응답은 반드시 아래 JSON 형식으로만 해주세요 (Markdown 형식 제외하고 순수가 JSON만):\n{\n  "study": "...",\n  "love": "...",\n  "money": "...",\n  "health": "...",\n  "item": "...",\n  "total": "운세 등급: [등급]. [한줄평] [소장의 한마디]"\n}`)
        .replace(/\\n/g, '\n'); // .env의 \n 문자를 실제 줄바꿈으로 변환

    const prompt = systemPromptTemplate
        .replace(/{{name}}/g, name)
        .replace(/{{birthdate}}/g, birthdate)
        .replace(/{{gender}}/g, gender || '남성')
        .replace(/{{currentTime}}/g, currentTime);

    console.log(`Prompt length: ${prompt.length} chars. (Starts with: ${prompt.substring(0, 30)}...)`);

    const isGoogle = apiBase.includes("generativelanguage.googleapis.com");
    let apiUrl = "";
    let body = {};
    let headers = { "Content-Type": "application/json" };

    try {
        const baseUrl = apiBase.replace(/\/$/, "");
        if (isGoogle && !baseUrl.includes("openai")) {
            // Google Native
            const cleanModel = model.replace(/^models\//, "");
            const baseUri = baseUrl.replace(/\/v1beta$/, ""); // Remove duplicate v1beta
            apiUrl = `${baseUri}/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
            body = { contents: [{ parts: [{ text: prompt }] }] };
        } else {
            // OpenAI or Google OpenAI-Compatible
            apiUrl = `${baseUrl}/chat/completions`;
            if (isGoogle && !apiUrl.includes("?key=")) apiUrl += `?key=${apiKey}`;
            
            headers["Authorization"] = `Bearer ${apiKey}`;
            body = {
                model: model.replace(/^models\//, ""), 
                messages: [{ role: "user", content: prompt }],
                temperature: 0.8
            };
        }

        console.log(`Calling LLM API: ${apiUrl.replace(apiKey, "REDACTED")}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`LLM Error: ${JSON.stringify(data)}`);
        }

        let content = "";
        if (isGoogle && !baseUrl.includes("openai")) {
            content = data.candidates[0].content.parts[0].text;
        } else {
            content = data.choices[0].message.content;
        }

        let jsonString = content;
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
            jsonString = content.substring(startIndex, endIndex + 1);
            jsonString = jsonString.replace(/```json|```/g, '').trim();
            // JSON 파싱 에러 방지를 위한 추가 치환: 
            // 1. 제어 문자(줄바꿈, 탭 등) 처리 
            jsonString = jsonString.replace(/[\n\r\t]/g, ' '); 
            // 2. 값 내부에 포함된 큰따옴표 이스케이프 또는 대체 시도 (완벽하진 않으나 대부분의 스마트 따옴표, 따옴표 중첩 문제 해소)
            jsonString = jsonString.replace(/“/g, '"').replace(/”/g, '"').replace(/‘/g, "'").replace(/’/g, "'");
        } else {
            console.error("JSON 형식을 찾을 수 없음. LLM 응답:\n", content);
            throw new Error("도사님이 잠시 딴생각을 하셨습니다(형식 오류). 다시 복채를 내보세요!");
        }

        try {
            res.json(JSON.parse(jsonString));
        } catch (e) {
            console.error("JSON 파싱 에러:", e, "\n대상 문자열:", jsonString);
            throw new Error("도사님의 점괘를 해석할 수 없습니다(파싱 오류). 다시 시도해주세요!");
        }

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Master's Room started at http://localhost:${PORT}`);
});
