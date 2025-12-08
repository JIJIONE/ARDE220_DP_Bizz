const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱 미들웨어
app.use(express.json());

// 정적 파일 서빙
app.use(express.static(path.join(__dirname)));
app.use('/image', express.static(path.join(__dirname, 'image')));

// 데이터 파일 경로
const DATA_DIR = path.join(__dirname, 'data');
const EMOTIONS_FILE = path.join(DATA_DIR, 'emotions.json');

// 데이터 폴더 및 파일 초기화
function initDataStore() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(EMOTIONS_FILE)) {
        fs.writeFileSync(EMOTIONS_FILE, JSON.stringify([], null, 2));
    }
}
initDataStore();

// 데이터 읽기
function readEmotions() {
    try {
        const data = fs.readFileSync(EMOTIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// 데이터 저장
function saveEmotions(emotions) {
    fs.writeFileSync(EMOTIONS_FILE, JSON.stringify(emotions, null, 2));
}

// ============ API 엔드포인트 ============

// 모든 감정 기록 조회
app.get('/api/emotions', (req, res) => {
    const emotions = readEmotions();
    res.json({
        success: true,
        data: emotions,
        count: emotions.length
    });
});

// 특정 날짜 감정 기록 조회
app.get('/api/emotions/:date', (req, res) => {
    const { date } = req.params;
    const emotions = readEmotions();
    const filtered = emotions.filter(e => e.date === date);
    res.json({
        success: true,
        data: filtered,
        count: filtered.length
    });
});

// 특정 감정 타입별 조회
app.get('/api/emotions/type/:type', (req, res) => {
    const { type } = req.params;
    const emotions = readEmotions();
    const filtered = emotions.filter(e => 
        e.emotion.toLowerCase() === type.toLowerCase()
    );
    res.json({
        success: true,
        data: filtered,
        count: filtered.length
    });
});

// 새 감정 기록 저장
app.post('/api/emotions', (req, res) => {
    const { emotion, note, date } = req.body;

    if (!emotion || !date) {
        return res.status(400).json({
            success: false,
            message: '감정과 날짜는 필수입니다.'
        });
    }

    const emotions = readEmotions();
    const newEmotion = {
        id: Date.now(),
        emotion: emotion.toUpperCase(),
        note: note || '',
        date: date,
        createdAt: new Date().toISOString()
    };

    emotions.push(newEmotion);
    saveEmotions(emotions);

    console.log(`✨ 새 감정 저장: ${emotion} (${date})`);

    res.status(201).json({
        success: true,
        message: '감정이 저장되었습니다!',
        data: newEmotion
    });
});

// 감정 기록 삭제
app.delete('/api/emotions/:id', (req, res) => {
    const { id } = req.params;
    let emotions = readEmotions();
    const initialLength = emotions.length;
    
    emotions = emotions.filter(e => e.id !== parseInt(id));

    if (emotions.length === initialLength) {
        return res.status(404).json({
            success: false,
            message: '해당 기록을 찾을 수 없습니다.'
        });
    }

    saveEmotions(emotions);

    res.json({
        success: true,
        message: '기록이 삭제되었습니다.'
    });
});

// 통계 API
app.get('/api/stats', (req, res) => {
    const emotions = readEmotions();
    
    // 감정별 카운트
    const emotionCounts = {};
    emotions.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    // 최근 7일 기록
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentEmotions = emotions.filter(e => 
        new Date(e.createdAt) >= weekAgo
    );

    res.json({
        success: true,
        data: {
            total: emotions.length,
            byEmotion: emotionCounts,
            recentWeek: recentEmotions.length
        }
    });
});

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🌟 How are U today? 서버 시작!       ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║   🌐 URL: http://localhost:${PORT}          ║`);
    console.log('║   📁 데이터: ./data/emotions.json      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
});
