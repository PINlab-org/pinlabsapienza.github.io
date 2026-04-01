(function () {
  "use strict";

  var currentModal = null;

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
  }

  function openModal(modal) {
    if (!modal) {
      return;
    }

    if (currentModal && currentModal !== modal) {
      closeModal(currentModal);
    }

    currentModal = modal;
    modal.style.display = "block";
    modal.classList.add("is-open");
    lockScroll(true);
  }

  function closeModal(modal) {
    var targetModal = modal || currentModal;
    if (!targetModal) {
      return;
    }

    targetModal.style.display = "none";
    targetModal.classList.remove("is-open");
    if (currentModal === targetModal) {
      currentModal = null;
    }
    lockScroll(false);
  }

  function getTargetModal(trigger) {
    var targetId = trigger.getAttribute("data-modal-target");
    if (!targetId) {
      return null;
    }
    return document.getElementById(targetId);
  }

  document.addEventListener("click", function (event) {
    var openTrigger = event.target.closest("[data-modal-open]");
    if (openTrigger) {
      event.preventDefault();
      openModal(getTargetModal(openTrigger));
      return;
    }

    var closeTrigger = event.target.closest("[data-modal-close]");
    if (closeTrigger) {
      event.preventDefault();
      closeModal(closeTrigger.closest(".modal"));
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  // Backward compatibility for any legacy template hooks.
  window.open_modal = function (id) {
    openModal(document.getElementById(String(id)));
  };
  window.close_modal = function () {
    closeModal();
  };
})();
