/**
 * interactions.js
 * Translates raw touch/mouse input on the robot into Robot API calls.
 * Designed so new interactions can be added without touching robot.js.
 */

(function () {

    const LONG_PRESS_MS = 550;
    const SWIPE_THRESHOLD_PX = 40;
    const DOUBLE_TAP_MS = 280;

    // "Rapid tapping" detection: if this many taps land inside the
    // rolling window, the robot gets annoyed instead of happy.
    const ANNOYANCE_TAP_COUNT = 4;
    const ANNOYANCE_WINDOW_MS = 3000;

    let pointerDownAt = 0;
    let pointerStart = { x: 0, y: 0 };
    let longPressTimer = null;
    let longPressFired = false;
    let lastTapAt = 0;
    let recentTapTimestamps = [];

    function onPointerDown(x, y) {
        Robot.markInteraction();
        pointerDownAt = Date.now();
        pointerStart = { x, y };
        longPressFired = false;

        longPressTimer = setTimeout(() => {
            longPressFired = true;
            Robot.sleep();
        }, LONG_PRESS_MS);
    }

    function onPointerUp(x, y) {
        clearTimeout(longPressTimer);
        if (longPressFired) {
            // Long press already handled its own reaction on release.
            setTimeout(() => Robot.wake(), 800);
            return;
        }

        const dx = x - pointerStart.x;
        const dy = y - pointerStart.y;
        const distance = Math.hypot(dx, dy);

        if (distance > SWIPE_THRESHOLD_PX) {
            const direction = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? "right" : "left")
                : (dy > 0 ? "down" : "up");
            Robot.reactSwipe(direction);
            return;
        }

        // Rapid tapping: keep a rolling window of recent tap times.
        const now = Date.now();
        recentTapTimestamps.push(now);
        recentTapTimestamps = recentTapTimestamps.filter((t) => now - t < ANNOYANCE_WINDOW_MS);
        console.log(`[interactions] tap count in window: ${recentTapTimestamps.length}/${ANNOYANCE_TAP_COUNT}`);

        if (recentTapTimestamps.length >= ANNOYANCE_TAP_COUNT) {
            Robot.reactAnnoyed();
            lastTapAt = now;
            return;
        }

        // Tap vs double tap
        if (now - lastTapAt < DOUBLE_TAP_MS) {
            Robot.setExpression("excited");
            Robot.bounce();
            Robot._returnToNeutralAfter(1200);
            lastTapAt = 0;
        } else {
            Robot.reactTap();
            lastTapAt = now;
        }
    }

    const stage = () => document.getElementById("robot");

    document.addEventListener("DOMContentLoaded", () => {
        const el = stage();

        el.addEventListener("touchstart", (e) => {
            const t = e.touches[0];
            onPointerDown(t.clientX, t.clientY);
        }, { passive: true });

        el.addEventListener("touchend", (e) => {
            const t = e.changedTouches[0];
            onPointerUp(t.clientX, t.clientY);
        }, { passive: true });

        // Mouse support for desktop testing
        el.addEventListener("mousedown", (e) => onPointerDown(e.clientX, e.clientY));
        el.addEventListener("mouseup", (e) => onPointerUp(e.clientX, e.clientY));
    });

})();