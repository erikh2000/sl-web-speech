import { phonemeToViseme } from "./phonemeUtil";
import LipzEvent from "./LipzEvent";
import {replacePathExtension} from '../common/pathUtil';

export const FRAMES_PER_SECOND = 24;
const END_PHONEME_CHAR = '.';

export function loadLipzFromText(phonemesText:string):LipzEvent[] {
  if (phonemesText.endsWith('.')) phonemesText += ' '; // Changing the ending char allow loop logic below to not have "end of file" special-casing.
  const events:LipzEvent[] = [];
  let frameNo = 0;
  let phoneme = "";

  for (let i = 0; i < phonemesText.length; ++i) {
    const c = phonemesText[i];
    if (c === ' ') {
      ++frameNo;
    } else if (c === END_PHONEME_CHAR) {
      const viseme = phonemeToViseme(phoneme);
      const time = frameNo / FRAMES_PER_SECOND;
      events.push(new LipzEvent(time, viseme, phoneme));
      ++frameNo;
      phoneme = '';
    } else {
      phoneme += c;
    }
  }
  return events;
}

export function wavToLipzTextFilename(wavFilename:string):string {
  return replacePathExtension(wavFilename, '.lipz.txt');
}