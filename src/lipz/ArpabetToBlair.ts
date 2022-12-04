import Viseme from "./visemes";

type ArpabetToBlairMap = {
  [phoneme:string]:Viseme
};

const ArpabetToBlair:ArpabetToBlairMap = {
  '-'     : Viseme.REST,
  'aa'    : Viseme.E,
  'ae'    : Viseme.E,
  'ah'    : Viseme.E,
  'ao'    : Viseme.E,
  'aw'    : Viseme.E,
  'ax'    : Viseme.E,
  'ay'    : Viseme.AI,
  'b'     : Viseme.MBP,
  'ch'    : Viseme.CONS,
  'd'     : Viseme.CONS,
  'dx'    : Viseme.CONS,
  'dh'    : Viseme.CONS,
  'eh'    : Viseme.E,
  'em'    : Viseme.E,
  'el'    : Viseme.E,
  'en'    : Viseme.E,
  'eng'   : Viseme.E,
  'er'    : Viseme.E,
  'ey'    : Viseme.AI,
  'f'     : Viseme.FV,
  'g'     : Viseme.CONS,
  'hh'    : Viseme.CONS,
  'ih'    : Viseme.E,
  'iy'    : Viseme.AI,
  'jh'    : Viseme.CONS,
  'k'     : Viseme.CONS,
  'l'     : Viseme.L,
  'm'     : Viseme.MBP,
  'n'     : Viseme.CONS,
  'ng'    : Viseme.CONS,
  'nx'    : Viseme.CONS,
  'ow'    : Viseme.O,
  'oy'    : Viseme.O,
  'p'     : Viseme.MBP,
  'q'     : Viseme.WQ,
  'r'     : Viseme.CONS,
  's'     : Viseme.CONS,
  'sh'    : Viseme.CONS,
  't'     : Viseme.CONS,
  'th'    : Viseme.CONS,
  'uh'    : Viseme.E,
  'uw'    : Viseme.U,
  'v'     : Viseme.FV,
  'w'     : Viseme.WQ,
  'y'     : Viseme.CONS,
  'z'     : Viseme.CONS,
  'zh'    : Viseme.CONS
};

export default ArpabetToBlair;
