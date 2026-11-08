import 'dart:async';
import 'dart:io';

import 'package:swords_and_magic/swords_and_magic.dart';

// Создаем данные, которые будут
// передаваться на весь контекст зоны
final _values = {
  'version': '0.0.14+14',
};

void main(List<String> arguments) {
  // Создаем спецификацию для игры
  final gameSpecification = ZoneSpecification(
    print: (self, parent, zone, line) {
      parent.print(
          zone, 'Время:${DateTime.now().hour}:${DateTime.now().minute}  $line');
      // При каждом выводе в консоль логируем в файл
      File('swords_and_magic.log').writeAsStringSync(
          'Время:${DateTime.now().hour}:${DateTime.now().minute}  $line\n',
          mode: FileMode.append);
    },
  );
  runZonedGuarded(
      () {
        // Запускаем игру в runZonedGuarded
        startGame();
      },
      zoneSpecification: gameSpecification,
      // Передаем данные в зону
      zoneValues: _values,
      (error, stack) {
        // В случае если мы получаем ошибку в игре
        // Выводим ее в консоль в форматированном виде
        print('Ошибка в игре: $error \n Стек вызовов: $stack');
      });
}
