import PhoneticDictionary from "../PhoneticDictionary";

type Dictionary = {
  [word: string]:string;
};

function _mockFetchDictionaryText(phoneticDictionary:PhoneticDictionary, dictionaryText:string) {
  const mockLoadDictionary = jest.spyOn(PhoneticDictionary.prototype, '_fetchDictionaryText');
  mockLoadDictionary.mockImplementation(async ():Promise<string> => dictionaryText);
}
 

describe('PhoneticDictionary', () => {
  it('can be constructed', () => {
    const phoneticDictionary = new PhoneticDictionary();
    expect(phoneticDictionary).toBeDefined();
  });
  
  it('when not initialized, find() returns null.', () => {
    const phoneticDictionary = new PhoneticDictionary();
    expect(phoneticDictionary.find('hello')).toBeNull();
  });
  
  it('when initialized, find() returns the phonemes for a word.', (done) => {
    async function _fakeLoadDictionary():Promise<Dictionary> {
      const dictionary:Dictionary = {
        'hello': 'hh ah l ow'
      };
      return Promise.resolve(dictionary);
    }
    
    // Mock the _loadDictionary() method within the phoneicDictionary instance.
    const phoneticDictionary = new PhoneticDictionary();
    _mockFetchDictionaryText(phoneticDictionary, 'HELLO  HH AH0 L OW1\nHELLO(1)  HH EH0 L OW1\n;;;\nHELLRAISER  HH EH1 L R EY2 Z ER0');
        
    phoneticDictionary.init().then(() => {
      expect(phoneticDictionary.find('hello')).toEqual('hh ah l ow');
      done();
    });
  });
});