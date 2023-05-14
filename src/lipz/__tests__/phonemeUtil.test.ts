import { phonemeToViseme, phonemeToVisemeText } from '../phonemeUtil';
import Viseme from '../visemes';

describe('phonemeUtil', () => {
  describe('phonemeToViseme()', () => {
    it('maps phoneme to viseme', () => {
      expect(phonemeToViseme('aa')).toEqual(Viseme.E);
    });
    
    it('maps an unknown phoneme to REST', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(phonemeToViseme('foo')).toEqual(Viseme.REST);
    });
  });
  
  describe('phonemeToVisemeText()', () => {
    it('maps phoneme to viseme text', () => {
      expect(phonemeToVisemeText('aa')).toEqual('e');
    });
    
    it('maps an unknown phoneme to REST', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(phonemeToVisemeText('foo')).toEqual('rest');
    });
  });
});