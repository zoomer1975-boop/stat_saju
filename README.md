# 🔮 계명대학교 통계학과 운명연구소 (Stat Fortune Shop)

계명대학교 통계학과 학생들을 위한 B급 감성 통계학 사주 풀이 서비스입니다.

## 🚀 주요 기능
- **통계학적 사주**: 이름, 생년월일, 성별을 기반으로 통계 용어를 섞은 위트 있는 점괘 제공
- **6개 분석 섹션**: 공부운, 연애운, 재물운, 건강운, 행운의 비방, 총운
- **실시간 반영**: 현재 날짜와 시간을 인식하여 상황에 맞는 동적 멘트 생성
- **개인화 저장**: 쿠키를 이용한 내 정보 저장 및 자동 불러오기

## 🛠 기술 스택
- **Frontend**: Vanilla HTML/CSS, React (CDN), Babel
- **Backend**: Node.js, Express, node-fetch
- **AI**: Google Gemini / OpenAI API (Proxy 서버 방식)

## 📦 설치 및 실행 방법

1. **저장소 클론**
   ```bash
   git clone https://github.com/zoomer1975-boop/stat_saju.git
   cd stat_saju
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   - `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
   - 필요한 API 키와 정보를 입력합니다.
   ```bash
   cp .env.example .env
   ```

4. **서버 실행**
   ```bash
   npm start
   ```
   - 서비스는 `http://localhost:4000`에서 확인할 수 있습니다.

## ⚠️ 주의사항
- 본 서비스의 점괘는 통계적으로 전혀 유의미하지 않으니 재미로만 즐겨주시기 바랍니다.
- © 2026 계명대 통계학과 운명 연구소
