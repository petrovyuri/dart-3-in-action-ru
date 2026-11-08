import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';

void main() {
  test('Выход из меню сохраняет прежний файл персонажа', () async {
    final temporary = await Directory.systemTemp.createTemp('dart3-game-test-');
    final entry = File('bin/main.dart').absolute.path;
    final packages = File('.dart_tool/package_config.json').absolute.path;
    final save = File('${temporary.path}/playerEntityJson.json');
    const original = '{"playerName":"Прежнее сохранение"}';
    await save.writeAsString(original);
    Process? process;
    try {
      process = await Process.start(
        Platform.resolvedExecutable,
        ['--packages=$packages', entry],
        workingDirectory: temporary.path,
      );
      final output = process.stdout.transform(utf8.decoder).join();
      final errors = process.stderr.transform(utf8.decoder).join();
      process.stdin.writeln('3');
      await process.stdin.close();
      final result =
          await process.exitCode.timeout(const Duration(seconds: 30));
      expect(result, 0, reason: await errors);
      expect(await output, contains('Выход из игры'));
      expect(await save.readAsString(), original);
    } finally {
      process?.kill();
      final target = await temporary.resolveSymbolicLinks();
      final parent = await Directory.systemTemp.resolveSymbolicLinks();
      if (!target.startsWith('$parent${Platform.pathSeparator}')) {
        throw StateError(
            'Временная папка оказалась вне системной папки тестов.');
      }
      await temporary.delete(recursive: true);
    }
  });
}
