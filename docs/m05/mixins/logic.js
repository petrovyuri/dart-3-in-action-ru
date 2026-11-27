export const PRESETS = [
  { label: "RedHero справа", value: "red-last" },
  { label: "WhiteHero справа", value: "white-last" },
  { label: "PlainHero", value: "plain" },
];

const MIXINS = {
  "red-last": "WhiteHero, RedHero",
  "white-last": "RedHero, WhiteHero",
  plain: "WhiteHero, PlainHero",
};

export function lines(mode) {
  return [
    "mixin WhiteHero {",
    "  void move() => print('Полёт');",
    "}",
    "",
    "mixin class RedHero {",
    "  void move() => print('Бег');",
    "}",
    "",
    "class PlainHero {}",
    "",
    `class SuperHero with ${MIXINS[mode]} {}`,
    "",
    "void main() => SuperHero().move();",
  ];
}

const RESULTS = {
  "red-last": { output: "Бег", diagnostic: "" },
  "white-last": { output: "Полёт", diagnostic: "" },
  plain: { output: "", diagnostic: "class_used_as_mixin" },
};

export function execute(mode) {
  return RESULTS[mode];
}
