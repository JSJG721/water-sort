# 액체 따르기 퍼즐

같은 색 액체를 한 병에 모으는 가벼운 퍼즐 게임입니다.

- 병을 눌러 들고, 다른 병을 눌러 부어요. 같은 색 위나 빈 병에만 부을 수 있어요.
- 되돌리기, 다시하기, 병 추가(레벨마다 1번), 힌트
- 진행 레벨은 브라우저에 저장돼요.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 플레이할 수 있어요.

## 구조

- `lib/waterSort.ts` — 레벨 생성, 붓기 규칙, 풀이기(힌트)
- `app/WaterSortGame.tsx` — 화면, 애니메이션, 효과음

## 홈 화면에 앱으로 설치 (PWA)

- `app/manifest.ts` — 앱 이름, 아이콘, 전체 화면 실행 설정
- `public/sw.js` — 한 번 열어두면 오프라인에서도 플레이 가능
- `app/InstallApp.tsx` — "📲 앱 설치" 버튼 (안드로이드는 바로 설치, 아이폰은 안내 표시)
- 아이콘: `public/icon-192.png`, `public/icon-512.png`, `app/icon.png`, `app/apple-icon.png`
