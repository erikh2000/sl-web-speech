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

export default Viseme;

// I gave up on exporting enums from the library. There doesn't seem to be a straightforward way to do it that doesn't
// cause other problems.
// https://ncjamieson.com/dont-export-const-enums/
// https://www.typescriptlang.org/tsconfig#preserveConstEnums