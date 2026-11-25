export const CALLS = ["Hero.fresh()", "Hero.shared()"];

export function lines(a, b) {
  return [
    "class Hero {",
    "  Hero.fresh();",
    "  static final _one = Hero.fresh();",
    "  factory Hero.shared() => _one;",
    "}",
    "",
    "void main() {",
    `  final a = ${a};`,
    `  final b = ${b};`,
    "  print(identical(a, b));",
    "}",
  ];
}

export function sameObject(a, b) {
  return a === CALLS[1] && b === CALLS[1];
}
