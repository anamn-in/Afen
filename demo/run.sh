#!/bin/bash
set -e

# Start Afen in background
cd ..
docker compose up -d
echo "Waiting for Afen to be ready..."
sleep 5

# Run demo services
cd demo
node app.js &
python worker.py &

# Wait for ingestion
sleep 3

# Run AQL query
curl -X POST http://127.0.0.1:8787/query -H "Content-Type: application/json" -d '{"query": "EXPLAIN latest"}' | jq .

echo "Demo completed. Press Ctrl+C to stop containers."
wait

