enum Viseme {
  REST,
  AI,
  CONS,
  E,
  FV,
  L,
  O,
  MBP,
  U,
  WQ,
  COUNT
};

export function visemeToText(viseme:Viseme) {
  switch(viseme) {
    case Viseme.REST: return 'rest';
    case Viseme.AI: return 'ai';
    case Viseme.CONS: return 'cons';
    case Viseme.E: return 'e';
    case Viseme.FV: return 'fv';
    case Viseme.L: return 'l';
    case Viseme.O: return 'o';
    case Viseme.MBP: return 'mbp';
    case Viseme.U: return 'u';
    case Viseme.WQ: return 'wq';
  }
}

export default Viseme;

// I gave up on exporting enums from the library. There doesn't seem to be a straightforward way to do it that doesn't
// cause other problems.
// https://ncjamieson.com/dont-export-const-enums/
// https://www.typescriptlang.org/tsconfig#preserveConstEnums