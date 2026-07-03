const ALLOWED_HOSTS = new Set(["1031pro.github.io", "localhost", "127.0.0.1"]);

function showDeploymentError() {
  document.body.classList.add("is-locked");
  document.body.replaceChildren();

  const wrapper = document.createElement("main");
  wrapper.className = "deploy-guard";
  wrapper.innerHTML = `
    <section>
      <p>このサンプルページは指定URLからのみ利用できます。</p>
      <a href="https://1031pro.github.io/luna24luna-shichu-suimei/app/">アプリを開く</a>
    </section>
  `;
  document.body.append(wrapper);
}

if (!ALLOWED_HOSTS.has(window.location.hostname)) {
  showDeploymentError();
}
