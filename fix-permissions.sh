#!/bin/sh
# Set executable permissions for local scripts once after unzipping.
# This avoids "cannot access" errors when running chmod on non-existent files.

set -e
cd "$(dirname "$0")"

=======
# Set executable permissions on script files after unzipping.
# This avoids "cannot access" errors when running chmod on non-existent files.

find . -type f \( -name "*.sh" -o -name "mvnw" -o -name "gradlew" \) -exec chmod +x {} +

# Ensure Node.js helper scripts are executable
if [ -d node_modules/.bin ]; then
    find node_modules/.bin -type f -exec chmod +x {} +
fi

echo "Executable bits applied"
