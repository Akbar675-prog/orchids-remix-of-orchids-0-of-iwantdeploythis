curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer vsk_test_key_1234567890123456" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Halo!" }
    ]

echo "\nTesting Google Search Endpoint..."
curl -X POST http://localhost:3000/v1/search/google \
  -H "Authorization: Bearer vsk_test_key_1234567890123456" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Siapa penemu lampu pijar?"
  }'

