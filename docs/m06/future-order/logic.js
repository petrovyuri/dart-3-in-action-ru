export const PRESETS = [
  { label: "По очереди", value: "ordered" },
  { label: "Вместе", value: "together" },
  { label: "Тайм-аут", value: "timeout" },
];

const programs = {
  ordered: [
    "Future<void> cook(String food) async {",
    "  print('Готовится: $food');",
    "  await Future.pause();",
    "  print('Готово: $food');",
    "}",
    "",
    "Future<void> main() async {",
    "  await cook('Бургер');",
    "  await cook('Кофе');",
    "}",
  ],
  together: [
    "Future<void> cook(String food) async {",
    "  print('Готовится: $food');",
    "  await Future.pause();",
    "  print('Готово: $food');",
    "}",
    "",
    "Future<void> main() async {",
    "  await Future.wait([",
    "    cook('Бургер'),",
    "    cook('Кофе'),",
    "  ]);",
    "}",
  ],
  timeout: [
    "Future<void> main() async {",
    "  final coffee = Future.delayed(",
    "    const Duration(seconds: 1),",
    "    () => 'Кофе готов',",
    "  );",
    "  final result = await coffee.timeout(",
    "    Duration.zero,",
    "    onTimeout: () => 'Время вышло',",
    "  );",
    "  print(result);",
    "  print(await coffee);",
    "}",
  ],
};

export function lines(mode) {
  return programs[mode];
}
