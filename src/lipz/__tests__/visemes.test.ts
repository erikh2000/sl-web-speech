import Viseme, { visemeToText, textToViseme } from "../visemes";

describe('visemes', () => {
  it('all the visemes code and decode to same value', () => {
    for (let i = 0; i < Viseme.COUNT; i++) {
      expect(textToViseme(visemeToText(i))).toEqual(i);
    }
  });
});