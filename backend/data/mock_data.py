from __future__ import annotations

import json
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).resolve().parent


def load_json(filename: str) -> list[dict[str, Any]]:
    with (DATA_DIR / filename).open("r", encoding="utf-8") as data_file:
        payload = json.load(data_file)

    if not isinstance(payload, list):
        raise ValueError(f"{filename} must contain a JSON array")

    return payload