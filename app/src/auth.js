const PASSWORD = "demo";
const STORAGE_KEY = "shichu-suimei-demo-authenticated";

const lock = document.querySelector("#demo-lock");
const form = document.querySelector("#demo-lock-form");
const input = document.querySelector("#demo-password");
const error = document.querySelector("#demo-lock-error");

function unlock() {
  document.body.classList.remove("is-locked");
  lock.hidden = true;
}

if (sessionStorage.getItem(STORAGE_KEY) === "true") {
  unlock();
} else {
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (input.value === PASSWORD) {
    sessionStorage.setItem(STORAGE_KEY, "true");
    unlock();
    return;
  }

  error.hidden = false;
  input.select();
});
