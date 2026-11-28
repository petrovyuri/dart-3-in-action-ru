export const PRESETS = [
  { label: "Из main", value: "main" },
  { label: "Из А", value: "first" },
  { label: "Из Б", value: "second" },
];

export function lines(mode) {
  function event(label, schedulesMicrotask) {
    if (schedulesMicrotask) {
      return [
        "  Future(() {",
        `    print('${label}');`,
        "    micro();",
        "  });",
      ];
    }
    return [`  Future(() => print('${label}'));`];
  }

  return [
    "import 'dart:async';",
    "",
    "void micro() {",
    "  scheduleMicrotask(() => print('М'));",
    "}",
    "",
    "void main() {",
    ...event("А", mode === "first"),
    ...(mode === "main" ? ["  micro();"] : []),
    ...event("Б", mode === "second"),
    "  print('main');",
    "}",
  ];
}
