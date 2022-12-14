import PhoneticDictionary from "./PhoneticDictionary";

import WordTimelineExtractor, {WordTimeline, WordTiming} from '../speech/WordTimelineExtractor';
import LipzEvent from './LipzEvent';
import { loadLipzFromText } from './lipzFileUtil';
import { phonemeToViseme } from './phonemeUtil';
import Viseme from './visemes';

export type PhonemeTiming = {
  phoneme:string,
  isConsonant:boolean,
  time:number
};
export type PhonemeTimeline = PhonemeTiming[];

// Minimum gap between words (milliseconds) that is needed to generate a "rest" viseme. 
const REST_BETWEEN_WORDS_THRESHOLD = 300;

// Frames per second to use for expressing phoneme positions in final generation. You want the lowest value that doesn't
// noticeably degrade animation quality. Why lower? Because hand edits are easier and the .lipz files smaller. The 
// sweet spot is likely to be between 20 and 30 FPS.
const FRAMES_PER_SECOND = 24;

// # of milliseconds between frames.
const MSECS_PER_FRAME = 1000 / FRAMES_PER_SECOND;

// The maximum gap (milliseconds) between words to consider the last consonant of the first word to be part of a 
// consonant group in the second word.
const SPAN_CONSONANT_GROUP_BETWEEN_WORDS_THRESHOLD = 10;

// If a word seems to be spoken at a normal speed, this is a typical amount of time (milliseconds) to spend showing 
// the viseme for a consonant group. It is skewed a little longer than the typical duration of a consonant in real 
// speech to favor showing the viseme long enough for the human eye to notice it.
const PREFERRED_CONSONANT_DURATION = 90;

// For a group of phonemes within a word, I want to show each phoneme for at least this long. The reasons for choosing
// this value are probably exactly the same as PREFERRED_CONSONANT_DURATION.
const PREFERRED_MINIMUM_PHONEME_DURATION = 90;

let phoneticDictionary:PhoneticDictionary|null = null;
let extractor:WordTimelineExtractor|null = null;

function _isConsonantViseme(viseme:Viseme):boolean {
  return (viseme === Viseme.CONS || viseme === Viseme.WQ || viseme === Viseme.MBP || viseme === Viseme.L || viseme === Viseme.FV);
}

function _isConsonantPhoneme(phoneme:string):boolean {
  const viseme = phonemeToViseme(phoneme);
  return _isConsonantViseme(viseme);
}

function _consolidateConsonants(phonemesArray:string[], spanningConsonantPhoneme:PhonemeTiming|null):string[] {
  const consolidatedPhonemes:string[] = [];
  let mostExpressiveVisemeInGroup:Viseme = spanningConsonantPhoneme ? phonemeToViseme(spanningConsonantPhoneme.phoneme) : Viseme.REST;
  let isInConsonantGroup:boolean = spanningConsonantPhoneme !== null;
  let firstConsonantGroupI:number = 0;
  phonemesArray.forEach(phoneme => {
    const viseme = phonemeToViseme(phoneme);
    if (_isConsonantViseme(viseme)) {
      if (isInConsonantGroup) {
        if (_isVisemeMoreExpressive(viseme, mostExpressiveVisemeInGroup)) {
          if (spanningConsonantPhoneme) {
            spanningConsonantPhoneme.phoneme = phoneme;
          } else {
            consolidatedPhonemes[firstConsonantGroupI] = phoneme;
          }
          mostExpressiveVisemeInGroup = viseme;
        }
      } else {
        isInConsonantGroup = true;
        mostExpressiveVisemeInGroup = viseme;
        firstConsonantGroupI = consolidatedPhonemes.length;
        consolidatedPhonemes.push(phoneme);
      }
    } else {
      isInConsonantGroup = false;
      spanningConsonantPhoneme = null; // Past any opportunity for a consonant group to span words.
      consolidatedPhonemes.push(phoneme);
    }
  });
  return consolidatedPhonemes;
}

function _countConsonantsAndVowels(phonemesArray:string[]):[consonantCount:number, vowelCount:number, totalCount:number] {
  let consonantCount = 0, vowelCount = 0;
  phonemesArray.forEach(phoneme => {
    if (_isConsonantPhoneme(phoneme)) {
      ++consonantCount;
    } else if (phoneme !== '.') {
      ++vowelCount;
    }
  });
  return [consonantCount, vowelCount, consonantCount+vowelCount];
}

function _calcPhonemeDurationsForWord(phonemesArray:string[], wordDuration:number):[consonantDuration:number, vowelDuration:number, isSquished:boolean] {
  const [consonantCount, vowelCount, totalCount] = _countConsonantsAndVowels(phonemesArray);
  
  const consonantDuration = PREFERRED_CONSONANT_DURATION;
  const vowelDuration = vowelCount <= 0 ? 0 : (wordDuration - (consonantDuration * consonantCount)) / vowelCount;
  const isSquished = (totalCount * PREFERRED_MINIMUM_PHONEME_DURATION > wordDuration) || vowelDuration < consonantDuration;
  if (!isSquished) return [consonantDuration, vowelDuration, isSquished];
  
  // The word is so short that any spacing refinements will be detrimental to its expression.
  const equidistantSpacing = wordDuration / totalCount;
  return [equidistantSpacing, equidistantSpacing, isSquished];
}

function _wordToPhonemeTimeline(wordTimeline:WordTimeline):PhonemeTimeline {
  const phonemeTimeline:PhonemeTimeline = [];
  let spanningConsonantPhoneme:PhonemeTiming|null = null;
  wordTimeline.forEach((wordTiming:WordTiming, wordNo:number) => {
    if (!phoneticDictionary) throw Error('Phonetic dictionary not loaded.');
    const { startTime, endTime, word } = wordTiming;
    const phonemes = phoneticDictionary.find(word);
    if (!phonemes) return;
    const phonemesArray = _consolidateConsonants(phonemes.split(' '), spanningConsonantPhoneme);
    spanningConsonantPhoneme = null;
    const [consonantDuration, vowelDuration, isSquished] = _calcPhonemeDurationsForWord(phonemesArray, endTime-startTime);
    let time = startTime;
    phonemesArray.forEach(phoneme => {
      const phonemeTiming = {phoneme, time, isConsonant:_isConsonantPhoneme(phoneme)};
      phonemeTimeline.push(phonemeTiming);
      spanningConsonantPhoneme = phonemeTiming.isConsonant ? phonemeTiming : null;
      time += (phonemeTiming.isConsonant ? consonantDuration : vowelDuration);
    });
    const gapToNextWord = wordNo < wordTimeline.length-1 ? wordTimeline[wordNo+1].startTime - endTime : 0;  
    if (wordNo === wordTimeline.length-1 || gapToNextWord > REST_BETWEEN_WORDS_THRESHOLD) {
      phonemeTimeline.push({phoneme:'-', time:endTime, isConsonant:false});
    }
    if (!isSquished || gapToNextWord > SPAN_CONSONANT_GROUP_BETWEEN_WORDS_THRESHOLD) spanningConsonantPhoneme = null;
  });
  return phonemeTimeline;
}

function _lipzTextToPhonemeTimeline(lipzText:string):PhonemeTimeline {
  const lipzEvents = loadLipzFromText(lipzText);
  return lipzEvents.map((lipzEvent:LipzEvent) => {
    return {
      phoneme:lipzEvent.phoneme,
      isConsonant: _isConsonantViseme(lipzEvent.viseme),
      time:lipzEvent.getTime()*1000
    }
  });
}

function _timeToFrameNo(time:number) {
  return Math.round(time / MSECS_PER_FRAME);  
}

/*                             REST, AI, CONS, E, FV, L, O,MBP, U, WQ */
const visemeExpressiveScore = [0,    2,  1,    2, 4,  4, 3,3,   2, 3]; 
function _isVisemeMoreExpressive(viseme:Viseme, than:Viseme):boolean {
  return visemeExpressiveScore[viseme] > visemeExpressiveScore[than];
}

function _phonemeTimelineAndAudioToLipzText(phonemeTimeline:PhonemeTimeline, audioBuffer:AudioBuffer):string {
  const frameCount = Math.ceil((audioBuffer.duration * 1000) / MSECS_PER_FRAME);
  const frames:string[] = [];
  for(let fillI = 0; fillI < frameCount; ++fillI) { frames[fillI] = ' '; }
  
  phonemeTimeline.forEach(phonemeTiming => {
    const { phoneme, time } = phonemeTiming;
    const frameNo = _timeToFrameNo(time);
    const currentPhoneme = frames[frameNo] ?? ' ';
    if (currentPhoneme === ' ') {
      frames[frameNo] = `${phoneme}.`;
    } else {
      const currentViseme = phonemeToViseme(frames[frameNo]);
      const nextViseme = phonemeToViseme(phoneme);
      if (_isVisemeMoreExpressive(nextViseme, currentViseme)) frames[frameNo] = `${phoneme}.`;
    }
  });
  return frames.join('');
}

export async function init():Promise<void> {
  phoneticDictionary = new PhoneticDictionary();
  await phoneticDictionary.init();

  return new Promise(resolve => {
    extractor = new WordTimelineExtractor(() => {
      resolve();
    })
  });
}

export async function generateLipzTextFromAudioBuffer(audioBuffer:AudioBuffer, debugCapture:any):Promise<string> {
  if (!extractor) throw Error('Called before init() completed.');
  const wordTimeline = await extractor.extract(audioBuffer);
  if (debugCapture) debugCapture.wordTimeline = wordTimeline;
  const phonemeTimeline = _wordToPhonemeTimeline(wordTimeline);
  const lipzText = _phonemeTimelineAndAudioToLipzText(phonemeTimeline, audioBuffer);
  if (debugCapture) debugCapture.phonemeTimeline = _lipzTextToPhonemeTimeline(lipzText);
  return lipzText;
}