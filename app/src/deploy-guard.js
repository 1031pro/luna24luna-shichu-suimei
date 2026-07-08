const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const PRODUCTION_HOST = "1031pro.github.io";
const PRODUCTION_PATH = "/luna24luna-shichu-suimei/app/";

function isAllowedLocation(location) {
  if (LOCAL_HOSTS.has(location.hostname)) return true;
  if (location.hostname !== PRODUCTION_HOST) return false;
  return location.pathname === PRODUCTION_PATH;
}

function showDeploymentError() {
  document.body.classList.add("is-locked");
  document.body.replaceChildren();

  const wrapper = document.createElement("main");
  wrapper.className = "deploy-guard";
  wrapper.innerHTML = `
    <section>
      <p>このアプリは指定URLからのみ利用できます。</p>
      <a href="https://1031pro.github.io/luna24luna-shichu-suimei/app/">アプリを開く</a>
    </section>
  `;
  document.body.append(wrapper);
}

if (!isAllowedLocation(window.location)) {
  showDeploymentError();
}
