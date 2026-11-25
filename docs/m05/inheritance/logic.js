export const PRESETS = [
  { label: "super.name", value: "parameter" },
  { label: "super(...)", value: "explicit" },
  { label: "Пропуск", value: "missing" },
];

const DECLARATIONS = {
  parameter: "  const SuperHero({required super.name});",
  explicit: "  const SuperHero({required String name}) : super(name: name);",
  missing: "  const SuperHero({required String name});",
};

export function lines(mode) {
  return [
    "class Hero {",
    "  final String name;",
    "  const Hero({required this.name});",
    "}",
    "",
    "class SuperHero extends Hero {",
    DECLARATIONS[mode],
    "}",
    "",
    "void main() {",
    "  print(const SuperHero(name: 'Yura').name);",
    "}",
  ];
}

export function execute(mode) {
  return mode === "missing"
    ? { output: "", diagnostic: "implicit_super_initializer_missing_arguments" }
    : { output: "Yura", diagnostic: "" };
}
