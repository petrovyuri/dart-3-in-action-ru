import 'dart:convert';

import 'package:swords_and_magic/features/player/player_entity.dart';
import 'package:test/test.dart';

void main() {
  test('Персонаж сохраняет данные после записи в JSON и чтения', () {
    final player = PlayerEntity.create(
      inPlayerName: 'Юрий',
      inPlayerClass: '3',
    );
    final restored = PlayerEntity.fromJson(
      jsonDecode(jsonEncode(player.toJson())) as Map<String, dynamic>,
    );
    expect(restored.toJson(), player.toJson());
    expect(restored.playerName, 'Юрий');
    expect(restored.spells, isNotEmpty);
  });

  test('Пустое имя заменяется сгенерированным', () {
    final player = PlayerEntity.create(
      inPlayerName: '',
      inPlayerClass: '1',
    );
    expect(player.playerName, isNotEmpty);
  });
}
