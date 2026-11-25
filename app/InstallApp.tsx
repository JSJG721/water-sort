'use client';

import { useEffect, useState } from 'react';

// 크롬 계열에서만 오는 설치 이벤트 (표준 타입에 없음)
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Platform = 'ios' | 'android' | 'inapp' | 'other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(ua)) return 'inapp';
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** 서비스 워커 등록 + "앱으로 설치" 버튼과 안내 창 */
export default function InstallApp() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>('other');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* 등록 실패해도 게임은 그대로 동작 */
      });
    }

    if (isStandalone()) return; // 이미 앱으로 실행 중이면 버튼 숨김
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 정보는 마운트 후에만 알 수 있음
    setPlatform(detectPlatform());
    setVisible(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setVisible(false);
      setGuideOpen(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible) return null;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      setDeferred(null);
      if (outcome === 'accepted') setVisible(false);
      return;
    }
    setGuideOpen(true);
  };

  return (
    <>
      <button
        onClick={onClick}
        className="rounded-full bg-amber-400/90 px-3 py-1 text-sm font-semibold text-slate-900 active:scale-95"
      >
        📲 앱 설치
      </button>

      {guideOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="ws-pop w-full max-w-sm rounded-3xl bg-slate-900 p-6 text-white shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">홈 화면에 앱으로 추가하기</h2>
            <p className="mt-1 text-sm text-white/60">추가하면 아이콘을 눌러 앱처럼 바로 실행돼요.</p>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed">
              {platform === 'inapp' && (
                <>
                  <Step n={1}>
                    지금은 앱 안의 브라우저(카카오톡 등)로 열려 있어요. 오른쪽 위 메뉴에서{' '}
                    <b>다른 브라우저로 열기</b>를 눌러주세요.
                  </Step>
                  <Step n={2}>
                    아이폰은 <b>Safari</b>, 안드로이드는 <b>Chrome</b>에서 다시 <b>📲 앱 설치</b>를 눌러주세요.
                  </Step>
                </>
              )}
              {platform === 'ios' && (
                <>
                  <Step n={1}>
                    <b>Safari</b>에서 아래쪽(또는 위쪽)의 <b>공유 버튼</b>
                    <ShareIcon />을 눌러요.
                  </Step>
                  <Step n={2}>
                    목록을 내려 <b>홈 화면에 추가</b>를 눌러요.
                  </Step>
                  <Step n={3}>
                    오른쪽 위 <b>추가</b>를 누르면 끝!
                  </Step>
                </>
              )}
              {platform === 'android' && (
                <>
                  <Step n={1}>
                    <b>Chrome</b> 오른쪽 위 메뉴 <b>⋮</b>를 눌러요. (삼성 인터넷은 아래쪽 메뉴 <b>≡</b>)
                  </Step>
                  <Step n={2}>
                    <b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 눌러요.
                  </Step>
                  <Step n={3}>
                    <b>설치</b>를 누르면 홈 화면에 아이콘이 생겨요.
                  </Step>
                </>
              )}
              {platform === 'other' && (
                <>
                  <Step n={1}>
                    휴대폰으로 이 주소를 열어주세요. 아이폰은 Safari, 안드로이드는 Chrome이 좋아요.
                  </Step>
                  <Step n={2}>
                    PC 크롬이라면 주소창 오른쪽의 <b>설치 아이콘</b>을 눌러도 돼요.
                  </Step>
                </>
              )}
            </ol>
            <button
              onClick={() => setGuideOpen(false)}
              className="mt-6 w-full rounded-2xl bg-white/10 py-3 font-semibold active:scale-95"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mx-1 inline h-4 w-4 align-[-2px] text-sky-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
