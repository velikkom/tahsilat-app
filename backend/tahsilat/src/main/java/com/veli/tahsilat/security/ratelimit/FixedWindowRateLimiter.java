package com.veli.tahsilat.security.ratelimit;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class FixedWindowRateLimiter {

    private final int maxAttempts;
    private final long windowMillis;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public FixedWindowRateLimiter(int maxAttempts, long windowMillis) {
        this.maxAttempts = maxAttempts;
        this.windowMillis = windowMillis;
    }

    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();

        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStart >= windowMillis) {
                return new Window(now);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        return window.count.get() <= maxAttempts;
    }

    /** Seconds until the current window for this key resets, for a Retry-After header. */
    public long retryAfterSeconds(String key) {
        Window window = windows.get(key);

        if (window == null) {
            return 1;
        }

        long remainingMillis = (window.windowStart + windowMillis) - System.currentTimeMillis();

        return Math.max(1, (remainingMillis + 999) / 1000);
    }

    private static final class Window {
        private final long windowStart;
        private final AtomicInteger count = new AtomicInteger(1);

        private Window(long windowStart) {
            this.windowStart = windowStart;
        }
    }
}
