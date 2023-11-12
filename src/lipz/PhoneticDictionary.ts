type Dictionary = {
  [word: string]:string;
};

// If you are using sl-web-speech in your own project, this URL below won't work for your app in production due to 
// CORS restrictions. However, in your local development, you can use "localhost:3000" (added a CORS allowance for 
// that one) as long as you don't go crazy with the number of requests. (I'll just remove the allowance.) When you
// you get to a production deployment, you can download the file from Carnegie Mellon University's website and host 
// it yourself, following their licensing terms. See http://www.speech.cs.cmu.edu/cgi-bin/cmudict for details. In 
// this case, pass the correct URL to init() as the first parameter. Also, three cheers for CMU for making this 
// valuable data available!
export const WISP_DEFAULT_PHONETIC_DICTIONARY_URL = 'https://shared.wisp.studio/cmudict/cmudict-0.7b.txt';

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
  const response = await fetch(dictionaryUrl, { mode: 'cors' });
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
  
  async init(dictionaryUrl:string) {
    const dictionaryText = await this._fetchDictionaryText(dictionaryUrl);
    this._dictionary = _parseDictionary(dictionaryText);
  }
  
  find(word:string):string|null {
    const phonemes = this._dictionary[word];
    return phonemes ? phonemes : null;
  }
}

export default PhoneticDictionary;