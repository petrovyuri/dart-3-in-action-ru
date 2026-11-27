export const PRESETS = [
  { label: "Два героя", value: "two" },
  { label: "+ WhiteHero", value: "missing" },
  { label: "+ Ветка", value: "complete" },
];

export function lines(mode) {
  return [
    "sealed class Hero {}",
    "",
    "class RedHero extends Hero {}",
    "",
    "class GreenHero extends Hero {}",
    ...(mode === "two" ? [] : ["", "class WhiteHero extends Hero {}"]),
    "",
    "String findHero(Hero h) => switch (h) {",
    "  RedHero _ => 'RED',",
    "  GreenHero _ => 'GREEN',",
    ...(mode === "complete" ? ["  WhiteHero _ => 'WHITE',"] : []),
    "};",
    "",
    "void main() {",
    "  print(findHero(RedHero()));",
    "  print(findHero(GreenHero()));",
    ...(mode === "two" ? [] : ["  print(findHero(WhiteHero()));"]),
    "}",
  ];
}
