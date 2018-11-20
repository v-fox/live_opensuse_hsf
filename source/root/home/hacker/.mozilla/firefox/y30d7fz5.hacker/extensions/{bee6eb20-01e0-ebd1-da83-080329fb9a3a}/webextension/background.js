browser.runtime.sendMessage("getXulPrefs").then(reply => {
	if (reply) {
		localStorage["xulPrefs"] = JSON.stringify(reply.xulPrefs);
		browser.storage.local.set({ xulPrefs: reply.xulPrefs });
	}
});