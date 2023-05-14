import {replacePathExtension} from '../pathUtil';

describe('pathUtil', () => {
  describe('replacePathExtension()', () => {
    it('replaces extension', () => {
      expect(replacePathExtension('foo.wav', '.txt')).toEqual('foo.txt');
    });
    
    it('replaces extension with no dot', () => {
      expect(replacePathExtension('foo.wav', 'txt')).toEqual('foo.txt');
    });
    
    it('appends extension when path has no extension', () => {
      expect(replacePathExtension('foo', '.txt')).toEqual('foo.txt');
    });
  });
});