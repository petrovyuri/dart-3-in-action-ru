"""Проверяет файлы и локальные ссылки статического сайта перед публикацией."""

import json
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    """Собирает адреса ресурсов и ссылок из HTML."""

    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.links.append(value)


def check():
    """Завершает проверку ошибкой при потере ресурса или лишних приватных файлах."""
    docs = ROOT / "docs"
    failures = []
    for page in docs.rglob("*.html"):
        parser = Links()
        parser.feed(page.read_text(encoding="utf-8"))
        for link in parser.links:
            url = urlsplit(link)
            if url.scheme or url.netloc or not url.path:
                continue
            target = (page.parent / unquote(url.path)).resolve()
            if not target.is_relative_to(docs.resolve()) or not target.exists():
                failures.append(f"Не найден ресурс {link} в {page.relative_to(ROOT)}")
    forbidden = {"out", ".env", "golden.json", "step-sources.json", "manifest.json"}
    for name in json.loads((ROOT / "public-files.json").read_text(encoding="utf-8")):
        if forbidden.intersection(Path(name).parts):
            failures.append(f"В публичный экспорт попал служебный файл: {name}")
        if not (ROOT / name).is_file():
            failures.append(f"Отсутствует файл экспорта: {name}")
    if failures:
        raise SystemExit("\n".join(failures))
    for script in docs.rglob("*.js"):
        result = subprocess.run(["node", "--check", str(script)], check=False)
        if result.returncode:
            raise SystemExit(f"Ошибка JavaScript в {script.relative_to(ROOT)}")
    print("Публичный сайт: локальные ссылки и состав файлов проверены.")


if __name__ == "__main__":
    check()
