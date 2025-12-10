document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scrollContainer');
    const sections = Array.from(document.querySelectorAll('.section'));
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const emotionCards = document.querySelectorAll('.emotion-card');

    // 필수 요소 없으면 조용히 종료 (에러 방지)
    if (!container || sections.length === 0) {
        console.error('scrollContainer 또는 .section 요소를 찾을 수 없음');
        return;
    }

    // ============ 파티클(컨페티) 효과 ============
    // 새로운 컨페티 색상
    const confettiColors = [
        '#FBFF65', // 노랑
        '#00CC99', // 민트
        '#FF7EC0', // 핑크
        '#3168F9', // 파랑
        '#B35FF5', // 보라
        '#6DC7FE', // 하늘색
        '#FE0000', // 빨강
        '#F69628'  // 주황
    ];

    function createConfetti() {
        // 컨테이너 생성
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);

        // 파티클 개수
        const particleCount = 80;

        for (let i = 0; i < particleCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // 랜덤 색상
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.backgroundColor = color;
            
            // 랜덤 위치 (화면 전체 너비)
            confetti.style.left = Math.random() * 100 + '%';
            
            // 고정 크기
            confetti.style.width = '6px';
            confetti.style.height = '24px';
            
            // 랜덤 애니메이션 지속 시간
            const duration = Math.random() * 2 + 2;
            confetti.style.animationDuration = duration + 's';
            
            // 랜덤 지연 시간
            const delay = Math.random() * 0.5;
            confetti.style.animationDelay = delay + 's';
            
            // 랜덤 초기 회전
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            confettiContainer.appendChild(confetti);
        }

        // 애니메이션 끝나면 컨테이너 제거
        setTimeout(() => {
            confettiContainer.remove();
        }, 4500);

        console.log('🎉 파티클 효과 실행!');
    }

    // 감정별 설정
    const emotionConfig = {
        happiness: { placeholder: '오늘의 행복을 적어보세요', color: '#CFD500' },
        anticipation: { placeholder: '기대되는 일을 적어보세요', color: '#00B4A0' },
        love: { placeholder: '사랑하는 순간을 적어보세요', color: '#FF6B9D' },
        achieve: { placeholder: '오늘의 성취를 적어보세요', color: '#4A90D9' },
        anxiety: { placeholder: '불안한 마음을 적어보세요', color: '#9B6DD7' },
        sadness: { placeholder: '슬픈 마음을 적어보세요', color: '#5B9BD5' },
        angry: { placeholder: '화가 난 이유를 적어보세요', color: '#E74C3C' },
        exhaustion: { placeholder: '지친 하루를 적어보세요', color: '#F39C12' }
    };

    // 🚀 이미지 프리로딩 - 딜레이 방지
    const preloadImages = () => {
        const emotions = ['Happiness', 'Anticipation', 'Love', 'Achieve', 'Anxiety', 'Sadness', 'Angry', 'Exhaustion'];
        emotions.forEach(emotion => {
            // 일반 이미지
            const img = new Image();
            img.src = `image/${emotion}.png`;
            // Union 이미지 (배경용)
            const unionImg = new Image();
            unionImg.src = `image/${emotion}_Union.png`;
        });
        console.log('🖼️ 모든 감정 이미지 프리로드 완료');
    };
    preloadImages();

    const getActiveIndex = () => {
        return Math.round(container.scrollLeft / container.clientWidth);
    };

    const scrollToIndex = (target) => {
        const clamped = Math.max(0, Math.min(target, sections.length - 1));
        container.scrollTo({
            left: container.clientWidth * clamped,
            behavior: 'smooth'
        });
        setTimeout(updateButtons, 300);
    };

    const updateButtons = () => {
        const idx = getActiveIndex();
        const atStart = idx <= 0;
        const atEnd = idx >= sections.length - 1;
        if (scrollLeftBtn) {
            scrollLeftBtn.style.opacity = atStart ? '0.3' : '1';
            scrollLeftBtn.style.pointerEvents = atStart ? 'none' : 'all';
        }
        if (scrollRightBtn) {
            scrollRightBtn.style.opacity = atEnd ? '0.3' : '1';
            scrollRightBtn.style.pointerEvents = atEnd ? 'none' : 'all';
        }
    };

    // 섹션 단위 휠 스크롤
    const handleWheel = (e) => {
        if (e.shiftKey) return;
        e.preventDefault();

        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(delta) < 2) return;

        const dir = delta > 0 ? 1 : -1;
        scrollToIndex(getActiveIndex() + dir);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Drag scroll support
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX;
        scrollStart = container.scrollLeft;
        container.style.cursor = 'grabbing';
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const delta = (e.pageX - startX);
        container.scrollLeft = scrollStart - delta;
    });

    // Touch swipe
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const threshold = 50;
        if (Math.abs(diff) > threshold) {
            scrollToIndex(getActiveIndex() + (diff > 0 ? 1 : -1));
        }
    });

    // Buttons
    if (scrollLeftBtn) {
        scrollLeftBtn.addEventListener('click', () => scrollToIndex(getActiveIndex() - 1));
    }
    if (scrollRightBtn) {
        scrollRightBtn.addEventListener('click', () => scrollToIndex(getActiveIndex() + 1));
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollToIndex(getActiveIndex() - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollToIndex(getActiveIndex() + 1);
        }
    });

    // Update buttons on scroll end
    let scrollTimeout;
    container.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateButtons();
        }, 80);
    });

    // 감정 관련 요소들
    const emotionScreen = document.getElementById('emotionScreen');
    const detailCard = document.getElementById('detailCard');
    const detailPrev = document.getElementById('detailPrev');
    const detailNext = document.getElementById('detailNext');
    const detailDate = document.getElementById('detailDate');
    const emotionNote = document.getElementById('emotionNote');
    const dropSection = document.getElementById('dropSection');
    const dropZone = document.getElementById('dropZone');
    const dropStack = document.getElementById('dropStack');
    const dropOverlay = document.getElementById('dropOverlay');
    const dropPathSvg = document.querySelector('.drop-path path');
    const homeBtn = document.getElementById('homeBtn');
    const DROP_ANIMATION_DURATION = 2000; // ms, slower fall speed for drop section
    const DROP_VIEWBOX = { width: 1200, height: 700 };
    const DROP_MARGIN_RATIO = 0.04; // keep tokens comfortably inside the viewBox
    const ROW_COUNT = 2; // 두 줄 배치
    const SECOND_ROW_SPACING_FACTOR = 0.9; // 두번째 줄도 여유 있게
    const ROW_OFFSET = 70; // 줄 간 수직 오프셋(px)
    const ROW_ALONG_SHIFT = 0.7; // 두번째 줄을 경로 방향으로 더 앞당겨 겹침 방지

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    // 계산 가능한 영역(보이는 구간)만 사용하도록 path 구간 추출
    function computeVisiblePathSegment() {
        if (!dropPathSvg) return { start: 0, end: 0 };

        const total = dropPathSvg.getTotalLength();
        const steps = 400;
        const marginX = DROP_VIEWBOX.width * DROP_MARGIN_RATIO;
        const marginY = DROP_VIEWBOX.height * DROP_MARGIN_RATIO;
        let first = null;
        let last = null;

        for (let i = 0; i <= steps; i++) {
            const len = (total * i) / steps;
            const pt = dropPathSvg.getPointAtLength(len);
            const inside =
                pt.x >= marginX &&
                pt.x <= DROP_VIEWBOX.width - marginX &&
                pt.y >= marginY &&
                pt.y <= DROP_VIEWBOX.height - marginY;

            if (inside) {
                if (first === null) first = len;
                last = len;
            }
        }

        return {
            start: first ?? 0,
            end: last ?? total
        };
    }

    const visiblePathSegment = computeVisiblePathSegment();
    
    let currentEmotion = '';
    let activeToken = null;

    // 감정 카드 클릭 - 모든 감정 처리
    emotionCards.forEach(card => {
        card.addEventListener('click', function () {
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 180);
            
            const label = this.querySelector('.emotion-label');
            if (label && emotionScreen) {
                const emotion = label.textContent.trim().toLowerCase();
                currentEmotion = emotion;
                
                // 감정 스크린 열기
                openEmotionScreen(emotion);
            }
        });
    });

    // 감정 스크린 열기
    function openEmotionScreen(emotion) {
        if (!emotionScreen || !detailCard) return;
        
        const config = emotionConfig[emotion];
        if (!config) return;

        // 배경 이미지 및 색상 설정
        detailCard.setAttribute('data-emotion', emotion);
        emotionScreen.setAttribute('data-emotion', emotion);
        
        // placeholder 설정
        if (emotionNote) {
            emotionNote.placeholder = config.placeholder;
            emotionNote.value = '';
        }

        // 날짜 설정
        setTodayDate();

        // 스크린 활성화
        emotionScreen.classList.add('is-active');
        emotionScreen.setAttribute('aria-hidden', 'false');
        
        console.log(`🎨 ${emotion.toUpperCase()} 감정 선택됨`);
    }

    // 스크린 닫기
    const closeDetail = (scrollBack = false) => {
        if (emotionScreen) {
            emotionScreen.classList.remove('is-active');
            emotionScreen.setAttribute('aria-hidden', 'true');
        }
        if (scrollBack) {
            scrollToIndex(1);
        }
        currentEmotion = '';
    };

    // 체크 버튼 클릭 - 저장 및 토큰 생성
    if (detailNext && emotionScreen) {
        detailNext.addEventListener('click', async () => {
            if (!currentEmotion) return;

            // 현재 감정을 로컬 변수에 저장 (closeDetail에서 초기화되기 전에!)
            const selectedEmotion = currentEmotion;
            const noteText = emotionNote ? emotionNote.value : '';
            const dateText = detailDate ? detailDate.textContent : '';

            // 서버에 감정 기록 저장
            let savedData = null;
            try {
                const response = await fetch('/api/emotions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emotion: selectedEmotion.toUpperCase(),
                        note: noteText,
                        date: dateText
                    })
                });
                const result = await response.json();
                savedData = result.data;  // 서버에서 반환된 완전한 데이터 저장
                console.log('✅ 감정 저장 완료:', result);
            } catch (error) {
                console.error('❌ 저장 실패:', error);
            }

            closeDetail(false);
            if (!dropSection) return;
            
            // 서버 응답 데이터를 createToken에 전달
            createToken(selectedEmotion.toUpperCase(), dateText, selectedEmotion, savedData);
            dropSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            if (dropZone) {
                dropZone.classList.remove('hidden');
            }

            // 메모 초기화
            if (emotionNote) emotionNote.value = '';
        });
    }

    // 뒤로가기 버튼
    if (detailPrev && emotionScreen) {
        detailPrev.addEventListener('click', () => closeDetail(true));
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetail(true);
        }
    });

    // 홈 버튼 클릭 시 Pick 섹션으로 이동
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                scrollToIndex(1);
            }, 100);
        });
    }

    // 오늘 날짜 설정
    const setTodayDate = () => {
        if (!detailDate) return;
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        detailDate.textContent = `${mm}${dd}.`;
    };

    setTodayDate();
    if (dropZone) {
        dropZone.classList.remove('hidden');
    }

    // 저장된 감정 데이터 저장
    let savedEmotionsData = [];

    // 저장된 감정 기록 불러오기
    async function loadSavedEmotions() {
        try {
            const response = await fetch('/api/emotions');
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                savedEmotionsData = result.data;
                console.log(`📝 ${result.data.length}개의 감정 기록 로드 완료`);
                renderSavedTokens();
                
                // 저장된 데이터가 있으면 PUT HERE 숨기기
                if (dropZone) {
                    dropZone.classList.add('hidden');
                }
            }
        } catch (error) {
            console.log('저장된 기록 없음 또는 서버 연결 실패');
        }
    }

    // 저장된 토큰 렌더링 (SVG viewBox 기준 상대 좌표 사용)
    function renderSavedTokens() {
        if (!dropStack || !dropPathSvg) return;
        
        // 기존 토큰 제거
        dropStack.innerHTML = '';

        if (savedEmotionsData.length === 0) {
            return;
        }
        
        const pathLen = dropPathSvg.getTotalLength();
        const { start: visibleStart, end: visibleEnd } = visiblePathSegment;
        const usableLen = Math.max(visibleEnd - visibleStart, 1);
        const viewBoxWidth = DROP_VIEWBOX.width;
        const viewBoxHeight = DROP_VIEWBOX.height;

        const BASE_SPACING = 240;          // 기본 간격 (더 넓게)
        const BONUS_START_IDX = 7;         // 8번째부터 간격 늘리기
        const SPREAD_SCALE = 0.5;          // 8번 이후 간격 가중치 확대
        const MIN_PATH_RATIO = 0.04;       // 시작 여유
        const WIGGLE_BASE = 10;            // 끝단 겹침 방지를 위한 수직 오프셋
        const WIGGLE_STEP = 5;             // 토큰이 늘어날 때마다 오프셋 증가
        const MARGIN_PX_X = DROP_VIEWBOX.width * DROP_MARGIN_RATIO;
        const MARGIN_PX_Y = DROP_VIEWBOX.height * DROP_MARGIN_RATIO;

        const minLen = visibleStart + usableLen * MIN_PATH_RATIO;
        const totalCount = savedEmotionsData.length;
        const tailStart = Math.max(0, totalCount - 4); // 마지막 4개는 추가 여유

        // 줄별 인덱스 카운터
        const rowCounters = Array.from({ length: ROW_COUNT }, () => 0);

        savedEmotionsData.forEach((emotion, idx) => {
            const row = idx % ROW_COUNT;
            const rowPos = rowCounters[row]++;

            const rowSpacingFactor = row === 1 ? SECOND_ROW_SPACING_FACTOR : 1;
            const spreadFactor = 1 + Math.max(0, rowPos - BONUS_START_IDX) * SPREAD_SCALE;
            const baseSpacing = BASE_SPACING * rowSpacingFactor;
            const alongShift = row === 1 ? BASE_SPACING * ROW_ALONG_SHIFT : 0;
            const baseDist = baseSpacing * rowPos * spreadFactor + alongShift;
            const tailBoost = idx >= tailStart ? (idx - tailStart + 1) * 120 : 0;
            const dist = Math.min(usableLen * 0.9, baseDist + tailBoost);

            const pointLen = clamp(visibleEnd - dist, minLen, visibleEnd);
            const endPt = dropPathSvg.getPointAtLength(pointLen);

            // 줄 오프셋 + 끝부분 위아래 교차 오프셋
            let offsetX = endPt.x;
            let offsetY = endPt.y;
            const delta = 2;
            const p1 = dropPathSvg.getPointAtLength(Math.max(pointLen - delta, visibleStart));
            const p2 = dropPathSvg.getPointAtLength(Math.min(pointLen + delta, visibleEnd));
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const mag = Math.hypot(dx, dy) || 1;
            const nx = -dy / mag;
            const ny = dx / mag;

            // 줄 오프셋
            const baseRowOffset = row * ROW_OFFSET;
            offsetX += nx * baseRowOffset;
            offsetY += ny * baseRowOffset;

            // tail wiggle (8번 이후)
            if (rowPos >= BONUS_START_IDX) {
                const wiggle = WIGGLE_BASE + (rowPos - BONUS_START_IDX) * WIGGLE_STEP;
                const dir = rowPos % 2 === 0 ? 1 : -1;
                offsetX += nx * wiggle * dir;
                offsetY += ny * wiggle * dir;
            }

            offsetX = clamp(offsetX, MARGIN_PX_X, viewBoxWidth - MARGIN_PX_X);
            offsetY = clamp(offsetY, MARGIN_PX_Y, viewBoxHeight - MARGIN_PX_Y);
            
            // viewBox 기준 퍼센트로 계산
            const percentX = clamp((offsetX / viewBoxWidth) * 100, 3, 97);
            const percentY = clamp((offsetY / viewBoxHeight) * 100, 3, 97);
            
            const item = document.createElement('div');
            item.className = 'token stacked';
            item.dataset.id = emotion.id;
            item.dataset.idx = idx;
            item.setAttribute('data-emotion', emotion.emotion.toLowerCase());
            item.style.left = `calc(${percentX}% - 70px)`;
            item.style.top = `calc(${percentY}% - 70px)`;
            item.innerHTML = `<div class="token-date-only">${emotion.date}</div>`;
            
            // 토큰 클릭 이벤트 추가
            item.addEventListener('click', () => openTokenModal(idx));
            
            dropStack.appendChild(item);
        });
    }

    // ============ 토큰 상세보기 모달 ============
    const tokenModal = document.getElementById('tokenModal');
    const tokenModalBackdrop = document.getElementById('tokenModalBackdrop');
    const tokenModalClose = document.getElementById('tokenModalClose');
    const tokenModalContent = document.getElementById('tokenModalContent');
    const tokenModalDate = document.getElementById('tokenModalDate');
    const tokenModalNote = document.getElementById('tokenModalNote');
    const tokenModalDelete = document.getElementById('tokenModalDelete');
    const tokenModalEdit = document.getElementById('tokenModalEdit');
    
    let currentModalIdx = -1;
    let isEditMode = false;

    // 수정 모드 종료 함수 (먼저 선언)
    function exitEditMode(newNote = null) {
        const textarea = document.getElementById('tokenModalNoteEdit');
        if (textarea) {
            textarea.remove();
        }
        
        if (tokenModalNote) {
            tokenModalNote.style.display = '';
            if (newNote !== null) {
                tokenModalNote.textContent = newNote;
            }
        }
        
        // 수정 버튼 아이콘 복원
        if (tokenModalEdit) {
            tokenModalEdit.innerHTML = '<img src="image/Pen_Icon.png" alt="수정">';
            tokenModalEdit.title = '수정';
        }
        
        isEditMode = false;
    }

    // 모달 열기
    function openTokenModal(idx) {
        const emotionData = savedEmotionsData[idx];
        if (!emotionData || !tokenModal) return;
        
        currentModalIdx = idx;
        const emotionLower = emotionData.emotion.toLowerCase();
        
        // 데이터 표시
        tokenModalContent.setAttribute('data-emotion', emotionLower);
        tokenModalDate.textContent = emotionData.date;
        tokenModalNote.textContent = emotionData.note || '';
        
        // 모달 표시
        tokenModal.classList.add('is-active');
        tokenModal.setAttribute('aria-hidden', 'false');
        
        console.log('📖 토큰 상세보기:', emotionData);
    }

    // 모달 닫기
    function closeTokenModal() {
        if (!tokenModal) return;
        
        // 수정 모드 종료
        if (isEditMode) {
            exitEditMode();
        }
        
        tokenModal.classList.remove('is-active');
        tokenModal.setAttribute('aria-hidden', 'true');
        currentModalIdx = -1;
    }

    // 모달 이벤트 바인딩
    if (tokenModalClose) {
        tokenModalClose.addEventListener('click', closeTokenModal);
    }
    if (tokenModalBackdrop) {
        tokenModalBackdrop.addEventListener('click', closeTokenModal);
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tokenModal?.classList.contains('is-active')) {
            closeTokenModal();
        }
    });

    // 삭제 버튼
    // 삭제 버튼
    if (tokenModalDelete) {
        tokenModalDelete.addEventListener('click', async () => {
            if (currentModalIdx < 0) return;
            
            const emotionData = savedEmotionsData[currentModalIdx];
            if (!emotionData) return;
            
            // 서버에서 삭제
            if (emotionData.id) {
                try {
                    const response = await fetch(`/api/emotions/${emotionData.id}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    console.log('🗑️ 삭제 완료:', result);
                } catch (error) {
                    console.error('삭제 실패:', error);
                }
            }
            
            // 로컬 데이터에서 제거
            savedEmotionsData.splice(currentModalIdx, 1);
            
            // 토큰 다시 렌더링
            renderSavedTokens();
            
            // 모달 닫기
            closeTokenModal();
        });
    }

    // 수정 모드 진입
    function enterEditMode() {
        if (currentModalIdx < 0 || !tokenModalNote) return;
        
        const currentNote = tokenModalNote.textContent || '';
        
        // 메모 영역을 textarea로 교체
        const textarea = document.createElement('textarea');
        textarea.id = 'tokenModalNoteEdit';
        textarea.className = 'token-modal-note-edit';
        textarea.value = currentNote;
        textarea.placeholder = '메모를 입력하세요...';
        
        tokenModalNote.style.display = 'none';
        tokenModalNote.parentNode.insertBefore(textarea, tokenModalNote.nextSibling);
        textarea.focus();
        
        // 수정 버튼 아이콘을 체크 아이콘으로 변경
        if (tokenModalEdit) {
            tokenModalEdit.innerHTML = '<img src="image/check_icon.png" alt="저장" onerror="this.outerHTML=\'✓\'">';
            tokenModalEdit.title = '저장';
        }
        
        isEditMode = true;
        console.log('✏️ 수정 모드 진입');
    }

    // 수정 저장
    async function saveEdit() {
        if (currentModalIdx < 0) return;
        
        const textarea = document.getElementById('tokenModalNoteEdit');
        if (!textarea) return;
        
        const newNote = textarea.value;
        const emotionData = savedEmotionsData[currentModalIdx];
        
        if (emotionData) {
            // 서버에 업데이트
            if (emotionData.id) {
                try {
                    const response = await fetch(`/api/emotions/${emotionData.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ note: newNote })
                    });
                    const result = await response.json();
                    console.log('✅ 수정 완료:', result);
                } catch (error) {
                    console.error('수정 실패:', error);
                }
            }
            
            // 로컬 데이터 업데이트
            emotionData.note = newNote;
        }
        
        // UI 복원
        exitEditMode(newNote);
        
        // 토큰 재렌더링
        renderSavedTokens();
    }

    // 수정 버튼 클릭
    if (tokenModalEdit) {
        tokenModalEdit.addEventListener('click', () => {
            if (currentModalIdx < 0) return;
            
            if (isEditMode) {
                // 저장 모드: 저장 실행
                saveEdit();
            } else {
                // 보기 모드: 수정 모드 진입
                enterEditMode();
            }
        });
    }

    // 페이지 로드 시 데이터 불러오기
    loadSavedEmotions();
    
    // 윈도우 리사이즈 시 토큰 위치 재계산
    window.addEventListener('resize', renderSavedTokens);

    // 토큰 생성 및 드롭 처리
    function createToken(label, dateText, emotionType, serverData = null) {
        console.log('🎯 토큰 생성:', { label, dateText, emotionType, serverData });
        
        const token = document.createElement('div');
        token.className = 'token';
        token.setAttribute('data-emotion', emotionType.toLowerCase());
        token.innerHTML = `<div>${label}</div><div class="token-date">${dateText}</div>`;
        
        // 초기 위치를 화면 중앙으로 설정
        token.style.left = `${window.innerWidth / 2}px`;
        token.style.top = `${window.innerHeight / 2}px`;
        
        document.body.appendChild(token);
        activeToken = token;
        
        // PUT HERE 드롭 가능 상태로 활성화
        if (dropZone) {
            dropZone.classList.add('droppable');
        }

        const moveWithMouse = (e) => {
            if (!activeToken) return;
            activeToken.style.left = `${e.clientX}px`;
            activeToken.style.top = `${e.clientY}px`;
        };

        document.addEventListener('mousemove', moveWithMouse);

        const handleDrop = () => {
            if (!activeToken || !dropZone || !dropOverlay || !dropPathSvg) return;
            
            // 🎉 드롭존 진입 즉시 파티클 효과 실행!
            createConfetti();
            
            const overlayRect = dropOverlay.getBoundingClientRect();
            const { start: visibleStart, end: visibleEnd } = visiblePathSegment;
            const pathRange = Math.max(visibleEnd - visibleStart, 1);

            const startPoint = dropPathSvg.getPointAtLength(visibleStart);
            activeToken.style.left = `${startPoint.x + overlayRect.left}px`;
            activeToken.style.top = `${startPoint.y + overlayRect.top}px`;

            const startTime = performance.now();
            const duration = DROP_ANIMATION_DURATION;

            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                const point = dropPathSvg.getPointAtLength(visibleStart + pathRange * t);
                activeToken.style.left = `${point.x + overlayRect.left}px`;
                activeToken.style.top = `${point.y + overlayRect.top}px`;
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    activeToken.remove();
                    activeToken = null;
                    
                    if (dropStack) {
                        // 서버 응답 데이터가 있으면 사용, 없으면 기본값
                        if (serverData) {
                            savedEmotionsData.push(serverData);
                        } else {
                            savedEmotionsData.push({
                                emotion: label,
                                date: dateText,
                                note: ''
                            });
                        }
                        renderSavedTokens();
                    }
                }
            };

            requestAnimationFrame(animate);

            document.removeEventListener('mousemove', moveWithMouse);
            dropZone.removeEventListener('mouseenter', handleDrop);
            
            // PUT HERE 숨기기 (드롭 성공)
            if (dropZone) {
                dropZone.classList.remove('droppable');
                dropZone.classList.add('hidden');
            }
        };

        if (dropZone) {
            dropZone.addEventListener('mouseenter', handleDrop);
        }
    }

    updateButtons();

    // ============================================
    // 🌟 Hero cursor gravity
    // ============================================
    const heroSection = document.querySelector('.section-1');
    const heroShapes = Array.from(document.querySelectorAll('.hero-shape'));
    const scrollContainerEl = document.getElementById('scrollContainer');

    if (heroSection && heroShapes.length > 0) {
        const MAX_INFLUENCE = 260;  // 영향 범위 (px)
        const MAX_STRENGTH = 0.45;  // 최대 끌림 강도
        
        // scale / shadow 범위
        const MIN_SCALE = 1.0;
        const MAX_SCALE = 1.18;
        const MIN_SHADOW = 0.26;
        const MAX_SHADOW = 0.6;

        let heroBasePositions = [];

        // 각 도형의 원래 중심 좌표 계산
        function updateHeroBasePositions() {
            heroBasePositions = heroShapes.map((el) => {
                const rect = el.getBoundingClientRect();
                return {
                    el,
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            });
        }

        // debounce 함수
        function debounce(fn, delay) {
            let timer = null;
            return function (...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        }

        // 초기 위치 계산
        updateHeroBasePositions();

        // 윈도우 리사이즈 시 재계산
        window.addEventListener('resize', debounce(updateHeroBasePositions, 150));

        // 수평 스크롤 멈춤 후 재계산
        if (scrollContainerEl) {
            scrollContainerEl.addEventListener('scroll', debounce(updateHeroBasePositions, 150));
        }

        // 마우스 움직임에 따른 중력 효과
        heroSection.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            heroBasePositions.forEach(({ el, x, y }) => {
                const dx = mouseX - x;
                const dy = mouseY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > MAX_INFLUENCE) {
                    // 영향 범위 밖이면 원위치 + 원래 크기
                    el.style.setProperty('--gx', '0px');
                    el.style.setProperty('--gy', '0px');
                    el.style.setProperty('--gs', '1');
                } else {
                    // 영향 범위 안이면 커서 쪽으로 끌림 + 크기 증가
                    const strength = (MAX_INFLUENCE - distance) / MAX_INFLUENCE;
                    const offsetX = dx * strength * MAX_STRENGTH;
                    const offsetY = dy * strength * MAX_STRENGTH;
                    el.style.setProperty('--gx', `${offsetX}px`);
                    el.style.setProperty('--gy', `${offsetY}px`);
                    
                    // 가까울수록 크기 증가 (1.0 → 1.15)
                    const scale = 1 + (0.15 * strength);
                    el.style.setProperty('--gs', scale.toString());
                }
            });
        });

        // 마우스가 섹션을 떠나면 모두 원위치 + 원래 크기
        heroSection.addEventListener('mouseleave', () => {
            heroShapes.forEach((el) => {
                el.style.setProperty('--gx', '0px');
                el.style.setProperty('--gy', '0px');
                el.style.setProperty('--gs', '1');
            });
        });

        console.log('🌟 Hero cursor gravity 효과 활성화');
    }

    // ============================================
    // 🎲 Hero shapes 랜덤 기울기 설정
    // ============================================
    const heroShapesForRotate = Array.from(document.querySelectorAll('.hero-shape'));
    
    if (heroShapesForRotate.length > 0) {
        heroShapesForRotate.forEach((el) => {
            // 랜덤 기울기: -20도 ~ 20도
            const rotateDeg = (Math.random() * 40 - 20).toFixed(1);
            el.style.setProperty('--rotate', `${rotateDeg}deg`);
        });
        
        console.log('🎲 Hero shapes 랜덤 기울기 적용 완료');
    }

});
