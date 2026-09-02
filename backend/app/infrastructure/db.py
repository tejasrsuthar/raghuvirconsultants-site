import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

load_dotenv()
from bootstrap.settings import settings

MONGO_URI = settings.MONGODB_URI
DB_NAME = settings.DB_NAME

# Use certifi's root certificate bundle for mongodb+srv / tls connections
mongo_kwargs = {}
if "mongodb+srv://" in MONGO_URI or "tls=true" in MONGO_URI.lower() or "ssl=true" in MONGO_URI.lower():
    mongo_kwargs["tlsCAFile"] = certifi.where()

client = MongoClient(MONGO_URI, **mongo_kwargs)
db = client[DB_NAME]

def get_db():
    return db
