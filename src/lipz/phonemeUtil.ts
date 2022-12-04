import ArpabetToBlair from "./ArpabetToBlair";
import Viseme from './visemes';

export function phonemeToViseme(phoneme:string):Viseme {
  const viseme = ArpabetToBlair[phoneme];
  if (viseme !== undefined) return viseme;
  console.warn(`Unexpected "${phoneme}" phoneme could not be mapped to a viseme.`);
  return Viseme.REST;
}