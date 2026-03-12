export const STORY_CHAPTERS = [
    { id: 'prologue', title: '서장: 누구를 위하여 종은 울리나?' },
    { id: 'chapter1', title: '1장: 삶의 증명은 남겨진 자의 몫' },
];

// 트리 구조 (x, y 좌표는 0~100% 비율)
export const STORY_NODES = {
    
    'prologue': [
        { 
          id: 'node_start', 
          x: 85, 
          y: 20, 
          title: '최종전', 
          type: 'event',
          eventId: 'evt_prologue_start', 
          summary: '관측자와 에키드나의 대화. 모든 것이 부서진 전장에서, 그들은 무의미한 것을 알면서도 마지막 싸움을 향해 발걸음을 옮긴다.'
        },
        { 
          id: 'node_real_start', 
          x: 50, 
          y: 10, 
          // [Fix] 진짜 프롤로그 노드의 이름을 수정했습니다.
          title: '이름 없는 무덤', 
          type: 'start',
          eventId: 'evt_prologue_3', 
          requires: ['node_start'], 
          summary: '모든 것의 진짜 시작점...'
        },
        { id: 'node_1', x: 50, y: 30, title: '탐색 개시', type: 'normal' },
        { id: 'node_2a', x: 30, y: 50, title: '비석 조사', type: 'event' }, 
        { id: 'node_2b', x: 70, y: 50, title: '우회로 발견', type: 'event' }, 
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
        { from: 'node_real_start', to: 'node_1' },
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