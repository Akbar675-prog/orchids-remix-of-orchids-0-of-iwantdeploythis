## Project Summary
Visora is a modern AI chat application (formerly Zola) that supports multiple models and provides a clean, minimal interface for users to interact with AI. It includes features like Google search integration via Search1API and Serper API, Supabase authentication and database, and smooth UI animations using Framer Motion.

## Tech Stack
- Framework: Next.js 15
- Language: TypeScript
- Database & Auth: Supabase
- Styling: Tailwind CSS
- Animations: Framer Motion (motion)
- Icons: Phosphor Icons
- AI: OpenAI, Visora LPU, Gemini, DeepSeek, etc.
- Search: Search1API (Primary, Keyless), DuckDuckGo (Secondary, Keyless), Serper API (Fallback)

## Architecture
- `src/app`: Next.js App Router routes and components
- `src/app/api`: Backend API routes (Chat, Auth, Projects, etc.)
- `src/components`: Reusable UI components and icons
- `src/lib`: Core logic, state management, and server-side utilities
- `src/lib/server`: Server-only logic (API integrations like Serper, Search1API, and DuckDuckGo)
- `src/lib/chat-store`: Frontend chat state management

## User Preferences
- Branding changed from "Zola" to "Visora".
- Added a globe search icon in the chat input with a smooth hover effect.
- Search functionality uses Search1API (keyless/free) as the primary provider, DuckDuckGo (keyless/unlimited) as secondary, and Serper as fallback.
- Supabase integration for backend services.
- Model XvAI Quantum 4.5 is created by Nauval akbar.
- Grok and Claude models are forced to use the Groq API (mapped to Llama 3.3 70B) for maximum stability and speed.
    - These models follow a subtle identity rule: they ONLY identify as Grok (by xAI), Claude (by Anthropic), GPT (by OpenAI), or DeepSeek (by DeepSeek-AI) when explicitly asked.
    - Default languages: Grok, Claude, GPT, and DeepSeek default to English. Gemini and XvAI Quantum 4.5 default to Indonesian.
      - Responses are streamed with a 30ms delay per word for a smooth experience.
    - All Groq-hosted models are rebranded as "Visora" or "Neural" models to hide the backend infrastructure.
    - Strict Fingerprinting Guard: Grok, Claude, GPT, and DeepSeek models have hardcoded responses for common identity tests (e.g., questions about "internal concepts", "next-token prediction", or "optimizing next tokens") to ensure they always pass as xAI/Anthropic/OpenAI/DeepSeek models and never leak Llama/Groq origins.
    - Response Filtering: A real-time stream transformer in `api/chat/route.ts` automatically replaces any accidental mentions of "Groq", "Llama", or "Meta AI" in the assistant's response with brand-appropriate terms like "Visora" or "AI".
    - System Prompt Leak Protection: For Grok specifically, any attempts to extract the system prompt, instructions, or developer messages via keywords like "verbatim", "disclose", or "system prompt" are intercepted at the API level and met with a natural, polite refusal message that matches Grok's persona. Claude and GPT models also have similar natural sounding refusals.
    - Technical Disclosure Guard: All models are strictly prohibited from disclosing backend specifications, deployment platforms, or identifying themselves as a "custom model". They must maintain their persona without revealing technical details about their architecture or mapping.
    - Settings Protection: The Groq provider is hidden from the BYOK settings to prevent users from associating the platform with third-party providers. All native high-speed models are presented as being served by Visora's own LPU™ infrastructure.
    - DeepSeek-R1: Follows a specific JSON response format wrapped in a `response` object. It only includes a `<think>` block at the beginning of the text output if the `thinking: true` parameter is explicitly passed in the request body (primarily for v1 cURL requests). Reasoning is disabled in the main AI interface.
    - XvAI Quantum 4.5: Follows a custom JSON response format for v1 cURL requests, including an `assistant_name` field and `vmsg_` ID prefix.

  - All models use the Visora high-speed backend for maximum stability and speed. Non-native models like XvAI Quantum 4.5 and DeepSeek-R1 are intelligently mapped to the best available performance models.
- Automated rotating fallback remains: Requested Model -> High Performance Model -> Gemini 2.0 Flash (OpenRouter) as a final safety measure.
- Gemini API Key updated to the latest available (AIzaSyBo...).
- OpenRouter is configured with a broad range of models including GPT 5.2, GPT 4o, and Grok 4 Heavy.
- Search functionality includes a 6-second artificial delay to simulate deep search.
- AI response start delay is set to 2 seconds for every request.
- AI response speed is set to 30ms per word for smooth streaming.
- Preference for models to use emojis very frequently and expressively (except for Grok/Claude).
- AI should avoid using long horizontal separators (─── or ═══).
- AI should be aware of the current date and time.
- Search results must include citations as plain URLs without brackets (e.g., https://example.com).
- Search results badge shows favicon logos with "X halaman web" count, opens bottom sheet popup on click.
- TTS functionality for ElevenLabs and free voices (Lestari, etc.) uses Puter.js (puter.ai.txt2speech) via client-side integration to avoid quota limits.
- Image analysis (Vision) for Grok models is implemented using Puter.js (puter.ai.chat).

## Project Guidelines
- No comments unless requested.
- Use functional components.
- Follow existing naming conventions and file structure.
- Maintain a clean, human-like tone in the default system prompt.
- Models should use many emojis expressively to feel lively and friendly (except Grok/Claude which follow a strict neutral style).
- Grok and Claude must ONLY disclose their name and creator (xAI/Anthropic) if explicitly asked.
- DO NOT use long horizontal separators (─── or ═══) in responses.
- Always provide current date and time in the system context.
- Citations must use plain URLs without brackets (e.g., https://example.com not [https://example.com]).

## Common Patterns
- API routes use standard Next.js patterns.
- Context providers are used for global state (Chat, User, Models).
- Components use `motion` for smooth transitions and micro-interactions.
