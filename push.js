const statusEl = document.getElementById("status");
const btn = document.getElementById("enableBtn");

btn.onclick = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      throw "Tarayıcı desteklemiyor";
    }

    const reg = await navigator.serviceWorker.register("/sw.js");

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      throw "Bildirim izni verilmedi";
    }

    const vapidKey = await fetch("/vapid-public-key.txt").then(r => r.text());

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey.trim())
    });

    await fetch("https://API_URL_HERE/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "demo-user",
        subscription: sub
      })
    });

    statusEl.innerText = "✅ Bildirimler aktif";
  } catch (err) {
    statusEl.innerText = "❌ " + err;
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
