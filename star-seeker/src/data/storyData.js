export const STORY_CHAPTERS = [
    { id: 'prologue', title: '서장: 누구를 위하여 종은 울리나?' },
    { id: 'chapter1', title: '1장: 삶의 증명은 남겨진 자의 몫' },
];

// 트리 구조 (x, y 좌표는 0~100% 비율)
export const STORY_NODES = {
    
    'prologue': [
        { 
          id: 'node_start', 
          x: 50, 
          y: 10, 
          title: '최종전', 
          type: 'start',
          // [핵심] 이 노드를 클릭하면 'evt_prologue_start' 이벤트가 실행됩니다!
          eventId: 'evt_prologue_start', 
          summary: '관측자와 에키드나의 대화. 모든 것이 부서진 전장에서, 그들은 무의미한 것을 알면서도 마지막 싸움을 향해 발걸음을 옮긴다.'
        },
        { 
          id: 'node_1', 
          x: 50, 
          y: 30, 
          title: '탐색 개시', 
          type: 'normal',
          eventId: 'evt_prologue_2', // (예시) 두 번째 스토리의 ID를 이렇게 넣어주면 됩니다.
          summary: '전투 종료 후의 기록...'
        },
        { id: 'node_2a', x: 30, y: 50, title: '비석 조사', type: 'event' }, // 분기 A
        { id: 'node_2b', x: 70, y: 50, title: '우회로 발견', type: 'event' }, // 분기 B
        { id: 'node_3', x: 50, y: 70, title: '감시자 조우', type: 'battle' },
        { id: 'node_end', x: 50, y: 90, title: '탈출', type: 'end' },
    ],
    'chapter1': [
        { id: 'c1_start', x: 50, y: 10, title: '지하 진입', type: 'start' },
        { id: 'c1_1', x: 50, y: 30, title: '어둠 속으로', type: 'normal' },
        { id: 'c1_end', x: 50, y: 50, title: '???', type: 'locked' },
    ]
};

// 노드 연결 정보 (From -> To)
export const STORY_EDGES = {
    'prologue': [
        { from: 'node_start', to: 'node_1' },
        { from: 'node_1', to: 'node_2a' },
        { from: 'node_1', to: 'node_2b' },
        { from: 'node_2a', to: 'node_3' },
        { from: 'node_2b', to: 'node_3' },
        { from: 'node_3', to: 'node_end' },
    ],
    'chapter1': [
        { from: 'c1_start', to: 'c1_1' },
        { from: 'c1_1', to: 'c1_end' },
    ]
};