// src/index.js
function src_default(Alpine) {
  window.progressBar = document.querySelector("#progress-fill");
  window.progressOn = true;
  if (window.progressBar == null) {
    window.progressOn = false;
    console.log(window.progressBar);
  }
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
window.progress = function(loaded, total) {
  if (window.progressOn) {
    window.progressBar.style.width = Math.round(loaded / total * 100) + "%";
  }
};
async function change_page(url, idHTMLToReplace) {
  var resp = await axios.get(url, {
    onUploadProgress: (progressEvent) => {
      const totalLength = progressEvent.lengthComputable ? progressEvent.total : progressEvent.target.getResponseHeader("content-length") || progressEvent.target.getResponseHeader("x-decompressed-content-length");
      if (totalLength !== null) {
        window.progress(progressEvent.loaded, totalLength);
      }
    },
    validateStatus: function(status) {
      return status < 500;
    }
  }).then((response) => {
    return response.data;
  });
  console.log("data: " + resp);
  history.pushState(null, "", url);
  var el = document.createElement("html");
  el.innerHTML = resp;
  var main = el.querySelector("div#" + idHTMLToReplace).innerHTML;
  document.querySelector("div#" + idHTMLToReplace).innerHTML = main;
  progress(0, 1);
}

// builds/module.js
var module_default = src_default;
export {
  module_default as default
};
