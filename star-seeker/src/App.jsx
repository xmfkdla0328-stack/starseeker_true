import React, { useState, useMemo, useCallback } from "react";
import "./App.css";

import useGameNavigation from "./hooks/useGameNavigation";
import useGameData from "./hooks/useGameData";
import GameRouter from "./router/GameRouter";
import { EQUIP_SLOTS, generateEquipment } from "./data/equipmentData";

export default function App() {
    const nav = useGameNavigation();
    const data = useGameData();

    const [currentEnemyId, setCurrentEnemyId] = useState(null);
    const [battleType, setBattleType] = useState("story");
    const [battleRewards, setBattleRewards] = useState([]);

    const [nextEventId, setNextEventId] = useState(null);

    // [NEW] 지금 유저가 진입한 진짜 노드 ID (예: 'node_start')를 기억해둡니다.
    const [currentNodeId, setCurrentNodeId] = useState(null);

    const handleContentSelect = (contentType) => {
        if (contentType === "story") nav.goStorySelect();
        else if (contentType === "mining") nav.goMiningSelect();
    };

    const handleDirectMining = () => {
        nav.goDirectMiningSelect();
    };

    const handleStartMiningBattle = (type) => {
        let enemyId = "guardian";

        let newBattleType = "mining_chip";
        if (type === "stone") newBattleType = "mining_stone";
        else if (type === "gear" || type === "core")
            newBattleType = "mining_gear";

        setCurrentEnemyId(enemyId);
        setBattleType(newBattleType);
        setNextEventId(null);
        nav.goBattle();
    };

    const handleAutoMiningEntry = () => {
        nav.goResult("auto_mining");
    };

    // [Fix] 노드 ID도 같이 받아서 기억해둡니다.
    const handleStartStoryEvent = (eventId, nodeId) => {
        setNextEventId(eventId);
        if (nodeId) setCurrentNodeId(nodeId);
        nav.goEvent();
    };

    const onGameEnd = useCallback(
        (result) => {
            if (result === "win") {
                if (data.addExp) data.addExp(50);

                if (battleType === "mining_chip") {
                    const rewardAmount = Math.floor(Math.random() * 2) + 4;
                    data.addResource("chip_basic", rewardAmount);
                    setBattleRewards([
                        {
                            id: "chip_basic",
                            name: "데이터 보강칩",
                            count: rewardAmount,
                        },
                    ]);
                } else if (battleType === "mining_stone") {
                    const rewardAmount = Math.floor(Math.random() * 2) + 1;
                    data.addResource("causality_stone", rewardAmount);
                    setBattleRewards([
                        {
                            id: "causality_stone",
                            name: "인과석",
                            count: rewardAmount,
                        },
                    ]);
                } else if (battleType === "mining_gear") {
                    const dropCount = Math.floor(Math.random() * 2) + 3;
                    const newItems = [];
                    const miningSlotKeys = ["SLOT_1", "SLOT_2"];

                    for (let i = 0; i < dropCount; i++) {
                        const randomSlotKey =
                            miningSlotKeys[
                                Math.floor(
                                    Math.random() * miningSlotKeys.length,
                                )
                            ];
                        const slotType = EQUIP_SLOTS[randomSlotKey];

                        const generatedItem = generateEquipment(slotType);
                        data.addEquipment(generatedItem);

                        newItems.push({
                            id: generatedItem.id,
                            name: generatedItem.name,
                            count: 1,
                            rarity: generatedItem.rarity,
                        });
                    }
                    setBattleRewards(newItems);
                } else {
                    setBattleRewards([]);
                }
            } else {
                setBattleRewards([]);
            }

            // [Fix] 전투 직후에 엉뚱한 ID를 클리어 기록에 넣던 버그 로직을 삭제했습니다!

            nav.goResult(result);
        },
        [nav, battleType, data, nextEventId],
    );

    const handleEventComplete = (nextAction) => {
        if (data.addExp) data.addExp(20);

        if (typeof nextAction === "string") {
            if (nextAction.startsWith("battle:")) {
                const parts = nextAction.split(":");
                const enemyId = parts[1];
                const nextEvtId = parts[2] || null;

                setCurrentEnemyId(enemyId);
                setBattleType("story");
                setNextEventId(nextEvtId);
                nav.goBattle();
            } else if (nextAction === "story_node_select") {
                // [Fix] 스토리가 완전히 끝났을 때! 우리가 진입했던 진짜 노드 ID에 도장을 찍습니다.
                if (currentNodeId && data.completeStoryNode) {
                    data.completeStoryNode(currentNodeId);
                }
                nav.goStoryNodeSelect();
            } else {
                nav.goHome();
            }
        } else {
            if (currentNodeId && data.completeStoryNode) {
                data.completeStoryNode(currentNodeId);
            }
            nav.goHome();
        }
    };

    const handleRetryBattle = () => {
        nav.goBattle();
    };

    const handleLeaveBattle = () => {
        if (battleType === "story" && nextEventId) {
            nav.goEvent();
        } else if (battleType.startsWith("mining")) {
            nav.goDirectMiningSelect();
        } else {
            nav.goHome();
        }
    };

    const initialParty = useMemo(
        () => data.partyList.map((p) => data.roster.find((r) => r.id === p.id)),
        [data.partyList, data.roster],
    );

    const battleState = {
        currentEnemyId,
        battleType,
        battleRewards,
        isStoryChain: !!nextEventId,
    };

    const handlers = {
        handleContentSelect,
        handleDirectMining,
        handleStartMiningBattle,
        handleAutoMiningEntry,
        handleStartStoryEvent,
        onGameEnd,
        handleEventComplete,
        handleRetryBattle,
        handleLeaveBattle,
    };

    return (
        // [Fix] 바깥쪽에 전체 화면을 덮는 검은 바탕을 깔고 정중앙에 배치하도록 수정했습니다.
        <div className="flex items-center justify-center min-h-screen w-full bg-black">
            {/* [Fix] 높이는 기본적으로 꽉 채우되(100dvh), 최대 850px까지만 늘어나도록 제한(max-h-[850px])했습니다. 
          상하 제한이 생겼으므로 border-x 대신 테두리 전체(border)를 그려주어 예쁘게 마감했습니다. */}
            <div className="flex flex-col h-[100dvh] max-h-[850px] w-full max-w-md bg-[#0f172a] overflow-hidden font-sans border border-white/10 shadow-2xl text-slate-100 selection:bg-cyan-500/30 relative">
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#0f172a] pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="star"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 2 + 1}px`,
                                height: `${Math.random() * 2 + 1}px`,
                                animationDelay: `${Math.random() * 3}s`,
                            }}
                        ></div>
                    ))}
                </div>

                <GameRouter
                    nav={nav}
                    data={data}
                    battleState={battleState}
                    handlers={handlers}
                    initialParty={initialParty}
                    activeEventId={nextEventId || "evt_prologue_start"}
                />
            </div>
        </div>
    );
}
