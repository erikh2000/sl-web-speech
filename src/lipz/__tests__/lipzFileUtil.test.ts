import {wavToLipzTextFilename, loadLipzFromText, FRAMES_PER_SECOND} from "../lipzFileUtil";
import LipzEvent from "../LipzEvent";
import Viseme from "../visemes";

describe('lipzFileUtil', () => {
  describe('loadLipzFromText()', () => {
    it('parses empty text to an empty array', () => {
      const lipzText = '';
      const expected:LipzEvent[] = [];
      const events:LipzEvent[] = loadLipzFromText(lipzText);
      expect(events).toEqual(expected);
    });

    it('parses a phoneme on frame 0', () => {
      const lipzText = 'k.';
      const expected:LipzEvent[] = [new LipzEvent(0, Viseme.CONS, 'k')];
      const events:LipzEvent[] = loadLipzFromText(lipzText);
      expect(events).toEqual(expected);
    });

    it('parses a phoneme at end of text with a trailing space', () => {
      const lipzText = 'k. ';
      const expected:LipzEvent[] = [new LipzEvent(0, Viseme.CONS, 'k')];
      const events:LipzEvent[] = loadLipzFromText(lipzText);
      expect(events).toEqual(expected);
    });

    it('parses a phoneme on frame 1', () => {
      const lipzText = ' k.';
      const expected:LipzEvent[] = [new LipzEvent(1/FRAMES_PER_SECOND, Viseme.CONS, 'k')];
      const events:LipzEvent[] = loadLipzFromText(lipzText);
      expect(events).toEqual(expected);
    });

    it('parses two consecutive phonemes', () => {
      const lipzText = 'k.k.';
      const expected:LipzEvent[] = [
        new LipzEvent(0, Viseme.CONS, 'k'),
        new LipzEvent(1/FRAMES_PER_SECOND, Viseme.CONS, 'k')
      ];
      const events:LipzEvent[] = loadLipzFromText(lipzText);
      expect(events).toEqual(expected);
    });

    it('parses two spaced phonemes', () => {
      const lipzText = 'k. k.';
      const expected:LipzEvent[] = [
        new LipzEvent(0, Viseme.CONS, 'k'),
        new LipzEvent(2/FRAMES_PER_SECOND, Viseme.CONS, 'k')
      ];
      const events:LipzEvent[] = loadLipzFromText(lipzText);
      expect(events).toEqual(expected);
    });

    it('parses a rest phoneme', () => {
      const lipzText = 'k.-.';
      const expected:LipzEvent[] = [
        new LipzEvent(0, Viseme.CONS, 'k'),
        new LipzEvent(1/FRAMES_PER_SECOND, Viseme.REST, '-')
      ];
      const events:LipzEvent[] = loadLipzFromText(lipzText);
      expect(events).toEqual(expected);
    });
  });
  
  describe('wavToLipzTextFilename()', () => {
    it('replaces the extension', () => {
      const wavFilename = 'foo.wav';
      const expected = 'foo.lipz.txt';
      const lipzTextFilename = wavToLipzTextFilename(wavFilename);
      expect(lipzTextFilename).toEqual(expected);
    });
  });
});