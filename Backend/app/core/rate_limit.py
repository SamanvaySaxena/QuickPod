from collections import OrderedDict, deque
from threading import Lock
from time import monotonic
from fastapi import HTTPException

class InMemoryRateLimiter:
    def __init__(
        self,
        max_requests: int,
        window_seconds: int,
        max_keys: int = 10_000,
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_keys = max_keys

        self._buckets: OrderedDict[
            str,
            deque[float],
        ] = OrderedDict()

        self._lock = Lock()

    def check(self, key: str) -> int | None:
        now = monotonic()
        with self._lock:
            bucket = self._buckets.get(key)
            if bucket is None:
                if len(self._buckets) >= self.max_keys:
                    self._buckets.popitem(last=False)
                bucket = deque()
                self._buckets[key] = bucket
            self._buckets.move_to_end(key)
            while bucket and (
                now - bucket[0] >= self.window_seconds
            ):
                bucket.popleft()
            if len(bucket) >= self.max_requests:
                retry_after = int(
                    self.window_seconds
                    - (now - bucket[0])
                ) + 1
                return retry_after
            bucket.append(now)
            return None

generation_user_limiter = InMemoryRateLimiter(
    max_requests=5,
    window_seconds=60,
)
generation_ip_limiter = InMemoryRateLimiter(
    max_requests=20,
    window_seconds=60,
)

def enforce_generation_rate_limit(
    user_id: str,
    client_ip: str,
):
    user_retry_after = generation_user_limiter.check(
        f"user:{user_id}"
    )
    if user_retry_after is not None:
        raise HTTPException(
            status_code=429,
            detail=(
                "Too many study-guide generation requests. "
                "Please try again shortly."
            ),
            headers={
                "Retry-After": str(user_retry_after)
            },
        )
    ip_retry_after = generation_ip_limiter.check(
        f"ip:{client_ip}"
    )

    if ip_retry_after is not None:
        raise HTTPException(
            status_code=429,
            detail=(
                "Too many requests from this network. "
                "Please try again shortly."
            ),
            headers={
                "Retry-After": str(ip_retry_after)
            },
        )