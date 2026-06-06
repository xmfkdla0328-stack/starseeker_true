---
name: Story scene effects fire only on currentScene
description: Why story full-skip must stop at keyword/image scenes instead of walking past them
---

# Story scene side-effects are bound to becoming `currentScene`

In the EventScreen story system, certain per-scene side-effects (keyword unlock via
`scene.keywordUnlock`, interactive image cutscenes via `type: 'image_reveal'`) only
trigger when that scene actually becomes the displayed `currentScene` — keyword unlock
runs from a `useEffect` keyed on `currentScene`, and image reveal renders only in its
phase.

**Why:** The full-skip handler walks the scenes array internally and sets only the final
stopping scene as `currentScene`. Any intermediate scene with a side-effect would be
silently skipped (keyword never granted, image never shown).

**How to apply:** When adding any scene type that must be *seen/acquired*, add it to the
skip handler's stop conditions (alongside `choice`/`input`/`keywordUnlock`) so skip halts
ON it and the player must advance manually. Don't try to fire the effect from inside the
skip loop — keep effects driven by `currentScene`.
