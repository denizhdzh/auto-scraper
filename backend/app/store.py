"""
JSON-backed store — persists vehicles and weights to data/store.json.
Data survives backend restarts.
"""

import json
import os
from typing import Any

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
_STORE_FILE = os.path.join(_DATA_DIR, "store.json")

_vehicles: dict[str, dict] = {}
_jobs: dict[str, dict] = {}
_scoring_weights: dict = {}


def _load():
    global _vehicles, _scoring_weights
    os.makedirs(_DATA_DIR, exist_ok=True)
    if not os.path.exists(_STORE_FILE):
        return
    try:
        with open(_STORE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        _vehicles = data.get("vehicles", {})
        _scoring_weights = data.get("weights", {})
        print(f"[store] loaded {len(_vehicles)} vehicles from disk")
    except Exception as e:
        print(f"[store] load error: {e}")


def _save():
    os.makedirs(_DATA_DIR, exist_ok=True)
    try:
        with open(_STORE_FILE, "w", encoding="utf-8") as f:
            json.dump({"vehicles": _vehicles, "weights": _scoring_weights}, f, ensure_ascii=False)
    except Exception as e:
        print(f"[store] save error: {e}")


_load()


def vehicles_put(doc_id: str, data: dict):
    _vehicles[doc_id] = data
    _save()


def vehicles_get(doc_id: str) -> dict | None:
    return _vehicles.get(doc_id)


def vehicles_all() -> list[dict]:
    return list(_vehicles.values())


def vehicles_clear():
    _vehicles.clear()
    _save()


def vehicles_delete(doc_id: str):
    _vehicles.pop(doc_id, None)
    _save()


def vehicles_update(doc_id: str, data: dict):
    if doc_id in _vehicles:
        _vehicles[doc_id].update(data)
        _save()


def jobs_put(doc_id: str, data: dict):
    _jobs[doc_id] = data


def jobs_get(doc_id: str) -> dict | None:
    return _jobs.get(doc_id)


def jobs_update(doc_id: str, data: dict):
    if doc_id in _jobs:
        _jobs[doc_id].update(data)


def weights_get() -> dict:
    return dict(_scoring_weights)


def weights_set(data: dict):
    global _scoring_weights
    _scoring_weights = dict(data)
    _save()
