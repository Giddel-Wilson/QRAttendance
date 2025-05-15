#!/bin/bash

# Make this script work regardless of where it's called from
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "Updating Prisma schema and database..."

# Generate Prisma client
bun prisma generate

# Create migration (but don't apply it automatically)
bun prisma migrate dev --create-only --name add_notifications

echo "Migration created. Review it before applying with:"
echo "bun prisma migrate deploy"

echo "Or to apply directly:"
echo "bun prisma migrate dev"
