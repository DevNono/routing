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
async function change_page(url, idHTMLToReplace) {
  var resp = await axios.get(url, {
    validateStatus: function(status) {
      return status < 500;
    }
  }).then((response) => {
    return response.data;
  });
  history.pushState(null, "", url);
  var el = document.createElement("html");
  el.innerHTML = resp;
  var main = el.querySelector("div#" + idHTMLToReplace).innerHTML;
  document.querySelector("div#" + idHTMLToReplace).innerHTML = main;
}

// builds/module.js
var module_default = src_default;
export {
  module_default as default
};
