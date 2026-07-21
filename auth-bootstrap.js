(() => {
  // ล้าง Service Worker รุ่นเก่าที่อาจทำให้ GitHub Pages แสดงไฟล์ค้าง
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((key) => key.startsWith('brn-pr-')).map((key) => caches.delete(key)));
        }
      } catch (_) {}
    });
  }
})();
