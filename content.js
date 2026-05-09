function injectButton() {
    const inputArea = document.querySelector('div[contenteditable="true"]');
    
    if (inputArea && !document.getElementById('token-saver-btn')) {
        const btn = document.createElement('button');
        btn.id = 'token-saver-btn';
        btn.innerText = '✨ ضغط ذكي (AI)';
        btn.className = 'token-saver-btn';
        inputArea.parentElement.appendChild(btn);

        btn.addEventListener('click', async () => {
            chrome.storage.local.get(['geminiApiKey'], (result) => {
                const apiKey = result.geminiApiKey;

                if (!apiKey) {
                    alert('من فضلك اضبط مفتاح الـ API من إعدادات الإضافة أولاً! 🔑');
                    return;
                }

                const originalText = inputArea.innerText;
                if (!originalText.trim()) return;

                btn.innerText = '⏳ جاري الضغط...';
                btn.disabled = true;

                chrome.runtime.sendMessage({
                    action: "compressText",
                    text: originalText,
                    apiKey: apiKey
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        alert("خطأ في الاتصال بالخلفية: " + chrome.runtime.lastError.message);
                        btn.innerText = '✨ ضغط ذكي (AI)';
                        btn.disabled = false;
                        return;
                    }

                    if (response && response.success) {
                        inputArea.innerText = response.text;
                        inputArea.dispatchEvent(new Event('input', { bubbles: true }));
                        btn.innerText = '✅ تم الضغط!';
                    } else {
                        alert('حدث خطأ: ' + (response ? response.error : 'غير معروف'));
                        btn.innerText = '✨ ضغط ذكي (AI)';
                    }
                    
                    setTimeout(() => { 
                        btn.innerText = '✨ ضغط ذكي (AI)'; 
                        btn.disabled = false;
                    }, 2000);
                });
            });
        });
    }
}

const observer = new MutationObserver(() => injectButton());
observer.observe(document.body, { childList: true, subtree: true });
injectButton();