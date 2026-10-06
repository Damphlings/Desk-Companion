/**
 * robot.js
 * Central Robot controller. All other scripts talk to the robot through
 * this API rather than touching the DOM directly — this is also the
 * boundary that will eventually be swapped for ESP32 hardware calls.
 */

const Robot = {

    el: null,
    eyeLeft: null,
    eyeRight: null,
    facePlate: null,

    currentExpression: "neutral",
    isSleeping: false,
    isReacting: false,
    isPleading: false,
    isCrying: false,
    annoyance: 0,
    lastInteractionAt: 0,

    idleTimer: null,
    idleExpressionTimer: null,
    attentionTimer: null,

    init() {
        this.el = document.getElementById("robot");
        this.eyeLeft = this.el.querySelector(".eye-left");
        this.eyeRight = this.el.querySelector(".eye-right");
        this.facePlate = this.el.querySelector(".robot-face-plate");

        this.lastInteractionAt = Date.now();
        this.setExpression("neutral");
        this._startIdleLoop();
        this._startIdleExpressionLoop();
        this._startAttentionLoop();
    },

    setExpression(name) {
        const expression = Expressions[name];
        if (!expression) {
            console.warn(`Robot.setExpression: unknown expression "${name}"`);
            return;
        }

        const changed = this.currentExpression !== name;

        this.currentExpression = name;
        this.el.dataset.expression = name;

        applyExpressionToEye(this.eyeLeft, expression);
        applyExpressionToEye(this.eyeRight, expression);

        // Only play a sound when actually switching expressions, so
        // re-setting the same one (e.g. idle loop returning to "neutral"
        // repeatedly) doesn't spam the same blip.
        if (changed && typeof Sounds !== "undefined") {
            Sounds.play(name);
        }
    },

    blink(slow = false) {
        const cls = slow ? "is-blinking-slow" : "is-blinking";
        [this.eyeLeft, this.eyeRight].forEach((eye) => {
            eye.classList.remove(cls);
            // Force reflow so the animation can be re-triggered back-to-back.
            void eye.offsetWidth;
            eye.classList.add(cls);
        });
    },

    look(direction) {
        this.facePlate.classList.remove("look-left", "look-right", "look-up", "look-down");
        if (direction && direction !== "center") {
            this.facePlate.classList.add(`look-${direction}`);
        }
    },

    bounce() {
        this.el.classList.remove("is-bouncing");
        void this.el.offsetWidth;
        this.el.classList.add("is-bouncing");
    },

    shake() {
        this.el.classList.remove("is-shaking");
        void this.el.offsetWidth;
        this.el.classList.add("is-shaking");
    },

    sleep() {
        this.isSleeping = true;
        this.el.classList.add("is-sleeping");
        this.setExpression("sleepy");
    },

    wake() {
        this.isSleeping = false;
        this.el.classList.remove("is-sleeping");
        this.setExpression("neutral");
    },

    dance() {
        // Placeholder for Phase 4 — a light wiggle stands in for now.
        this.bounce();
    },

    /**
     * Call this on any user interaction (tap, swipe, long press...).
     * Resets the "how long has it been ignored" clock, and cancels
     * puppy eyes / crying immediately if the robot was seeking attention.
     */
    markInteraction() {
        this.lastInteractionAt = Date.now();

        if (this.isPleading) {
            this.isPleading = false;
            this.el.classList.remove("is-pleading");
            this.look("center");
            if (this.currentExpression === "puppy") this.setExpression("neutral");
        }

        if (this.isCrying) {
            this.isCrying = false;
            this.el.classList.remove("is-crying");
            this.look("center");
            if (this.currentExpression === "crying") this.setExpression("neutral");
        }
    },

    /**
     * Reacts to a tap: happy expression + bounce, then returns to neutral.
     */
    reactTap() {
        this.isReacting = true;
        this.setExpression("happy");
        this.bounce();
        this._returnToNeutralAfter(1200);
    },

    /**
     * Reacts to being tapped too much, too fast: gets annoyed.
     * Each additional rapid tap tops up the annoyance window instead of
     * stacking animations, so it reads as one continuous mood rather
     * than a flicker per tap.
     */
    reactAnnoyed() {
        console.log("[Robot] annoyed triggered");
        this.isReacting = true;
        this.setExpression("annoyed");
        this.shake();
        this._returnToNeutralAfter(1800);
    },

    reactSwipe(direction) {
        this.isReacting = true;
        const lookDirection = { left: "left", right: "right", up: "up", down: "down" }[direction];
        if (lookDirection) this.look(lookDirection);

        if (direction === "up") this.setExpression("surprised");
        if (direction === "down") this.setExpression("sad");

        this._returnToNeutralAfter(1000, () => this.look("center"));
    },

    _returnToNeutralAfter(ms, extra) {
        clearTimeout(this._revertTimer);
        this._revertTimer = setTimeout(() => {
            if (!this.isSleeping) this.setExpression("neutral");
            this.isReacting = false;
            if (extra) extra();
        }, ms);
    },

    /**
     * Idle behaviour: automatic blinking at randomized intervals while
     * the robot is neutral and not mid-reaction.
     */
    _startIdleLoop() {
        const scheduleNext = () => {
            const delay = 2500 + Math.random() * 3500;
            this.idleTimer = setTimeout(() => {
                if (this.currentExpression === "neutral" && !this.isSleeping && !this.isReacting) {
                    this.blink(Math.random() < 0.2);
                }
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    },

    /**
     * Autonomous personality: every ~10 seconds, drift into a random
     * expression for a couple of seconds, then settle back to neutral.
     * Skipped whenever the robot is mid-reaction, asleep, or already
     * annoyed, so it never fights with a user-triggered state.
     */
    _startIdleExpressionLoop() {
        let lastIdleExpression = "neutral";
        const animClasses = Object.values(IDLE_EXPRESSION_ANIMATION);

        const scheduleNext = () => {
            const delay = 4500 + Math.random() * 1000; // ~4.5-5.5s, "every 5 seconds"
            this.idleExpressionTimer = setTimeout(() => {
                const canShowcase = !this.isReacting && !this.isSleeping && !this.isPleading && !this.isCrying
                    && this.currentExpression !== "annoyed";

                if (canShowcase) {
                    const options = IDLE_EXPRESSION_POOL.filter((name) => name !== lastIdleExpression);
                    const next = options[Math.floor(Math.random() * options.length)];
                    lastIdleExpression = next;

                    console.log(`[Robot] idle expression → ${next}`);

                    this.el.classList.remove(...animClasses);
                    const animClass = IDLE_EXPRESSION_ANIMATION[next];
                    if (animClass) this.el.classList.add(animClass);

                    this.setExpression(next);
                    setTimeout(() => {
                        this.el.classList.remove(...animClasses);
                        if (!this.isReacting && !this.isSleeping && this.currentExpression === next) {
                            this.setExpression("neutral");
                        }
                    }, 1800);
                }

                scheduleNext();
            }, delay);
        };
        scheduleNext();
    },

    /**
     * Attention-seeking behaviour:
     * - 30 seconds of no interaction → puppy eyes
     * - 5 minutes of no interaction  → crying (tears), supersedes puppy eyes
     */
    _startAttentionLoop() {
        this.attentionTimer = setInterval(() => {
            if (this.isReacting || this.isSleeping) return;

            const idleMs = Date.now() - this.lastInteractionAt;

            if (idleMs >= 300000 && !this.isCrying) {
                console.log("[Robot] no interaction for 5 minutes — crying");
                this.isPleading = false;
                this.el.classList.remove("is-pleading");
                this.isCrying = true;
                this.el.classList.add("is-crying");
                this.setExpression("crying");
                this.look("down");
            } else if (idleMs >= 30000 && idleMs < 300000 && !this.isPleading && !this.isCrying) {
                console.log("[Robot] no interaction for 30 seconds — puppy eyes");
                this.isPleading = true;
                this.el.classList.add("is-pleading");
                this.setExpression("puppy");
                this.look("up");
            }
        }, 5000);
    }

};