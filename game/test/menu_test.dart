import 'dart:async';

import 'package:swords_and_magic/features/menu/menu.dart';
import 'package:test/test.dart';

void main() {
  test('Недопустимый пункт не запускает игровые действия', () {
    for (final item in [-1, 0, 4]) {
      final calls = <String>[];
      final messages = <String>[];
      runZoned(
        () => const Menu().enterMenu(
          menuItem: item,
          isStartNewGame: () => calls.add('новая'),
          isLoadGame: () => calls.add('загрузка'),
          isExitGame: () => calls.add('выход'),
        ),
        zoneSpecification: ZoneSpecification(
          print: (self, parent, zone, line) => messages.add(line),
        ),
      );
      expect(calls, isEmpty);
      expect(messages.single, contains('от 1 до 3'));
    }
  });

  test('Пункты меню вызывают только выбранное действие', () {
    for (var item = 1; item <= 3; item++) {
      final calls = <int>[];
      const Menu().enterMenu(
        menuItem: item,
        isStartNewGame: () => calls.add(1),
        isLoadGame: () => calls.add(2),
        isExitGame: () => calls.add(3),
      );
      expect(calls, [item]);
    }
  });
}
