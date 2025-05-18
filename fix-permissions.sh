#!/bin/sh
# Set executable permissions on script files after unzipping.
# This avoids "cannot access" errors when running chmod on non-existent files.

find . -type f \( -name "*.sh" -o -name "mvnw" -o -name "gradlew" \) -exec chmod +x {} +

echo "Executable bits applied"
