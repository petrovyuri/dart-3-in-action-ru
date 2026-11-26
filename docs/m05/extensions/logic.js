export const PRESETS = [
  { label: "Hero", value: "hero" },
  { label: "Object", value: "object" },
  { label: "dynamic", value: "dynamic" },
];

const TYPES = { hero: "Hero", object: "Object", dynamic: "dynamic" };

export function lines(mode) {
  return [
    "class Hero {",
    "  final age = 16;",
    "}",
    "",
    "extension ExtHero on Hero {",
    "  void formatPrintAge() {",
    "    print('Возраст героя: $age');",
    "  }",
    "}",
    "",
    "void main() {",
    `  ${TYPES[mode]} hero = Hero();`,
    "  hero.formatPrintAge();",
    "}",
  ];
}

const RESULTS = {
  hero: { output: "Возраст героя: 16", diagnostic: "", exception: "" },
  object: { output: "", diagnostic: "undefined_method", exception: "" },
  dynamic: { output: "", diagnostic: "", exception: "NoSuchMethodError" },
};

export function execute(mode) {
  return RESULTS[mode];
}
