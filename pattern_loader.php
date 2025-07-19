<?php
$patternDir = __DIR__ . '/patterns';

$files = array_filter(scandir($patternDir), function($file) use ($patternDir) {
    return is_file("$patternDir/$file") && pathinfo($file, PATHINFO_EXTENSION) === 'svg';
});

// Print the list of SVG files to the console
echo "Found SVG files:\n";
foreach ($files as $file) {
    echo "- $file\n";
}

// Write JSON file
file_put_contents("$patternDir/patterns.json", json_encode(array_values($files), JSON_PRETTY_PRINT));
echo "\npatterns.json updated.\n";
