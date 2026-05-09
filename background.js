chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "compressText") {
        const { text, apiKey } = request;
        
        const MODEL = "gemini-flash-latest"; 
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

        const prompt = `Rewrite the following prompt to be as concise as possible to save tokens for another LLM. 
        Strict Rules:
        1. Keep all technical terms, variable names, code snippets, and specific constraints exactly as they are.
        2. Maintain the original intent and tone.
        3. Remove redundant adjectives and conversational filler.
        4. Return ONLY the rewritten text without any quotes or intro/outro.

        Text to compress:
        \n\n${text}`;

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error ? data.error.message : `Server Error: ${response.status}`);
            }
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                sendResponse({ success: true, text: data.candidates[0].content.parts[0].text.trim() });
            } else {
                sendResponse({ success: false, error: "AI returned an empty response." });
            }
        })
        .catch(error => {
            console.error("Background fetch error:", error);
            sendResponse({ success: false, error: error.message });
        });

        return true; 
    }
});