(function () {
  "use strict";

  document.addEventListener("click", function (event) {
    var toggle = event.target.closest("[data-publication-toggle]");
    if (toggle) {
      var entry = toggle.closest(".publication-entry");
      var panel = entry.querySelector('[data-publication-panel="' + toggle.dataset.publicationToggle + '"]');
      var isOpen = !panel.hidden;

      entry.querySelectorAll("[data-publication-panel]").forEach(function (item) {
        item.hidden = true;
      });
      entry.querySelectorAll("[data-publication-toggle]").forEach(function (item) {
        item.setAttribute("aria-expanded", "false");
      });

      panel.hidden = isOpen;
      toggle.setAttribute("aria-expanded", String(!isOpen));
      return;
    }

    var copyButton = event.target.closest("[data-publication-copy]");
    if (!copyButton) return;

    var citation = copyButton.closest("[data-publication-panel]").querySelector("code").textContent.trim();
    var originalButtonContent = copyButton.innerHTML;
    var copied = function () {
      copyButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied';
      window.setTimeout(function () { copyButton.innerHTML = originalButtonContent; }, 1600);
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
