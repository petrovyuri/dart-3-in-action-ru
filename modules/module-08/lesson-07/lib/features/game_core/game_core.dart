import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:swords_and_magic/features/player/player_const.dart';
import 'package:swords_and_magic/features/player/player_entity.dart';

final class GameCore {
  PlayerEntity? playerEntity;
  // Создаем подписку на поток stdin
  late final StreamSubscription<String> subscription;

  GameCore({
    required this.playerEntity,
  });

  startGame() async {
    print("Игра началась...");
    print(
        '${playerEntity?.playerName} Добро в мир Меча и Магии'); // Обращение через класс
    print('Ваш класс ${playerEntity?.playerClass}');
    // Выводим сообщение о жизненной силе
    print('Жизненная сила: ${playerEntity?.lives}');

    /// Подписываемся на поток stdin
    /// С помощью метода [transform(utf8.decoder)] мы получаем строку из потока
    /// Если введено 'exit', выходим из игры
    subscription = stdin
        .transform(utf8.decoder)
        .transform(const LineSplitter())
        .listen((event) {
      if (event.trim() == 'exit') {
        // отменяем подписку и выходим
        subscription.cancel();
        exitGame();
      }
    });
  }

  void exitGame() async {
    if (playerEntity == null) {
      print('Выход из игры');
      exit(0);
    }
    // Создаем файл
    final file = File(PlayerConst.playerEntityJson);
    // Создаем json из playerEntity
    final json = jsonEncode(playerEntity?.toJson());

    print("Игра сохраняется...");
    await file.writeAsString(json).then((_) {
      // Выводим сообщение о успешном сохранении
      print("Игра успешно сохранена");
    }).onError((error, stackTrace) {
      // Выводим сообщение об ошибке
      print("Ошибка сохранения: $error, $stackTrace");
    });

    print("Выход из игры");

    // Закрываем программу со статусом 0
    exit(0);
  }

  void loadGame() async {
    // Создаем файл
    final file = File(PlayerConst.playerEntityJson); // Обращение через класс

    print("Игра загружается...");
    // Читаем json из файла
    await file.readAsString().then((value) {
      // Получаем Map из json
      final data = jsonDecode(value) as Map<String, dynamic>;
      // Получаем сущность из карты
      playerEntity = PlayerEntity.fromJson(data);
      // Выводим сообщение об успешном загрузке
      print("Игра успешно загружена...");
      startGame();
    }).onError((error, stackTrace) {
      print("Отсутствуют сохранения");
      newGame();
    });
  }

  void newGame() {
    print('Новая игра...');

    /// Имя главного героя
    print('Введите имя главного героя:');
    final name = stdin.readLineSync();

    /// Класс главного героя
    print('''
Выберите класс игрока, введите число от 1 до 3:
1.Воин
2.Паладин
3.Маг
''');
    final typeHero = stdin.readLineSync();

    playerEntity = PlayerEntity.create(
        inPlayerName: name ?? '', inPlayerClass: typeHero ?? '');

    // Запускаем ядро игры
    startGame();
  }
}
