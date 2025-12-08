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
            }
        } catch (error) {
            console.log('저장된 기록 없음 또는 서버 연결 실패');
        }
    }

    // 저장된 토큰 렌더링 (SVG viewBox 기준 상대 좌표 사용)
    function renderSavedTokens() {
        if (!dropStack || !dropPathSvg || savedEmotionsData.length === 0) return;
        
        // 기존 토큰 제거
        dropStack.innerHTML = '';
        
        const pathLen = dropPathSvg.getTotalLength();
        // SVG viewBox 기준 (1200 x 700)
        const viewBoxWidth = 1200;
        const viewBoxHeight = 700;
        
        savedEmotionsData.forEach((emotion, idx) => {
            const spacing = 220;
            const dist = Math.min(pathLen, spacing * idx);
            const endPt = dropPathSvg.getPointAtLength(pathLen - dist);
            
            // viewBox 기준 퍼센트로 계산
            const percentX = (endPt.x / viewBoxWidth) * 100;
            const percentY = (endPt.y / viewBoxHeight) * 100;
            
            const item = document.createElement('div');
            item.className = 'token stacked';
            item.dataset.id = emotion.id;
            item.dataset.idx = idx;
            item.setAttribute('data-emotion', emotion.emotion.toLowerCase());
            item.style.left = `calc(${percentX}% - 70px)`;
            item.style.top = `calc(${percentY}% - 70px)`;
            item.innerHTML = `<div>${emotion.emotion}</div><div class="token-date">${emotion.date}</div>`;
            
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
    const tokenModalIcon = document.getElementById('tokenModalIcon');
    const tokenModalEmotion = document.getElementById('tokenModalEmotion');
    const tokenModalDate = document.getElementById('tokenModalDate');
    const tokenModalNote = document.getElementById('tokenModalNote');
    const tokenModalDelete = document.getElementById('tokenModalDelete');
    
    let currentModalIdx = -1;

    // 모달 열기
    function openTokenModal(idx) {
        const emotionData = savedEmotionsData[idx];
        if (!emotionData || !tokenModal) return;
        
        currentModalIdx = idx;
        const emotionLower = emotionData.emotion.toLowerCase();
        
        // 데이터 표시
        tokenModalIcon.setAttribute('data-emotion', emotionLower);
        tokenModalContent.setAttribute('data-emotion', emotionLower);
        tokenModalEmotion.textContent = emotionData.emotion;
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

        const moveWithMouse = (e) => {
            if (!activeToken) return;
            activeToken.style.left = `${e.clientX}px`;
            activeToken.style.top = `${e.clientY}px`;
        };

        document.addEventListener('mousemove', moveWithMouse);

        const handleDrop = () => {
            if (!activeToken || !dropZone || !dropOverlay || !dropPathSvg) return;
            const overlayRect = dropOverlay.getBoundingClientRect();
            const pathLen = dropPathSvg.getTotalLength();

            const startPoint = dropPathSvg.getPointAtLength(0);
            activeToken.style.left = `${startPoint.x + overlayRect.left}px`;
            activeToken.style.top = `${startPoint.y + overlayRect.top}px`;

            const startTime = performance.now();
            const duration = 1000;

            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                const point = dropPathSvg.getPointAtLength(pathLen * t);
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
        };

        if (dropZone) {
            dropZone.addEventListener('mouseenter', handleDrop);
        }
    }

    updateButtons();
});
