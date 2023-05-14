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

function _parseDictionary(dictionaryText:string):Dictionary {
  const dictionary:Dictionary = {};
  const entries = dictionaryText.split('\n');
  entries.forEach(entry => {
    if (entry.startsWith(";;;")) return; // Comment line
    const result = _parseEntry(entry);
    if (!result) return;
    const [word, phoneme] = result;
    dictionary[word] = phoneme;
  });
  return dictionary;
}

async function _fetchDictionaryText(dictionaryUrl:string):Promise<string> {
  const response = await fetch(dictionaryUrl);
  return response.text();
}

class PhoneticDictionary {
  private _dictionary:Dictionary;
  
  constructor() {
    this._dictionary = {};
  }
  
  async _fetchDictionaryText(dictionaryUrl:string):Promise<string> {
    return _fetchDictionaryText(dictionaryUrl);
  }
  
  async init(dictionaryUrl:string = '/cmuDict/cmudict-0.7b.txt') {
    const dictionaryText = await this._fetchDictionaryText(dictionaryUrl);
    this._dictionary = _parseDictionary(dictionaryText);
  }
  
  find(word:string):string|null {
    const phonemes = this._dictionary[word];
    return phonemes ? phonemes : null;
  }
}

export default PhoneticDictionary;