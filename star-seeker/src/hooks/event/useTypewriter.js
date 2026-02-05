import { useState, useEffect, useRef } from 'react';

export default function useTypewriter(text, speed = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // 초기화
    setDisplayedText("");
    setIsTyping(true);
    
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!text) {
        setIsTyping(false);
        return;
    }

    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));

        if (currentIndex >= text.length) {
            clearInterval(intervalRef.current);
            setIsTyping(false);
        }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [text, speed]);

  // 강제로 타이핑을 끝내는 함수 (스킵용)
  const forceComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedText(text);
    setIsTyping(false);
  };

  return { displayedText, isTyping, forceComplete };
}