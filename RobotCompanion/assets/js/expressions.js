/**
 * expressions.js
 * Defines how each expression looks: an SVG path (drawn as a thick,
 * round-capped glowing arc) plus an optional "dot" mode for expressions
 * like "surprised" that read better as circles than arcs.
 *
 * Only the LEFT eye path needs to be defined — the right eye is mirrored
 * automatically in CSS (transform: scaleX(-1)).
 */

const Expressions = {

    neutral: {
        path: "M15,32 Q50,24 85,32",
        strokeWidth: 12,
        dotRadius: 0
    },

    happy: {
        path: "M12,42 Q50,4 88,42",
        strokeWidth: 16,
        dotRadius: 0
    },

    sad: {
        path: "M15,18 Q50,46 85,18",
        strokeWidth: 11,
        dotRadius: 0
    },

    angry: {
        // Inner corner low, outer corner high — mirrored eye gives the
        // classic "angled inward" angry brow look.
        path: "M15,44 Q50,30 85,12",
        strokeWidth: 14,
        dotRadius: 0
    },

    surprised: {
        path: "",
        strokeWidth: 0,
        dotRadius: 22
    },

    sleepy: {
        path: "M15,32 Q50,30 85,32",
        strokeWidth: 7,
        dotRadius: 0
    },

    // -- extra expressions (Phase 4+, defined now for convenience) --

    excited: {
        path: "M10,44 Q50,-2 90,44",
        strokeWidth: 17,
        dotRadius: 0
    },

    curious: {
        path: "M15,40 Q50,10 85,26",
        strokeWidth: 12,
        dotRadius: 0
    },

    annoyed: {
        // Sharper, tighter version of "angry" — reads as more intense.
        path: "M18,46 Q50,34 82,8",
        strokeWidth: 15,
        dotRadius: 0
    },

    laughing: {
        // Double-bump "^‿^" curve — pairs with a head-bob animation.
        path: "M10,38 Q30,10 50,30 Q70,10 90,38",
        strokeWidth: 14,
        dotRadius: 0
    },

    shocked: {
        // Bigger, rounder than "surprised" — pairs with a quick pop animation.
        path: "",
        strokeWidth: 0,
        dotRadius: 27
    },

    puppy: {
        // Big, soft, pleading anime-style eyes — paired with Robot.look("up"),
        // a glossy highlight, and sparkle brow lines (see robot.css).
        path: "",
        strokeWidth: 0,
        dotRadius: 27
    },

    bored: {
        // Heavy, drooping half-lidded eyes — paired with a slow slouch/sway.
        path: "M14,26 Q50,36 86,26",
        strokeWidth: 10,
        dotRadius: 0
    },

    crying: {
        // Squeezed-shut, downturned eyes — paired with falling tears.
        path: "M16,22 Q50,42 84,22",
        strokeWidth: 10,
        dotRadius: 0
    }

};

/**
 * Expressions the robot may drift into on its own while idle.
 * "annoyed", "puppy" and "crying" are deliberately excluded — those are
 * earned by user behavior (rapid tapping / prolonged silence) rather
 * than shown at random.
 */
const IDLE_EXPRESSION_POOL = ["neutral", "curious", "happy", "sleepy", "surprised", "laughing", "shocked", "bored"];

/**
 * Some idle expressions come with a whole-robot motion, not just an eye
 * shape — e.g. the head lowering for "sleepy" or bobbing for "laughing".
 * Maps expression name -> CSS class applied to #robot for the duration.
 */
const IDLE_EXPRESSION_ANIMATION = {
    sleepy: "anim-head-lower",
    laughing: "anim-head-bob",
    shocked: "anim-pop",
    bored: "anim-bored-sway"
};

/**
 * Applies an expression's shape to a single eye <svg> element.
 */
function applyExpressionToEye(eyeEl, expression) {
    const pathEl = eyeEl.querySelector(".eye-shape");
    const dotEl = eyeEl.querySelector(".eye-dot");

    if (expression.dotRadius > 0) {
        pathEl.setAttribute("d", "");
        pathEl.style.strokeWidth = 0;
        dotEl.setAttribute("r", expression.dotRadius);
    } else {
        dotEl.setAttribute("r", 0);
        pathEl.setAttribute("d", expression.path);
        pathEl.style.strokeWidth = expression.strokeWidth;
    }
}