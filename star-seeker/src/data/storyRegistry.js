import { prologue_event } from './stories/prologue/prologue1';

export const STORY_DATABASE = {
  'prologue': prologue_event,
};

export const getStoryEvent = (eventId) => {
  return STORY_DATABASE[eventId] || null;
};