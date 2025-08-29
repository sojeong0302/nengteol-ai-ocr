# RAG 시스템 설정 파일

import os

# 식약처 API 설정
FOOD_API_CONFIG = {
    "base_url": "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02",
    "endpoint": "/getFoodNtrCpntDbInq02",
    "api_key_encoding": "%2F6rrnUampF4T33WBTsqvj5RvlKuyttK%2BmTQoi%2BiaVIa44%2FWI05MoCh94HBR5J71WRevIOA1dJRYlPdZ3ctO70g%3D%3D",
    "api_key_decoding": "/6rrnUampF4T33WBTsqvj5RvlKuyttK+mTQoi+iaVIa44/WI05MoCh94HBR5J71WRevIOA1dJRYlPdZ3ctO70g==",
    "data_format": "JSON"
}

# 클로바 AI 설정
CLOVA_CONFIG = {
    "api_key": os.getenv("CLOVA_API_KEY", ""),
    "api_key_primary": os.getenv("CLOVA_API_KEY_PRIMARY", ""),
    "request_id": os.getenv("CLOVA_REQUEST_ID", ""),
    "model": "HCX-005",
    "max_tokens": 1000,
    "temperature": 0.7
}

# 캐시 설정
CACHE_CONFIG = {
    "cache_duration": 3600,  # 1시간
    "max_cache_size": 1000,  # 최대 1000개 캐시
    "cache_dir": "cache"
}

# RAG 설정
RAG_CONFIG = {
    "embedding_model": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    "similarity_threshold": 0.7,
    "max_results": 5,
    "embeddings_dir": "embeddings"
}