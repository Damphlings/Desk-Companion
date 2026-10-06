<?php
/**
 * components/robot_face.php
 * The actual robot-face HTML/SVG structure.
 * Expression + animation state is applied by JS via CSS classes on #robot.
 */
?>
<div id="robot" class="robot" data-expression="neutral">

    <div class="robot-ear robot-ear--left">
        <span class="robot-ear-ring"></span>
    </div>
    <div class="robot-ear robot-ear--right">
        <span class="robot-ear-ring"></span>
    </div>

    <div class="robot-face">
        <div class="robot-face-plate">

            <div class="eye eye-left">
                <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
                    <path class="eye-shape" d="M15,32 Q50,24 85,32" stroke-width="12" />
                    <circle class="eye-dot" cx="50" cy="30" r="0" />
                    <circle class="eye-shine" cx="40" cy="20" r="5" />
                    <ellipse class="eye-tear" cx="50" cy="44" rx="6" ry="9" />
                </svg>
            </div>

            <div class="eye eye-right">
                <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
                    <path class="eye-shape" d="M15,32 Q50,24 85,32" stroke-width="12" />
                    <circle class="eye-dot" cx="50" cy="30" r="0" />
                    <circle class="eye-shine" cx="40" cy="20" r="5" />
                    <ellipse class="eye-tear" cx="50" cy="44" rx="6" ry="9" />
                </svg>
            </div>

        </div>
    </div>

</div>