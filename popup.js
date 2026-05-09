document.getElementById('save-btn').addEventListener('click', () => {
    const key = document.getElementById('api-key').value;
    if (key) {
        chrome.storage.local.set({ geminiApiKey: key }, () => {
            alert('تم حفظ المفتاح بنجاح! ✅');
        });
    } else {
        alert('من فضلك أدخل المفتاح أولاً!');
    }
});

chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
        document.getElementById('api-key').value = result.geminiApiKey;
    }
});