export const PRESETS = [
  { label: "RedHero без final", value: "original" },
  { label: "RedHero с final", value: "inside" },
  { label: "Две библиотеки", value: "outside" },
];

export function sources(mode) {
  const hero = "final class Hero {}\n";
  const subtype =
    mode === "original"
      ? "class RedHero extends Hero {}"
      : "final class RedHero extends Hero {}";
  const main = `${subtype}\n\nvoid main() {\n  print(RedHero());\n}\n`;
  if (mode === "outside") {
    return { "hero.dart": hero, "main.dart": `import 'hero.dart';\n\n${main}` };
  }
  return { "main.dart": `${hero}\n${main}` };
}

export function lines(mode) {
  const programs = sources(mode);
  return Object.entries(programs).flatMap(([name, source], index) => [
    ...(index ? [""] : []),
    `// ${name}`,
    ...source.trimEnd().split("\n"),
  ]);
}
