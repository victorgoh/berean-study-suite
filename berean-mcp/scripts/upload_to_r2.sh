#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/.."

echo "Starting Berean R2 Data Sync..."
python3 scripts/sync_data_to_r2.py "$@"
