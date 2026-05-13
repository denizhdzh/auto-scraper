import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import Client

_db: Client | None = None


def get_db() -> Client:
    global _db
    if _db is not None:
        return _db

    if not firebase_admin._apps:
        creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")

        if creds_json:
            cred = credentials.Certificate(json.loads(creds_json))
        elif creds_path:
            cred = credentials.Certificate(creds_path)
        else:
            raise RuntimeError("Firebase credentials not configured. Set FIREBASE_CREDENTIALS_PATH or FIREBASE_CREDENTIALS_JSON.")

        firebase_admin.initialize_app(cred)

    _db = firestore.client()
    return _db


def vehicles_col():
    return get_db().collection("vehicles")


def jobs_col():
    return get_db().collection("scrape_jobs")


def settings_doc():
    return get_db().collection("config").document("scoring_weights")
