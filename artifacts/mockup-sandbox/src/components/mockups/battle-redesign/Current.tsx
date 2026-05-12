import React from "react";
import {
  Sword, Shield, Zap, Sparkles, Brain, Heart,
  AlertTriangle, Crosshair,
} from "lucide-react";
import { Scene, scenarioState } from "./_shared";

export function Current() {
  return <Scene variant="current" state={scenarioState} />;
}
