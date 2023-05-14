import LipzEvent from "../LipzEvent";

describe('LipzEvent', () => {
  it('can be constructed', () => {
    const time = 0;
    const viseme = 1;
    const phoneme = 'a';
    const lipzEvent = new LipzEvent(time, viseme, phoneme);
    expect(lipzEvent.getTime()).toEqual(time);
    expect(lipzEvent.viseme).toEqual(viseme);
    expect(lipzEvent.phoneme).toEqual(phoneme);
  });
  
  it('when constructed without a phoneme, the phoneme is empty', () => {
    const time = 0;
    const viseme = 1;
    const lipzEvent = new LipzEvent(time, viseme);
    expect(lipzEvent.getTime()).toEqual(time);
    expect(lipzEvent.viseme).toEqual(viseme);
    expect(lipzEvent.phoneme).toEqual('');
  });
});