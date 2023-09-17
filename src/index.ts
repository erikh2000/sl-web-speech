// Classes
export { default as Recognizer } from './speech/Recognizer';
export { default as WordTimelineExtractor } from './speech/WordTimelineExtractor';
export { default as EventIterator } from './common/EventIterator';
export { default as LipzEvent } from './lipz/LipzEvent';

// Types and interfaces
export type { default as IIterableEvent } from './common/IIterableEvent';
export type { WordTimeline, WordTiming } from './speech/WordTimelineExtractor';
export type { PhonemeTimeline, PhonemeTiming } from './lipz/lipzGenerationUtil';

// API functions
export * from './lipz/lipzGenerationUtil';
export * from './lipz/lipzFileUtil';
export * from './lipz/phonemeUtil';
export * from './lipz/visemes';
export * from './common/languages';

/* This file only imports and re-exports top-level APIs and has been excluded from Jest 
   coverage reporting in package.json. Exports are tested via unit tests associated
   with the import module. */