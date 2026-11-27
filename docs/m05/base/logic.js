export const PRESETS = [
  { label: "extends", value: "extends" },
  { label: "implements", value: "implements" },
  { label: "Без final", value: "unmarked" },
];

const SUBTYPES = {
  extends: "final class RedHero extends Hero {}",
  implements: "final class RedHero implements Hero {}",
  unmarked: "class RedHero extends Hero {}",
};

export function sources(mode) {
  return {
    "hero.dart": [
      "base class Hero {",
      "  Hero() {",
      "    print('Вызван Hero().');",
      "  }",
      "}",
      "",
    ].join("\n"),
    "main.dart": [
      "import 'hero.dart';",
      "",
      SUBTYPES[mode],
      "",
      "void main() => RedHero();",
      "",
    ].join("\n"),
  };
}

export function lines(mode) {
  return Object.entries(sources(mode)).flatMap(([name, source], index) => [
    ...(index ? [""] : []),
    `// ${name}`,
    ...source.trimEnd().split("\n"),
  ]);
}
