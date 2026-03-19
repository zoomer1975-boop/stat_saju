/* script.js - Comic Fortune Shop (Secure Proxy Version) */

const { useState, useEffect } = React;

// No more API Keys here! Calling local proxy.
const PROXY_URL = "api/fortune";

const LOADING_MESSAGES = [
    "동자삼 하나 건져올리는 중...",
    "부채를 활짝 펼치고 데이터를 읽는 중...",
    "동전을 던져 p-value를 확인하는 중...",
    "천기누설! 통계적 유의성을 검토 중...",
    "귀무가설 기각! 당신의 운명은 유의미합니다...",
    "신뢰구간 95%로 미래를 추정하는 중...",
    "표본 추출 완료, 운명 모집단을 분석하는 중...",
    "회귀분석으로 전생을 역추정하는 중...",
    "산점도에 당신의 팔자를 점찍는 중...",
    "이상치(outlier) 제거 후 사주를 정제하는 중...",
    "중심극한정리에 따라 운명이 수렴하는 중...",
    "잔차 분석으로 전생의 업보를 측정하는 중...",
    "족보 데이터베이스를 쿼리하는 중...",
    "지도교수님께 운명 결과를 컨펌받는 중...",
    "기말고사보다 어려운 팔자를 채점하는 중...",
    "논문 심사보다 혹독한 운명 검토 중...",
    "R 패키지로 명리학 라이브러리를 로드하는 중...",
    "신령님의 API 응답을 기다리는 중...",
    "무당 할머니가 깃허브 커밋을 확인하는 중...",
    "오행(五行)을 원-핫 인코딩하는 중...",
    "전생 데이터를 크롤링하는 중...",
    "사주 모델 학습률(learning rate)을 조정하는 중...",
    "천간지지를 데이터프레임으로 변환하는 중...",
    "신내림 테스트(Turing Test)를 통과하는 중...",
    "운명전쟁49를 시청하고 점괘를 받아오는 중...",
    "과적합(overfitting)된 인연을 정규화하는 중...",
    "SPSS가 응답없음 상태입니다. 잠시 후 운명을 재시도합니다...",
    "엑셀로 사주를 돌리다 파일이 깨졌습니다. 복구 중...",
    "교수님 연구실 불이 켜져있어 운명 상담이 지연되고 있습니다...",
    "수강신청보다 치열한 인연 자리를 확보하는 중...",
    "레포트 제출 마감보다 급한 운명을 처리하는 중...",
    "GPT에게 물어봤지만 사주는 저희가 더 잘 압니다...",
    "운명 예측 모델의 train/test split을 조정하는 중...",
    "과거 전생 데이터로 미래를 파인튜닝하는 중...",
    "드롭아웃 없이 운명 신경망을 훈련하는 중...",
    "배치 사이즈 8자(八字)로 운명을 병렬 처리하는 중...",
    "운명이란 결국 조건부 확률입니다. 계산하는 중...",
    "당신의 팔자는 정규분포를 따르지 않습니다...",
    "대수의 법칙에 따르면 결국 평균으로 회귀합니다...",
    "이 운명은 재현 불가능한 실험입니다. 단 한 번뿐...",
    "n=1 연구입니다. 일반화에 주의하세요...",
    "성주신이 클라우드 서버로 이전했습니다. 마이그레이션 중...",
    "삼신할미가 출산율 데이터를 분석하는 중...",
    "저승사자가 생존분석(survival analysis)을 실행하는 중...",
    "도깨비가 이상치를 제거하고 돌아오는 중...",
    "산신령님이 오프라인 상태입니다. 캐시된 운명을 불러오는 중...",
];

const App = () => {
    const [screen, setScreen] = useState('input');
    const [name, setName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [gender, setGender] = useState('남성');
    const [saveInfo, setSaveInfo] = useState(false);

    const setCookie = (cookieName, value, days) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${cookieName}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
    };

    const getCookie = (cookieName) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${cookieName}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return '';
    };
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const savedName = getCookie('saju_name');
        const savedBirthdate = getCookie('saju_birthdate');
        const savedGender = getCookie('saju_gender');

        if (savedName) setName(savedName);
        if (savedBirthdate) setBirthdate(savedBirthdate);
        if (savedGender) setGender(savedGender);
        if (savedName || savedBirthdate || savedGender) setSaveInfo(true);
    }, []);

    useEffect(() => {
        if (screen === 'loading') {
            const interval = setInterval(() => {
                setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [screen]);

    const runFortune = async (e) => {
        e.preventDefault();
        if (!name || !birthdate) return alert("성함과 생년월일을 모두 기입해주세요.");

        if (saveInfo) {
            setCookie('saju_name', name, 365);
            setCookie('saju_birthdate', birthdate, 365);
            setCookie('saju_gender', gender, 365);
        } else {
            setCookie('saju_name', '', -1);
            setCookie('saju_birthdate', '', -1);
            setCookie('saju_gender', '', -1);
        }

        setScreen('loading');

        try {
            const fortuneData = await getFortuneFromProxy(name, birthdate, gender);
            setResult(fortuneData);
            setScreen('result');
        } catch (err) {
            console.error("Master's voice is lost:", err);
            alert(`신령님의 목소리가 들리지 않습니다.\n(${err.message})`);
            setScreen('input');
        }
    };

    const getFortuneFromProxy = async (uName, uBirthdate, uGender) => {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: uName, birthdate: uBirthdate, gender: uGender })
        });

        if (!response.ok) {
            const errorJson = await response.json().catch(() => ({ error: "Unknown error" }));
            throw new Error(errorJson.error || response.statusText);
        }

        return await response.json();
    };

    return (
        <div className="shop-container">
            <div className="header">
                <h1>🔮 통계학 도사 v2.1</h1>
            </div>

            {screen === 'input' && (
                <form onSubmit={runFortune}>
                    <p style={{ textAlign: 'center', color: '#666' }}>천기를 누설하러 오셨는가? <br />성함, 생년월일, 성별을 적고 복채를 내시게.</p>
                    <div className="form-group">
                        <label>성함 (이름)</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="예: 무당" />
                    </div>
                    <div className="form-group">
                        <label>생년월일</label>
                        <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>성별</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.8)' }}>
                            <option value="남성">남성</option>
                            <option value="여성">여성</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', display: 'flex', gap: '8px' }}>
                        <input type="checkbox" id="saveInfoCheck" checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)} style={{ width: 'auto' }} />
                        <label htmlFor="saveInfoCheck" style={{ marginBottom: 0, cursor: 'pointer', fontSize: '14px' }}>내 정보 저장 (자동 불러오기)</label>
                    </div>
                    <button type="submit" className="shop-button">내 운명 확인하러 가기 🏮</button>
                </form>
            )}

            {screen === 'loading' && (
                <div className="loading-box">
                    <div className="incense-smoke">🌫️</div>
                    <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{LOADING_MESSAGES[loadingMsgIdx]}</p>
                    <p style={{ color: '#8b0000' }}>도사님이 영감을 얻는 중... 잠시만요.</p>
                </div>
            )}

            {screen === 'result' && (
                <div>
                    <div className="total-score">
                        {result.total}
                    </div>

                    <div className="scroll-item">
                        <div className="scroll-title">📖 공부 주술</div>
                        <div>{result.study}</div>
                    </div>

                    <div className="scroll-item">
                        <div className="scroll-title">💖 캠퍼스 연애</div>
                        <div>{result.love}</div>
                    </div>

                    <div className="scroll-item">
                        <div className="scroll-title">💰 재물 운세</div>
                        <div>{result.money}</div>
                    </div>

                    <div className="scroll-item">
                        <div className="scroll-title">🏥 건강 분석</div>
                        <div>{result.health}</div>
                    </div>

                    <div className="scroll-item">
                        <div className="scroll-title">🎯 행운의 비방</div>
                        <div>{result.item}</div>
                    </div>

                    <button className="shop-button" onClick={() => setScreen('input')} style={{ marginTop: '20px', background: 'var(--shop-black)' }}>다시 복채 내기</button>
                </div>
            )}

            <div className="footer">
                ※ 이 점괘는 통계적으로 유의미하지 않으니 웃고 넘기십시오. <br />
                © 2026 계명대 통계학과 운명 연구소
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
