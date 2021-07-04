var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// builds/module.js
__export(exports, {
  default: () => module_default
});

// src/index.js
window.progressBar = document.querySelector("#progress-fill");
window.progressOn = true;
if (window.loadBar == null) {
  window.progressOn = false;
}
function src_default(Alpine) {
  Alpine.directive("routing", (el, { expression }, { evaluate }) => {
    el.addEventListener("click", () => {
      change_page(get_base_url() + evaluate(expression), "main");
    });
  });
}
function get_base_url() {
  var getUrl = window.location;
  return getUrl.protocol + "//" + getUrl.host;
}
function progress(loaded, total) {
  if (window.progressOn) {
    window.progressBar.style.width = loaded / total * 100 + "%";
  }
}
async function change_page(url, idHTMLToReplace) {
  var resp = await fetch(url).then((response) => {
    console.log(response);
    if (!response.ok) {
      throw Error(response.status + " " + response.statusText);
    }
    if (!response.body) {
      throw Error("ReadableStream not yet supported in this browser.");
    }
    const contentEncoding = response.headers.get("content-encoding");
    const contentLength = response.headers.get(contentEncoding ? "x-file-size" : "content-length");
    if (contentLength === null) {
      throw Error("Response size header unavailable");
    }
    const total = parseInt(contentLength, 10);
    let loaded = 0;
    return new Response(new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();
        read();
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            loaded += value.byteLength;
            progress(loaded, total);
            controller.enqueue(value);
            read();
          }).catch((error) => {
            console.error(error);
            controller.error(error);
          });
        }
      }
    }));
  }).then((response) => {
    return response.text();
  }).catch((error) => {
    console.error(error);
  });
  history.pushState(null, "", url);
  var el = document.createElement("html");
  el.innerHTML = resp;
  var main = el.querySelector("div#" + idHTMLToReplace).innerHTML;
  document.querySelector("div#" + idHTMLToReplace).innerHTML = main;
  progress(0, 1);
}

// builds/module.js
var module_default = src_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
