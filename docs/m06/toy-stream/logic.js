export const PRESETS = [
  { label: "Одна игрушка", value: "one" },
  { label: "Вся партия", value: "batch" },
  { label: "Первые две", value: "two" },
];

export function lines(mode) {
  const source = ["Stream<String> toys() async* {", "  yield 'Мишка';"];
  if (mode !== "one") {
    source.push(
      "  yield* Stream.fromIterable([",
      "    'Кукла', 'Заяц',",
      "  ]);",
    );
  }
  const stream = mode === "two" ? "toys().take(2)" : "toys()";
  return [
    ...source,
    "}",
    "",
    "Future<void> main() async {",
    "  await for (final toy in " + stream + ") {",
    "    print(toy);",
    "  }",
    "}",
  ];
}
