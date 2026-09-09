package com.veli.tahsilat.security.ratelimit;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FixedWindowRateLimiterTest {

    @Test
    void allowsRequestsUpToConfiguredMaxWithinWindow() {
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(3, 60_000);

        assertTrue(limiter.tryAcquire("key-a"));
        assertTrue(limiter.tryAcquire("key-a"));
        assertTrue(limiter.tryAcquire("key-a"));
    }

    @Test
    void rejectsRequestsBeyondMaxWithinSameWindow() {
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(2, 60_000);

        assertTrue(limiter.tryAcquire("key-b"));
        assertTrue(limiter.tryAcquire("key-b"));
        assertFalse(limiter.tryAcquire("key-b"));
        assertFalse(limiter.tryAcquire("key-b"));
    }

    @Test
    void distinctKeysAreTrackedIndependently() {
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(1, 60_000);

        assertTrue(limiter.tryAcquire("ip-1|user@a.com"));
        assertTrue(limiter.tryAcquire("ip-2|user@a.com"));
        assertFalse(limiter.tryAcquire("ip-1|user@a.com"));
    }

    @Test
    void windowResetsAfterConfiguredDurationElapses() throws InterruptedException {
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(1, 50);

        assertTrue(limiter.tryAcquire("key-c"));
        assertFalse(limiter.tryAcquire("key-c"));

        Thread.sleep(80);

        assertTrue(limiter.tryAcquire("key-c"));
    }
}
