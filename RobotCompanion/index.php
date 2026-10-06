<?php
/**
 * index.php
 * Main robot screen. The phone displays the robot's face here.
 */

// Cache-bust every asset with the file's own last-modified time, so the
// browser can never silently serve a stale/mismatched CSS or JS file
// after an edit — this is what caused "Expressions is not defined".
function asset_url($relativePath) {
    $fullPath = __DIR__ . '/' . $relativePath;
    $version = file_exists($fullPath) ? filemtime($fullPath) : time();
    return $relativePath . '?v=' . $version;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Robot Desk Companion</title>

<link rel="stylesheet" href="<?php echo asset_url('assets/css/style.css'); ?>">
<link rel="stylesheet" href="<?php echo asset_url('assets/css/robot.css'); ?>">
<link rel="stylesheet" href="<?php echo asset_url('assets/css/animations.css'); ?>">
</head>
<body>

<button id="fullscreen-btn" class="fullscreen-btn" aria-label="Enter fullscreen">⛶</button>

<main id="stage">
    <?php include __DIR__ . '/components/robot_face.php'; ?>
</main>

<script src="<?php echo asset_url('assets/js/expressions.js'); ?>"></script>
<script src="<?php echo asset_url('assets/js/sounds.js'); ?>"></script>
<script src="<?php echo asset_url('assets/js/robot.js'); ?>"></script>
<script src="<?php echo asset_url('assets/js/interactions.js'); ?>"></script>
<script src="<?php echo asset_url('assets/js/fullscreen.js'); ?>"></script>
<script src="<?php echo asset_url('assets/js/app.js'); ?>"></script>
</body>
</html>