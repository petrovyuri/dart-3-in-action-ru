export const PRESETS = [
  { label: "Интерфейс", value: "interface" },
  { label: "Базовый миксин", value: "mixin" },
  { label: "Порядок", value: "order" },
];

export function sources(mode) {
  if (mode === "interface") {
    return {
      "hero.dart": "abstract interface class Hero {}\n",
      "main.dart": [
        "import 'hero.dart';",
        "",
        "class RedHero implements Hero {}",
        "",
        "void main() => print(RedHero());",
        "",
      ].join("\n"),
    };
  }
  const modifiers = mode === "mixin" ? "abstract base" : "base abstract";
  return {
    "hero.dart": `${modifiers} mixin class Hero {}\n`,
    "main.dart": [
      "import 'hero.dart';",
      "",
      "final class GreenHero with Hero {}",
      "",
      "void main() => print(GreenHero());",
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
