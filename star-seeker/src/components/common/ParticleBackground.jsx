import React, { useState, useEffect } from 'react';

export default function ParticleBackground({ color = 'bg-cyan-400' }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // 0.05초마다 실행되는 애니메이션 루프
    const interval = setInterval(() => {
      setParticles(prev => {
        // 1. 기존 파티클 위로 이동 (y값 감소) & 수명 감소
        const newParticles = prev.filter(p => p.life > 0).map(p => ({
          ...p,
          y: p.y - p.speed, // 속도만큼 위로 이동
          life: p.life - 1, // 수명 감소
          opacity: p.life / 50 // 수명이 다해갈수록 투명해짐
        }));

        // 2. 파티클이 20개 미만이면 바닥에서 새로 생성
        if (newParticles.length < 20) {
          newParticles.push({
            id: Math.random(),
            x: Math.random() * 100, // 가로 위치 랜덤 (0~100%)
            y: 100,                 // 시작 위치: 바닥 (100%)
            speed: Math.random() * 0.5 + 0.2, // 올라가는 속도 랜덤
            life: 50 + Math.random() * 50,    // 수명 랜덤
            opacity: 1
          });
        }
        return newParticles;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div 
          key={p.id}
          // 전달받은 색상 클래스 적용 (기본값: bg-cyan-400)
          className={`absolute w-1 h-1 rounded-full blur-[1px] ${color}`}
          style={{ 
            left: `${p.x}%`, 
            top: `${p.y}%`, 
            opacity: p.opacity,
            transition: 'top 50ms linear' // 끊김 없는 이동을 위한 보간
          }}
        />
      ))}
    </div>
  );
}