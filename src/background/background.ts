console.log('Background service worker is running...');

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed!');
});
