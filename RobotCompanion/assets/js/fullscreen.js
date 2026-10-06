/**
 * fullscreen.js
 * Wires up the fullscreen toggle button using the Fullscreen API.
 */

(function () {

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("fullscreen-btn");
        if (!btn) return;

        btn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });

        document.addEventListener("fullscreenchange", () => {
            btn.textContent = document.fullscreenElement ? "⤢" : "⛶";
            btn.setAttribute(
                "aria-label",
                document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen"
            );
        });
    });

})();