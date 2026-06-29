const key = decodeURIComponent(window.location.hash.slice(1));
const html = key ? localStorage.getItem(key) : "";

if (key) {
  localStorage.removeItem(key);
}

if (html) {
  document.open();
  document.write(html);
  document.close();
} else {
  document.body.innerHTML = `
    <main style="display:grid;min-height:100vh;place-items:center;font-family:system-ui,sans-serif;background:#f4f0e8;color:#111;">
      <section style="max-width:420px;padding:24px;background:#fff;border:1px solid #999;">
        <h1 style="margin-top:0;font-size:20px;">計算確認表を表示できません</h1>
        <p style="line-height:1.7;">確認表データが見つかりませんでした。元の画面に戻り、もう一度「計算確認表」を押してください。</p>
      </section>
    </main>
  `;
}
