// --- 전체 캐릭터 데이터베이스 (도감) ---
export const ALL_CHARACTERS = [
  { 
    id: 1, name: "서주목", role: "Keeper", 
    baseHp: 1200, baseAtk: 55, baseDef: 25, baseSpd: 8, 
    color: "from-blue-600 to-blue-800", desc: "삶의 증명을 위하여 싸우는 남겨진 자",
    efficiency: 1.1, star: 5,
    skills: ['요리', '채집', '관찰'],
    combatSkills: {
        normal: { name: "강타", desc: "방어력의 100% 위력으로 단일 적을 공격합니다.", mult: 1.0 },
        // [수정] mult: 2.2 -> 1.5 (설명: 150%)
        // [추가] buffVal: 0.2 (설명: 피해 감소 20%)
        ultimate: { name: "신장의 맹세", desc: "방어력의 150% 위력으로 모든 적을 공격하고, 전체 아군이 받는 피해를 20% 감소시킵니다.", mult: 1.5, buffVal: 0.2 }
    },
    profile: { age: "20대(GP-A1기준)", height: "186cm", hobby: "고기 요리", like: "모닥불", dislike: "축축한 것" },
    bondStories: [
        { id: 1, title: "땅을 내려다보며", unlockLevel: 1, desc: "모든 일이 끝난 뒤, 당신은 홀로 사람들로부터 멀리 떨어져 혼자 있는 그를 발견한다." },
        { id: 2, title: "발 내딛을 곳을 찾다가", unlockLevel: 3, desc: "약간의 시간이 지나 오랜만에 방문한 GP-A1에서, 당신은 성시하와 다투고 있는 그를 발견한다." },
        { id: 3, title: "고개를 드니", unlockLevel: 5, desc: "송별회 날, 그는 별하늘 아래로 당신을 불러낸다." }
    ]
  },
  { 
    id: 2, name: "시에", role: "EXECUTOR", 
    baseHp: 850, baseAtk: 95, baseDef: 12, baseSpd: 10, 
    color: "from-rose-600 to-rose-800", desc: "죽음을 등진 이방인",
    efficiency: 0.95, star: 5,
    skills: ['카리스마', '관찰', '직감'],
    combatSkills: {
        // [확인] mult: 1.2 (설명: 120%) - 일치
        normal: { name: "공에서 일로", desc: "공격력의 120% 위력으로 단일 적을 공격합니다.", mult: 1.2 },
        // [확인] mult: 3.5 (설명: 350%) - 일치
        ultimate: { name: "일에서 공으로", desc: "자신의 치명타 피해를 40% 상승시키고, 단일 적을 350%의 위력으로 공격합니다.", mult: 3.5 }
    },
    profile: { age: "알 수 없음", height: "190cm", hobby: "수면", like: "고요함", dislike: "강제, 강압" },
    bondStories: [
        { id: 1, title: "전장의 냄새", unlockLevel: 1, desc: "처음 전장에 섰던 날." },
        { id: 2, title: "부러진 검", unlockLevel: 3, desc: "패배로부터 배운 것." }
    ]
  },
  { 
    id: 3, name: "성시하", role: "PATHFINDER", 
    baseHp: 700, baseAtk: 140, baseDef: 8, baseSpd: 12, 
    color: "from-violet-600 to-violet-800", desc: "바라보는 것은 동경의 뒷면",
    efficiency: 1.5, star: 4,
    skills: ['관찰', '계산'],
    combatSkills: {
        // [확인] mult: 0.8 (설명: 80%) - 일치
        normal: { name: "연타", desc: "공격력의 80% 위력으로 단일 적을 공격합니다.", mult: 0.8 },
        // [수정] mult: 2.5 -> 2.0 (설명: 200%)
        ultimate: { name: "기록자의 증명", desc: "공격력의 200% 위력으로 모든 적을 공격합니다.", mult: 2.0 }
    },
    profile: { age: "10대 후반(GP-A1기준)", height: "172cm", hobby: "글 읽기", like: "활자", dislike: "후회" },
    bondStories: [
        { id: 1, title: "남는 것은 기록뿐", unlockLevel: 3, desc: "GP-A1의 상황이 진정되기 시작하며, 성시하는 도서관 정리 작업을 개시하고자 한다." },
        { id: 2, title: "그러나 사라지지 않는 것은", unlockLevel: 5, desc: "어느 날, 당신에게 '조호단'의 기록물이 남아있다는 폐허에 함께 가달라는 성시하의 연락이 도착한다." }
    ]
  },
  { 
    id: 4, name: "아다드", role: "SUSTAINER", 
    baseHp: 650, baseAtk: 45, baseDef: 8, baseSpd: 10, 
    color: "from-emerald-600 to-emerald-800", desc: "풍요는 존재의 증명이 될 수 있는가?",
    efficiency: 1.0, star: 5,
    skills: ['화술', '계산', '리더쉽'],
    combatSkills: {
        // [수정] mult: 0.6 -> 0.5 (설명: 50%)
        normal: { name: "시장 개입", desc: "공격력의 50% 위력으로 생명력이 제일 낮은 아군을 회복합니다.", mult: 0.5 },
        // [수정] mult: 0 -> 1.5 (설명: 150%)
        // [추가] dotMult: 0.3 (설명: 30% 지속 회복)
        ultimate: { name: "우상향의 천국", desc: "공격력의 200% 위력으로 아군의 생명력을 회복하고, 공격력의 50% 위력으로 2턴간 아군의 생명력을 지속 회복합니다.", mult: 2.0, dotMult: 0.5 }
    },
    profile: { age: "30대(안테α기준)", height: "182cm", hobby: "티타임", like: "우상향", dislike: "붉은색" },
    bondStories: [
        { id: 1, title: "숭배의 다른 이름은 의존", unlockLevel: 1, desc: "사이프러스 주식회사의 범우주적 주식 상장을 위하여, 아다드는 헤페리스의 도움을 얻고자 한다." },
        { id: 2, title: "그러나 우러를 별이 유성이라면", unlockLevel: 3, desc: "사이프러스 주식회사와 헤페리스와의 사업 교류 도중, 그는 함께 티타임을 가지자고 제의해온다." },
        // [수정] id 중복 수정 (1 -> 3)
        { id: 3, title: "별의 꼬리를 쫒아 달리는 발걸음은 어쩌면 동행", unlockLevel: 5, desc: "사이프러스 주식회사의 성공적인 주식 상장 후, 아다드는 당신에게 감사를 표해온다." }
    ]
  },
  { 
    id: 5, name: "람만", role: "SUSTAINER", 
    baseHp: 600, baseAtk: 130, baseDef: 5, baseSpd: 35, 
    color: "from-amber-600 to-amber-800", desc: "절제 없는 소비는 인간의 본성",
    efficiency: 0.8, star: 4,
    skills: ['화술', '유혹'],
    combatSkills: {
        // [확인] mult: 0.9 (설명: 90%) - 일치
        normal: { name: "머니건", desc: "공격력의 90% 위력으로 적을 공격합니다.", mult: 0.9 },
        // [수정] mult: 2.8 -> 1.2 (설명: 공격 120%)
        // [추가] healMult: 2.0 (설명: 힐 200%)
        ultimate: { name: "무절제한 소비의 낙원으로", desc: "공격력의 120%의 위력으로 모든 적을 공격하고, 공격력의 200% 위력으로 아군 전체의 생명력을 회복시킵니다.", mult: 1.2, healMult: 2.0 }
    },
    profile: { age: "30대(안테α기준)", height: "182cm", hobby: "축제", like: "시끌벅적한 것", dislike: "인내, 절제" },
    bondStories: [
        { id: 1, title: "소원을 이루어주는 자를 불러 신이라 한다면", unlockLevel: 1, desc: "당신이 여론조사 차 실존 데이터 형상으로 살아가는 것에 대한 불만은 없는지 물었을 때, 그는 웃는 낯으로 답해온다." },
        { id: 2, title: "신이란 인정과 사랑에 목마른 자를 의미함이라", unlockLevel: 3, desc: "또 같은 일을 반복할 의사가 있는지 묻는 당신에게, 그는 한 가지 요구를 해온다." }
    ]
  },
  { 
    id: 6, name: "천백", role: "EXECUTOR", 
    baseHp: 1100, baseAtk: 55, baseDef: 10, baseSpd: 30, 
    color: "from-orange-600 to-red-700", desc: "모르고도 행함은 무엇을 위함인가?",
    efficiency: 1.2, star: 4,
    skills: ['괴력'],
    combatSkills: {
        // [확인] mult: 1.1 (설명: 110%) - 일치
        normal: { name: "일점 찌르기", desc: "공격력의 110% 위력으로 적을 공격합니다.", mult: 1.1 },
        // [수정] mult: 2.5 -> 2.0 (설명: 200%)
        ultimate: { name: "들리기에 응하였으니", desc: "자신의 공격력을 20% 상승시키고, 공격력의 200% 위력으로 모든 적을 공격합니다.", mult: 2.0 }
    },
    profile: { age: "31(신강 기준)", height: "179cm", hobby: "명상", like: "검 손질, 간식", dislike: "강약약강" },
    bondStories: [
        { id: 1, title: "의미 없는 행위", unlockLevel: 1, desc: "신강 내 난민들의 충돌을 해결하고서 돌아오는 길, 당신은 지친 얼굴의 천백에게 디저트를 권한다." },
        { id: 2, title: "의미를 필요로 하지 않는 행위", unlockLevel: 1, desc: "오랜만에 다시 만난 천백은 당신에게 자신이 직접 만들었다는 서툰 솜씨의 간식을 권한다." }
    ]
  },
   { 
    id: 7, name: "에키드나", role: "PATHFINDER", 
    baseHp: 600, baseAtk: 130, baseDef: 5, baseSpd: 45, 
    color: "from-amber-600 to-amber-800", desc: "구세주의 귀환을 기다리는 사과 나무의 뱀",
    efficiency: 0.8, star: 5,
    skills: ['만능', '제조', '수호'],
    combatSkills: {
        // [확인] mult: 1.0 (설명: 100%) - 일치
        normal: { name: "코드 입력: 7AD0N", desc: "공격력의 100% 위력으로 적을 공격합니다.", mult: 1.0 },
        // [확인] mult: 2.0 (설명: 200%) - 일치
        ultimate: { name: "오퍼레이션: N03L", desc: "공격력의 200% 위력으로 모든 적을 공격합니다.", mult: 2.0 }
    },
    profile: { age: "알 수 없음", height: "알 수 없음", hobby: "헤페리스 청소", like: "청결, 바보", dislike: "불결함, 미련한 것" },
    bondStories: [
        { id: 1, title: "???", unlockLevel: 1, desc: "???" },
        { id: 2, title: "???", unlockLevel: 3, desc: "???" }
    ]
  },
];