(function () {
  "use strict";

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy-citation]");
    if (!button) return;

    var citation = button.previousElementSibling.textContent.trim();
    var originalButtonContent = button.innerHTML;
    var copied = function () {
      button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied';
      window.setTimeout(function () { button.innerHTML = originalButtonContent; }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(citation).then(copied);
      return;
    }

    var textarea = document.createElement("textarea");
    textarea.value = citation;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    copied();
  });
}());
