import React, { useState, useEffect } from 'react';

const WEEKDAY_SUBJECTS = ['국어', '수학', '영어', '사회'];
const PAGES_PER_SUBJECT = 6;

const getDayType = (date) => {
  const day = date.getDay();
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  if (day === 4) return 'thursday';
  return 'weekday';
};

const getDayTypeLabel = (dayType) => {
  const labels = {
    weekday: '📚 진도 나가기',
    thursday: '✏️ 오답 정리의 날',
    saturday: '📖 보충 학습',
    sunday: '📖 보충 학습'
  };
  return labels[dayType];
};

export default function StudyScheduler() {
  const [currentView, setCurrentView] = useState('home');
  const [studyTime, setStudyTime] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [completedPages, setCompletedPages] = useState({});
  const [earnedGameTime, setEarnedGameTime] = useState(0);
  const [usedGameTime, setUsedGameTime] = useState(0);
  const [usedYoutubeTime, setUsedYoutubeTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const today = new Date();
  const dayType = getDayType(today);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  useEffect(() => {
    let interval;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  useEffect(() => {
    const earnedMinutes = Math.floor((studyTime / 60) * 0.3);
    setEarnedGameTime(earnedMinutes);
  }, [studyTime]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}시간 ${mins}분 ${secs}초`;
    return `${mins}분 ${secs}초`;
  };

  const formatMinutes = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}시간 ${mins}분`;
    return `${mins}분`;
  };

  const handleStartStudy = (subject) => {
    setCurrentSubject(subject);
    setIsStudying(true);
    setCurrentView('timer');
  };

  const handleCompletePage = () => {
    const key = `${currentSubject}`;
    const current = completedPages[key] || 0;
    if (current < PAGES_PER_SUBJECT) {
      setCompletedPages(prev => ({ ...prev, [key]: current + 1 }));
      if (current + 1 === PAGES_PER_SUBJECT) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    }
  };

  const getTotalCompletedPages = () => Object.values(completedPages).reduce((a, b) => a + b, 0);
  const getTotalPages = () => WEEKDAY_SUBJECTS.length * PAGES_PER_SUBJECT;
  const getProgressPercent = () => Math.round((getTotalCompletedPages() / getTotalPages()) * 100);

  const isWeekend = dayType === 'saturday' || dayType === 'sunday';
  const maxGameTime = isWeekend ? 120 : earnedGameTime;
  const maxYoutubeTime = 120;

  // 홈 화면
  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 pb-24">
      <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm">{today.getMonth() + 1}월 {today.getDate()}일 ({dayNames[today.getDay()]}요일)</p>
          <h1 className="text-xl font-bold text-purple-600 mt-1">{getDayTypeLabel(dayType)}</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
        <h2 className="font-bold text-gray-700 mb-3">📊 오늘의 진행률</h2>
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500" style={{ width: `${getProgressPercent()}%` }} />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow">{getProgressPercent()}% 완료!</div>
        </div>
        <p className="text-center text-gray-500 mt-2 text-sm">{getTotalCompletedPages()} / {getTotalPages()} 페이지</p>
      </div>

      <div className="space-y-3 mb-4">
        <h2 className="font-bold text-gray-700 px-1">📖 과목 선택</h2>
        {WEEKDAY_SUBJECTS.map((subject, idx) => {
          const completed = completedPages[subject] || 0;
          const isComplete = completed >= PAGES_PER_SUBJECT;
          const colors = ['from-red-400 to-red-500', 'from-blue-400 to-blue-500', 'from-yellow-400 to-yellow-500', 'from-green-400 to-green-500'];
          
          return (
            <button key={subject} onClick={() => !isComplete && handleStartStudy(subject)} disabled={isComplete}
              className={`w-full p-4 rounded-2xl shadow-lg transition-all ${isComplete ? 'bg-gray-100 opacity-70' : `bg-gradient-to-r ${colors[idx]} hover:scale-102 active:scale-98`}`}>
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h3 className={`font-bold text-lg ${isComplete ? 'text-gray-500' : 'text-white'}`}>{isComplete ? '✅ ' : ''}{subject}</h3>
                  <p className={`text-sm ${isComplete ? 'text-gray-400' : 'text-white/80'}`}>{completed} / {PAGES_PER_SUBJECT} 페이지</p>
                </div>
                {!isComplete && <div className="bg-white/20 rounded-full px-4 py-2"><span className="text-white font-bold">시작 →</span></div>}
              </div>
              <div className="mt-2 h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${(completed / PAGES_PER_SUBJECT) * 100}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <h2 className="font-bold text-gray-700 mb-3">🎮 나의 포인트</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">총 공부 시간</p>
            <p className="text-lg font-bold text-purple-600">{formatTime(studyTime)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">획득 게임시간</p>
            <p className="text-lg font-bold text-green-600">{formatMinutes(earnedGameTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 타이머 화면
  const TimerView = () => {
    const completed = completedPages[currentSubject] || 0;
    const progress = (completed / PAGES_PER_SUBJECT) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-4 flex flex-col">
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-3xl p-8 text-center animate-bounce">
              <span className="text-6xl">🎉</span>
              <h2 className="text-2xl font-bold text-purple-600 mt-4">{currentSubject} 완료!</h2>
              <p className="text-gray-500">정말 잘했어!</p>
            </div>
          </div>
        )}

        <div className="text-center text-white mb-8">
          <p className="text-white/70">지금 공부 중</p>
          <h1 className="text-3xl font-bold">{currentSubject}</h1>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
              <circle cx="128" cy="128" r="120" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${progress * 7.54} 754`} className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-4xl font-bold">{formatTime(studyTime)}</span>
              <span className="text-white/70 mt-2">{completed} / {PAGES_PER_SUBJECT} 페이지</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-center text-white/70 mb-3">페이지를 끝냈으면 체크!</p>
          <div className="flex justify-center gap-2">
            {[...Array(PAGES_PER_SUBJECT)].map((_, i) => (
              <button key={i} onClick={handleCompletePage} disabled={i >= completed + 1 || i < completed}
                className={`w-12 h-12 rounded-full font-bold transition-all ${
                  i < completed ? 'bg-green-400 text-white' : i === completed ? 'bg-white text-purple-600 animate-pulse scale-110' : 'bg-white/20 text-white/50'
                }`}>
                {i < completed ? '✓' : i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          {isStudying ? (
            <button onClick={() => setIsStudying(false)} className="flex-1 bg-yellow-400 text-yellow-900 py-4 rounded-2xl font-bold text-lg">⏸️ 잠깐 쉬기</button>
          ) : (
            <button onClick={() => setIsStudying(true)} className="flex-1 bg-green-400 text-green-900 py-4 rounded-2xl font-bold text-lg">▶️ 다시 시작</button>
          )}
          <button onClick={() => { setIsStudying(false); setCurrentSubject(null); setCurrentView('home'); }}
            className="flex-1 bg-white/20 text-white py-4 rounded-2xl font-bold text-lg">📖 과목 변경</button>
        </div>
      </div>
    );
  };

  // 보상 화면
  const RewardsView = () => {
    const availableGameTime = Math.max(0, (isWeekend ? maxGameTime : earnedGameTime) - usedGameTime);
    const availableYoutubeTime = Math.max(0, maxYoutubeTime - usedYoutubeTime);

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 pb-24">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">🎮 나의 보상</h1>

        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-700">🎮 게임 시간</h2>
            <span className="text-2xl font-bold text-green-600">{formatMinutes(availableGameTime)}</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: `${maxGameTime > 0 ? (availableGameTime / maxGameTime) * 100 : 0}%` }} />
          </div>
          <p className="text-xs text-gray-500 text-center">{isWeekend ? '주말 최대 2시간' : `공부시간의 30% (${formatMinutes(earnedGameTime)} 획득)`}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setUsedGameTime(prev => Math.min(prev + 10, isWeekend ? maxGameTime : earnedGameTime))} disabled={availableGameTime <= 0}
              className="flex-1 bg-green-500 text-white py-2 rounded-xl font-bold disabled:opacity-50">10분 사용</button>
            <button onClick={() => setUsedGameTime(prev => Math.min(prev + 30, isWeekend ? maxGameTime : earnedGameTime))} disabled={availableGameTime < 30}
              className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold disabled:opacity-50">30분 사용</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-700">📺 유튜브 시간</h2>
            <span className="text-2xl font-bold text-red-500">{formatMinutes(availableYoutubeTime)}</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-red-400 to-red-500" style={{ width: `${(availableYoutubeTime / maxYoutubeTime) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-500 text-center">하루 최대 2시간</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setUsedYoutubeTime(prev => Math.min(prev + 10, maxYoutubeTime))} disabled={availableYoutubeTime <= 0}
              className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold disabled:opacity-50">10분 사용</button>
            <button onClick={() => setUsedYoutubeTime(prev => Math.min(prev + 30, maxYoutubeTime))} disabled={availableYoutubeTime < 30}
              className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold disabled:opacity-50">30분 사용</button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 shadow-lg text-white">
          <h2 className="font-bold mb-3">📊 오늘의 기록</h2>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/20 rounded-xl p-2"><p className="text-xs text-white/70">공부</p><p className="font-bold">{formatTime(studyTime)}</p></div>
            <div className="bg-white/20 rounded-xl p-2"><p className="text-xs text-white/70">완료</p><p className="font-bold">{getTotalCompletedPages()}페이지</p></div>
            <div className="bg-white/20 rounded-xl p-2"><p className="text-xs text-white/70">게임</p><p className="font-bold">{formatMinutes(usedGameTime)}</p></div>
            <div className="bg-white/20 rounded-xl p-2"><p className="text-xs text-white/70">유튜브</p><p className="font-bold">{formatMinutes(usedYoutubeTime)}</p></div>
          </div>
        </div>
      </div>
    );
  };

  // 통계 화면
  const StatsView = () => {
    const weekData = [
      { day: '월', study: 180, pages: 20 }, { day: '화', study: 200, pages: 24 },
      { day: '수', study: 150, pages: 18 }, { day: '목', study: 120, pages: 12 },
      { day: '금', study: 190, pages: 22 }, { day: '토', study: 60, pages: 8 },
      { day: '일', study: 0, pages: 0 },
    ];
    const maxStudy = Math.max(...weekData.map(d => d.study), 1);

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4 pb-24">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">📈 이번 주 통계</h1>

        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
          <h2 className="font-bold text-gray-700 mb-4">공부 시간 (분)</h2>
          <div className="flex items-end justify-between h-40 gap-1">
            {weekData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(data.study / maxStudy) * 100}%`, minHeight: data.study > 0 ? '8px' : '0' }} />
                <span className="text-xs text-gray-500 mt-2">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
          <h2 className="font-bold text-gray-700 mb-4">완료한 페이지</h2>
          <div className="flex items-end justify-between h-32 gap-1">
            {weekData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all"
                  style={{ height: `${(data.pages / 24) * 100}%`, minHeight: data.pages > 0 ? '8px' : '0' }} />
                <span className="text-xs font-bold text-gray-700 mt-1">{data.pages}</span>
                <span className="text-xs text-gray-400">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 shadow-lg text-white">
          <h2 className="font-bold mb-3">🏆 이번 주 총계</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{Math.floor(weekData.reduce((a,b) => a + b.study, 0) / 60)}</p><p className="text-xs text-white/70">총 시간</p></div>
            <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{weekData.reduce((a,b) => a + b.pages, 0)}</p><p className="text-xs text-white/70">총 페이지</p></div>
            <div className="bg-white/20 rounded-xl p-3"><p className="text-2xl font-bold">{weekData.filter(d => d.pages >= 20).length}</p><p className="text-xs text-white/70">목표달성일</p></div>
          </div>
        </div>
      </div>
    );
  };

  // 하단 네비게이션
  const Navigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-40">
      <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center p-2 ${currentView === 'home' ? 'text-purple-600' : 'text-gray-400'}`}>
        <span className="text-2xl">🏠</span><span className="text-xs">홈</span>
      </button>
      <button onClick={() => setCurrentView('rewards')} className={`flex flex-col items-center p-2 ${currentView === 'rewards' ? 'text-purple-600' : 'text-gray-400'}`}>
        <span className="text-2xl">🎮</span><span className="text-xs">보상</span>
      </button>
      <button onClick={() => setCurrentView('stats')} className={`flex flex-col items-center p-2 ${currentView === 'stats' ? 'text-purple-600' : 'text-gray-400'}`}>
        <span className="text-2xl">📈</span><span className="text-xs">통계</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen relative">
      {currentView === 'home' && <HomeView />}
      {currentView === 'timer' && <TimerView />}
      {currentView === 'rewards' && <RewardsView />}
      {currentView === 'stats' && <StatsView />}
      {currentView !== 'timer' && <Navigation />}
    </div>
  );
}
