// ./scripts/0-test-ollama.js
import ollama from "ollama";

const response = await ollama.chat({
  model: "qwen3.5:4b",
  messages: [{ role: "user", content: "Say hello in one sentence." }],
});

console.log(response.message.content);
