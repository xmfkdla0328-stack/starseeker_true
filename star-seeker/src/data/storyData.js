export const STORY_CHAPTERS = [
    { id: 'prologue', title: '서장: 누구를 위하여 종은 울리나?' },
    { id: 'chapter1', title: '1장: 삶의 증명은 남겨진 자의 몫' },
];

// 트리 구조 (x, y 좌표는 0~100% 비율)
export const STORY_NODES = {
    'prologue': [
        { id: 'node_start', x: 50, y: 10, title: '불시착', type: 'start' },
        { id: 'node_1', x: 50, y: 30, title: '탐색 개시', type: 'normal' },
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