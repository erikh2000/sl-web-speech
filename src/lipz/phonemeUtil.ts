import ArpabetToBlair from "./ArpabetToBlair";
import Viseme, {visemeToText} from './visemes';

export function phonemeToViseme(phoneme:string):Viseme {
  const viseme = ArpabetToBlair[phoneme];
  if (viseme !== undefined) return viseme;
  console.warn(`Unexpected "${phoneme}" phoneme could not be mapped to a viseme.`);
  return Viseme.REST;
}

export function phonemeToVisemeText(phoneme:string):string {
  const viseme = phonemeToViseme(phoneme);
  return visemeToText(viseme) ?? 'rest';
}