(function () {
  "use strict";

  function showSection(sectionId) {
    var warning = document.getElementById(sectionId + "-warning");
    var content = document.getElementById(sectionId + "-content");

    if (warning) {
      warning.classList.add("hidden");
    }
    if (content) {
      content.classList.remove("blurred");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (event) {
      var revealTrigger = event.target.closest("[data-reveal-section]");
      if (!revealTrigger) {
        return;
      }
      showSection(revealTrigger.getAttribute("data-reveal-section"));
    });

    document.querySelectorAll(".video-wrapper video, .video-item video").forEach(function (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        } else {
          video.pause();
        }
      });
    });
  });

  // Backward compatibility for any legacy template hooks.
  window.showSection = showSection;
})();
