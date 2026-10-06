/**
 * sounds.js
 * Gives every expression a short, distinct sound — synthesized on the fly
 * with the Web Audio API rather than loaded from audio files, so there's
 * nothing extra to record or host. Robot.setExpression() calls
 * Sounds.play(name) automatically whenever the expression changes.
 *
 * Note: browsers block audio until the first user gesture on the page.
 * Idle/autonomous sounds (idle cycle, puppy eyes, crying) will stay
 * silent until the user has tapped the robot at least once — this is a
 * browser policy, not a bug.
 */

const Sounds = {

    ctx: null,
    enabled: true,

    _getContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    },

    /**
     * Plays a single tone.
     * @param {number} freq - starting frequency in Hz
     * @param {object} opts - duration, type (oscillator waveform), delay,
     *                        gain (volume), glideTo (optional end frequency)
     */
    _tone(freq, opts = {}) {
        const ctx = this._getContext();
        if (!ctx || !this.enabled) return;

        const {
            duration = 0.15,
            type = "sine",
            delay = 0,
            gain = 0.12,
            glideTo = null
        } = opts;

        const startAt = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startAt);
        if (glideTo) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(glideTo, 1), startAt + duration);
        }

        gainNode.gain.setValueAtTime(0, startAt);
        gainNode.gain.linearRampToValueAtTime(gain, startAt + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

        osc.connect(gainNode).connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + duration + 0.03);
    },

    play(expressionName) {
        const pattern = this.patterns[expressionName];
        if (pattern) pattern.call(this);
    },

    /**
     * One short, characterful sound per expression.
     */
    patterns: {
        neutral() {
            this._tone(520, { duration: 0.07, gain: 0.06 });
        },
        happy() {
            [600, 800, 1000].forEach((f, i) =>
                this._tone(f, { duration: 0.12, delay: i * 0.09, gain: 0.14 })
            );
        },
        sad() {
            this._tone(420, { duration: 0.4, glideTo: 240, gain: 0.1 });
        },
        angry() {
            this._tone(150, { duration: 0.16, type: "sawtooth", gain: 0.16 });
            this._tone(120, { duration: 0.18, type: "sawtooth", gain: 0.16, delay: 0.12 });
        },
        surprised() {
            this._tone(480, { duration: 0.05, gain: 0.12 });
            this._tone(950, { duration: 0.12, delay: 0.05, gain: 0.14 });
        },
        sleepy() {
            this._tone(300, { duration: 0.55, glideTo: 170, gain: 0.07 });
        },
        excited() {
            [700, 900, 1150].forEach((f, i) =>
                this._tone(f, { duration: 0.08, delay: i * 0.08, gain: 0.14 })
            );
        },
        curious() {
            this._tone(500, { duration: 0.12, gain: 0.11 });
            this._tone(720, { duration: 0.16, delay: 0.14, gain: 0.12 });
        },
        annoyed() {
            [170, 150, 130].forEach((f, i) =>
                this._tone(f, { duration: 0.14, type: "square", delay: i * 0.1, gain: 0.17 })
            );
        },
        laughing() {
            [650, 760, 650, 760].forEach((f, i) =>
                this._tone(f, { duration: 0.07, delay: i * 0.1, gain: 0.13 })
            );
        },
        shocked() {
            this._tone(1300, { duration: 0.09, type: "triangle", gain: 0.18 });
        },
        bored() {
            this._tone(310, { duration: 0.45, glideTo: 260, gain: 0.06 });
        },
        crying() {
            this._tone(440, { duration: 0.3, glideTo: 300, gain: 0.08 });
            this._tone(410, { duration: 0.32, glideTo: 270, gain: 0.08, delay: 0.36 });
        },
        puppy() {
            this._tone(480, { duration: 0.22, glideTo: 400, gain: 0.07 });
            this._tone(400, { duration: 0.26, glideTo: 360, gain: 0.06, delay: 0.24 });
        }
    }

};