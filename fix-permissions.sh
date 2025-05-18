#!/bin/sh
# Set executable permissions for local scripts once after unzipping.
# This avoids "cannot access" errors when running chmod on non-existent files.

set -e
cd "$(dirname "$0")"

find . -type f \( -name "*.sh" -o -name "mvnw" -o -name "gradlew" \) -exec chmod +x {} +

echo "Executable bits applied"
