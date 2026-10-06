/**
 * app.js
 * Application initialization.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Safety net: if expressions.js hasn't finished evaluating yet for any
    // reason, wait briefly and retry instead of throwing ReferenceError.
    if (typeof Expressions === "undefined") {
        console.warn("app.js: Expressions not ready yet, retrying init()...");
        setTimeout(() => Robot.init(), 50);
        return;
    }
    Robot.init();
});