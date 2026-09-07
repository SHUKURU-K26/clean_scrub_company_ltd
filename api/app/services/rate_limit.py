import time
from collections import defaultdict
from typing import Dict, List

# Simple in-memory lockout — resets if the server restarts, and won't share
# state across multiple server instances if you ever scale horizontally.
# Perfectly fine for a single-instance deployment (which is what Render's
# free tier gives you); swap for Redis-backed limiting if that changes.
MAX_ATTEMPTS = 5
LOCKOUT_SECONDS = 15 * 60

_attempts: Dict[str, List[float]] = defaultdict(list)


def _prune(key: str) -> None:
    cutoff = time.time() - LOCKOUT_SECONDS
    _attempts[key] = [t for t in _attempts[key] if t > cutoff]


def is_locked_out(key: str) -> bool:
    _prune(key)
    return len(_attempts[key]) >= MAX_ATTEMPTS


def record_failure(key: str) -> None:
    _attempts[key].append(time.time())


def clear_attempts(key: str) -> None:
    _attempts.pop(key, None)