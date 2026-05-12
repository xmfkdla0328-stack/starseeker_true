import React from "react";
import { Scene, scenarioState } from "./_shared";

export function ModeAware() {
  return <Scene variant="mode-aware" state={scenarioState} />;
}
