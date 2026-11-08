# 8.7 Мечи и Магия. Добавляем в игру режим «Бога»

Требуется Dart SDK. Проверено с Dart 3.11.0.

```sh
dart pub get
dart run bin/main.dart
```

В меню введите `1` для новой игры, `2` для загрузки или `3` для выхода. Во время игры команда `exit` сохраняет персонажа и завершает программу.

Режим усиленного персонажа:

```sh
dart run --define=SUPER_MODE=true bin/main.dart
```

Сохранение записывается в `playerEntityJson.json`, журнал в `swords_and_magic.log`.
