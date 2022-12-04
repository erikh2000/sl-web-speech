type Dictionary = {
  [word: string]:string;
};

function _normalizePhonemes(phonemes:string) {
  let result = '';
  for(let i = 0; i < phonemes.length; ++i) {
    const c = phonemes[i];
    if (c === ' ' || (c >= 'A' && c <= 'Z')) result += c; // Removes stress#, e.g. "AA1" => "AA".
  }
  return result.toLowerCase();
}

function _parseEntry(entry:string):[word:string, phonemes:string]|null {
  let word:string = '';
  let phonemes:string = '';
  const tokens:string[] = entry.split("  ");
  if (tokens.length !== 2) return null
  word = tokens[0].trim().toLowerCase();
  if (word.endsWith(")")) return null; // Skip alternative pronunciations, e.g. "ACCUSATION(1)".
  phonemes = _normalizePhonemes(tokens[1].trim());
  return [word, phonemes];
}

async function _loadDictionary(dictionaryUrl:string):Promise<Dictionary> {
  const dictionary:Dictionary = {};
  const response = await fetch(dictionaryUrl);
  const text = await response.text();
  
  const entries = text.split('\n');
  entries.forEach(entry => {
    if (entry.startsWith(";;;")) return; // Comment line
    const result = _parseEntry(entry);
    if (!result) return;
    const [word, phoneme] = result;
    dictionary[word] = phoneme;
  });
  return dictionary;
}

class PhoneticDictionary {
  private _dictionary:Dictionary;
  
  constructor() {
    this._dictionary = {};
  }
  
  init(dictionaryUrl:string = '/cmuDict/cmudict-0.7b.txt') {
    _loadDictionary(dictionaryUrl).then((dictionary:Dictionary) => {
      this._dictionary = dictionary; 
    });
  }
  
  find(word:string):string|null {
    const phonemes = this._dictionary[word];
    return phonemes ? phonemes : null;
  }
}

export default PhoneticDictionary;