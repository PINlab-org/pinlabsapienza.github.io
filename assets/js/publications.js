(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("a.abstract, a.bibtex").forEach(function (trigger) {
      trigger.setAttribute("href", trigger.getAttribute("href") || "#");
    });
  });
})();
