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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
