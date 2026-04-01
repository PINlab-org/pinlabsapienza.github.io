(function () {
  "use strict";

  function initNavbar() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.getElementById("nav-links");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("is-open", !expanded);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  function initScrollTopButton() {
    var button = document.getElementById("top");
    if (!button) {
      return;
    }

    function onScroll() {
      if (window.scrollY > 300) {
        button.style.display = "grid";
      } else {
        button.style.display = "none";
      }
    }

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initPublicationToggles() {
    document.addEventListener("click", function (event) {
      var abstractTrigger = event.target.closest('[data-pub-toggle="abstract"], a.abstract');
      var bibtexTrigger = event.target.closest('[data-pub-toggle="bibtex"], a.bibtex');

      if (!abstractTrigger && !bibtexTrigger) {
        return;
      }

      event.preventDefault();
      var trigger = abstractTrigger || bibtexTrigger;
      var container = trigger.closest("[data-pub-entry], #publications div[id], #recentpubs div[id], #two-column-section div[id], #hub div[id]");
      if (!container) {
        container = trigger.closest("div[id]");
      }
      if (!container) {
        return;
      }

      var panelSelector = abstractTrigger ? ".abstract.hidden" : ".bibtex.hidden";
      var panel = container.querySelector(panelSelector);
      if (!panel) {
        return;
      }

      var shouldOpen = !panel.classList.contains("open");

      document.querySelectorAll(".abstract.open, .bibtex.open").forEach(function (openPanel) {
        openPanel.classList.remove("open");
      });
      document.querySelectorAll("[data-pub-toggle], a.abstract, a.bibtex").forEach(function (btn) {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-expanded", "false");
      });

      if (shouldOpen) {
        panel.classList.add("open");
        trigger.classList.add("is-active");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  }

  function initPeopleSocialExpanders() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("#people .person-card .social-links"));
    if (!lists.length) {
      return;
    }
    var canHoverCollapse = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function setToggleIcon(button, expanded) {
      button.innerHTML = expanded
        ? '<i class="fas fa-chevron-up" aria-hidden="true"></i>'
        : '<i class="fas fa-chevron-down" aria-hidden="true"></i>';
      button.setAttribute("aria-expanded", String(expanded));
      button.setAttribute("aria-label", expanded ? "Show fewer social links" : "Show all social links");
    }

    lists.forEach(function (list) {
      var existingToggle = list.querySelector("li.social-toggle");
      if (existingToggle) {
        existingToggle.remove();
      }

      list.classList.remove("is-collapsible", "is-collapsed", "is-expanded");

      var items = Array.prototype.slice.call(list.children).filter(function (li) {
        return li.tagName === "LI" && !li.classList.contains("social-empty") && !li.classList.contains("social-toggle");
      });

      items.forEach(function (li) {
        li.hidden = false;
      });

      if (items.length <= 1) {
        return;
      }

      var firstRowTop = items[0].offsetTop;
      var firstRowItems = items.filter(function (li) {
        return li.offsetTop === firstRowTop;
      });

      if (firstRowItems.length <= 1 || firstRowItems.length === items.length) {
        return;
      }

      var collapsedVisibleCount = firstRowItems.length - 1;
      items.forEach(function (li, index) {
        li.hidden = index >= collapsedVisibleCount;
      });

      var toggleLi = document.createElement("li");
      toggleLi.className = "social-toggle";
      var toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "social-toggle-btn";
      setToggleIcon(toggleButton, false);
      toggleLi.appendChild(toggleButton);
      list.appendChild(toggleLi);

      list.classList.add("is-collapsible", "is-collapsed");
      var card = list.closest(".person-card");

      function setExpandedState(expand) {
        list.classList.toggle("is-expanded", expand);
        list.classList.toggle("is-collapsed", !expand);
        items.forEach(function (li, index) {
          li.hidden = !expand && index >= collapsedVisibleCount;
        });
        setToggleIcon(toggleButton, expand);
      }

      toggleButton.addEventListener("click", function () {
        var expand = !list.classList.contains("is-expanded");
        setExpandedState(expand);
      });

      if (card && canHoverCollapse) {
        if (card.__socialCollapseOnLeave) {
          card.removeEventListener("mouseleave", card.__socialCollapseOnLeave);
        }
        card.__socialCollapseOnLeave = function () {
          if (list.classList.contains("is-expanded")) {
            setExpandedState(false);
          }
        };
        card.addEventListener("mouseleave", card.__socialCollapseOnLeave);
      }
    });
  }

  function initPresenceMap() {
    var section = document.getElementById("presence-map");
    if (!section) {
      return;
    }

    var dataNode = section.querySelector("[data-presence-data]");
    var mapCanvas = section.querySelector("[data-presence-canvas]");
    var stageEl = section.querySelector(".presence-stage");
    var uiPin = section.querySelector("[data-presence-ui-pin]");
    var uiLabel = section.querySelector("[data-presence-ui-label]");
    var uiKicker = section.querySelector("[data-presence-ui-kicker]");
    var uiLocation = section.querySelector("[data-presence-ui-location]");
    var uiDescription = section.querySelector("[data-presence-ui-description]");
    if (!dataNode) {
      return;
    }
    if (!mapCanvas || !window.L) {
      return;
    }

    var locations = [];
    try {
      locations = JSON.parse(dataNode.textContent || "[]");
    } catch (error) {
      return;
    }

    if (!Array.isArray(locations)) {
      return;
    }

    locations = locations
      .map(function (entry) {
        return {
          name: entry && entry.name ? String(entry.name) : "",
          description: entry && entry.description ? String(entry.description) : "",
          lat: Number(entry && entry.lat),
          lng: Number(entry && entry.lng)
        };
      })
      .filter(function (entry) {
        return entry.name && Number.isFinite(entry.lat) && Number.isFinite(entry.lng);
      });

    if (!locations.length) {
      return;
    }

    var indicators = Array.prototype.slice.call(section.querySelectorAll("[data-presence-indicator]"));
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cycleMs = Number(section.dataset.cycleMs);
    var worldCenter = L.latLng(18, 8);
    var worldZoom = prefersReducedMotion ? 2.55 : 2.38;
    var baseScale = prefersReducedMotion ? 1.04 : 1.12;
    var focusScale = prefersReducedMotion ? 1.2 : 1.58;
    var zoomOutMs = prefersReducedMotion ? 0 : 640;
    var travelMs = prefersReducedMotion ? 0 : 1500;
    var zoomInMs = prefersReducedMotion ? 0 : 760;

    if (!Number.isFinite(cycleMs) || cycleMs < 2500) {
      cycleMs = 4400;
    }
    var dwellMs = Math.max(1800, cycleMs);

    if (section.__presenceMapTimer) {
      clearTimeout(section.__presenceMapTimer);
      section.__presenceMapTimer = null;
    }
    if (section.__presenceMapKickoff) {
      clearTimeout(section.__presenceMapKickoff);
      section.__presenceMapKickoff = null;
    }
    if (section.__presenceMapStepTimer) {
      clearTimeout(section.__presenceMapStepTimer);
      section.__presenceMapStepTimer = null;
    }
    if (section.__presenceMapFrame) {
      cancelAnimationFrame(section.__presenceMapFrame);
      section.__presenceMapFrame = null;
    }
    if (section.__presenceLeafletMap) {
      section.__presenceLeafletMap.remove();
      section.__presenceLeafletMap = null;
    }

    var map = L.map(mapCanvas, {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false,
      worldCopyJump: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false
    });
    section.__presenceLeafletMap = map;

    map.createPane("presenceRoutes");
    map.getPane("presenceRoutes").style.zIndex = 430;
    map.createPane("presenceMarkers");
    map.getPane("presenceMarkers").style.zIndex = 520;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png", {
      subdomains: "abcd",
      minZoom: 1,
      maxZoom: 6,
      noWrap: false,
      detectRetina: false,
      tileSize: 512,
      zoomOffset: -1,
      keepBuffer: 6,
      updateWhenIdle: true
    }).addTo(map);

    map.fitBounds([[-58, -170], [76, 182]], { animate: false, padding: [6, 6] });
    map.setView(worldCenter, worldZoom, { animate: false });
    mapCanvas.style.transformOrigin = "0 0";

    var points = locations.map(function (location) {
      return L.latLng(location.lat, location.lng);
    });
    var homePoint = points[0];
    var activeLatLng = homePoint;
    var cameraState = {
      tx: 0,
      ty: 0,
      scale: 1
    };

    L.circleMarker(homePoint, {
      pane: "presenceMarkers",
      radius: 6,
      color: "rgba(239, 230, 210, 0.95)",
      weight: 2,
      fillColor: "rgba(239, 230, 210, 0.18)",
      fillOpacity: 1
    }).addTo(map);

    var routeLine = L.polyline([], {
      pane: "presenceRoutes",
      color: "rgba(239, 230, 210, 0.95)",
      weight: 2.1,
      opacity: 0.96,
      dashArray: "1 10",
      lineCap: "round",
      className: "presence-route-animated"
    }).addTo(map);

    function easeInOutCubic(value) {
      if (value < 0.5) {
        return 4 * value * value * value;
      }
      return 1 - Math.pow(-2 * value + 2, 3) / 2;
    }

    function lerp(from, to, t) {
      return from + (to - from) * t;
    }

    function shortestDeltaLng(from, to) {
      var delta = to - from;
      if (delta > 180) {
        return delta - 360;
      }
      if (delta < -180) {
        return delta + 360;
      }
      return delta;
    }

    function normalizeLng(lng) {
      if (lng > 180) {
        return lng - 360;
      }
      if (lng < -180) {
        return lng + 360;
      }
      return lng;
    }

    function interpolateLatLng(from, to, t) {
      var deltaLng = shortestDeltaLng(from.lng, to.lng);
      return L.latLng(lerp(from.lat, to.lat, t), normalizeLng(from.lng + deltaLng * t));
    }

    function applyCamera(target, scale) {
      var viewportWidth = stageEl ? stageEl.clientWidth : map.getSize().x;
      var viewportHeight = stageEl ? stageEl.clientHeight : map.getSize().y;
      var baseOffsetX = mapCanvas ? mapCanvas.offsetLeft : 0;
      var baseOffsetY = mapCanvas ? mapCanvas.offsetTop : 0;
      var point = map.latLngToContainerPoint(target);
      var tx = viewportWidth * 0.5 - baseOffsetX - scale * point.x;
      var ty = viewportHeight * 0.5 - baseOffsetY - scale * point.y;
      cameraState.tx = tx;
      cameraState.ty = ty;
      cameraState.scale = scale;
      mapCanvas.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + scale + ")";
      updateOverlayPosition();
    }

    function updateOverlayPosition() {
      if (!uiPin || !uiLabel || !activeLatLng) {
        return;
      }
      var baseOffsetX = mapCanvas ? mapCanvas.offsetLeft : 0;
      var baseOffsetY = mapCanvas ? mapCanvas.offsetTop : 0;
      var point = map.latLngToContainerPoint(activeLatLng);
      var x = baseOffsetX + point.x * cameraState.scale + cameraState.tx;
      var y = baseOffsetY + point.y * cameraState.scale + cameraState.ty;
      uiPin.style.left = x + "px";
      uiPin.style.top = y + "px";
      uiLabel.style.left = x + "px";
      uiLabel.style.top = y + "px";
    }

    function updateIndicators(index) {
      indicators.forEach(function (indicator, indicatorIndex) {
        indicator.classList.toggle("is-active", indicatorIndex === index);
      });
    }

    function hidePinMessage() {
      if (uiLabel) {
        uiLabel.classList.remove("is-visible");
      }
    }

    function showPinMessage(index) {
      var loc = locations[index] || locations[0];
      var kicker = index === 0 ? "We are here" : "But also here";
      if (uiKicker) {
        uiKicker.textContent = kicker;
      }
      if (uiLocation) {
        uiLocation.textContent = loc.name;
      }
      if (uiDescription) {
        uiDescription.textContent = loc.description || "";
      }
      if (uiLabel) {
        uiLabel.classList.add("is-visible");
      }
      updateOverlayPosition();

      updateIndicators(index);
    }

    function arcPath(from, to, steps) {
      var deltaLng = shortestDeltaLng(from.lng, to.lng);
      var latDelta = to.lat - from.lat;
      var lift = Math.max(2.4, Math.min(15, Math.abs(deltaLng) * 0.07 + Math.abs(latDelta) * 0.1));
      var result = [];

      for (var i = 0; i <= steps; i += 1) {
        var t = i / steps;
        var lng = normalizeLng(from.lng + deltaLng * t);
        var lat = from.lat + latDelta * t + Math.sin(Math.PI * t) * lift;
        result.push(L.latLng(lat, lng));
      }
      return result;
    }

    function animateFrame(duration, updater, done) {
      if (section.__presenceMapFrame) {
        cancelAnimationFrame(section.__presenceMapFrame);
        section.__presenceMapFrame = null;
      }

      if (duration <= 0) {
        updater(1);
        if (done) {
          done();
        }
        return;
      }

      var start = performance.now();

      function frame(now) {
        var t = Math.max(0, Math.min(1, (now - start) / duration));
        updater(t);
        if (t < 1) {
          section.__presenceMapFrame = requestAnimationFrame(frame);
        } else {
          section.__presenceMapFrame = null;
          if (done) {
            done();
          }
        }
      }

      section.__presenceMapFrame = requestAnimationFrame(frame);
    }

    function queue(delay, callback, key) {
      if (section[key]) {
        clearTimeout(section[key]);
      }
      section[key] = window.setTimeout(callback, delay);
    }

    var activeIndex = 0;

    function animateTransition(fromIndex, toIndex, onDone) {
      var from = points[fromIndex];
      var to = points[toIndex];
      var path = arcPath(from, to, 72);

      section.classList.add("is-zooming");
      hidePinMessage();
      routeLine.setLatLngs([from]);
      activeLatLng = from;
      applyCamera(from, focusScale);

      function finishArrival() {
        showPinMessage(toIndex);
        if (onDone) {
          onDone();
        }
      }

      function startZoomIn() {
        // 4) remove dotted line on arrival to new location
        routeLine.setLatLngs([]);
        animateFrame(
          zoomInMs,
          function (t) {
            var eased = easeInOutCubic(t);
            var center = interpolateLatLng(worldCenter, to, eased);
            var scale = lerp(baseScale, focusScale, eased);
            applyCamera(center, scale);
          },
          function () {
            applyCamera(to, focusScale);
            section.classList.remove("is-zooming");
            finishArrival();
          }
        );
      }

      function startMove() {
        // 3) start move animation
        animateFrame(
          travelMs,
          function (t) {
            var eased = easeInOutCubic(t);
            var idx = Math.max(1, Math.round(eased * (path.length - 1)));
            activeLatLng = path[idx];
            updateOverlayPosition();
            routeLine.setLatLngs(path.slice(0, idx + 1));
            applyCamera(worldCenter, baseScale);
          },
          function () {
            activeLatLng = to;
            updateOverlayPosition();
            startZoomIn();
          }
        );
      }

      // 2) zoom out (from focused location to world)
      animateFrame(
        zoomOutMs,
        function (t) {
          var eased = easeInOutCubic(t);
          var center = interpolateLatLng(from, worldCenter, eased);
          var scale = lerp(focusScale, baseScale, eased);
          applyCamera(center, scale);
        },
        startMove
      );
    }

    function cycle() {
      if (locations.length < 2) {
        return;
      }

      var nextIndex = (activeIndex + 1) % locations.length;
      animateTransition(activeIndex, nextIndex, function () {
        activeIndex = nextIndex;
        queue(dwellMs, cycle, "__presenceMapTimer");
      });
    }

    activeLatLng = homePoint;
    routeLine.setLatLngs([]);
    hidePinMessage();
    updateIndicators(0);
    map.setView(worldCenter, worldZoom, { animate: false });
    applyCamera(homePoint, focusScale);

    section.__presenceMapKickoff = window.setTimeout(function () {
      showPinMessage(0);
      if (locations.length > 1) {
        queue(dwellMs, cycle, "__presenceMapTimer");
      }
    }, prefersReducedMotion ? 60 : 220);
  }

  function legacyCopyText(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (copied) {
          resolve();
        } else {
          reject(new Error("Copy failed"));
        }
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function copyTextToClipboard(text) {
    if (!text) {
      return Promise.reject(new Error("No text"));
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function" && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopyText(text);
      });
    }

    return legacyCopyText(text);
  }

  function initBibtexCopyButtons() {
    document.addEventListener("click", function (event) {
      var copyButton = event.target.closest("[data-copy-bibtex]");
      if (!copyButton || copyButton.disabled) {
        return;
      }

      var container = copyButton.closest(".bibtex, .bibtex-panel");
      if (!container) {
        return;
      }

      var raw = container.querySelector(".bibtex-raw");
      var textToCopy = raw && raw.textContent ? raw.textContent.trim() : "";
      if (!textToCopy) {
        var code = container.querySelector("code.language-bibtex, code[data-lang='bibtex'], pre code");
        textToCopy = code && code.textContent ? code.textContent.trim() : "";
      }
      if (!textToCopy) {
        return;
      }

      event.preventDefault();
      var originalLabel = copyButton.textContent.trim() || "Copy";

      copyTextToClipboard(textToCopy)
        .then(function () {
          copyButton.textContent = "Copied";
          copyButton.classList.add("is-copied");
          setTimeout(function () {
            copyButton.textContent = originalLabel;
            copyButton.classList.remove("is-copied");
          }, 1200);
        })
        .catch(function () {
          copyButton.textContent = "Error";
          setTimeout(function () {
            copyButton.textContent = originalLabel;
          }, 1200);
        });
    });
  }

  function setImageLoadingPolicy() {
    var eagerImages = new Set();
    document.querySelectorAll(".nav-brand img, #about-me .img img, .page-hero img").forEach(function (img) {
      eagerImages.add(img);
    });

    document.querySelectorAll("img").forEach(function (img) {
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", eagerImages.has(img) ? "eager" : "lazy");
      }
    });
  }

  function hydrateVideo(video) {
    if (video.dataset.hydrated === "true") {
      return;
    }

    if (video.dataset.src) {
      video.src = video.dataset.src;
    }

    video.querySelectorAll("source[data-src]").forEach(function (source) {
      source.src = source.dataset.src;
    });

    video.load();
    video.dataset.hydrated = "true";
  }

  function setVideoLoadingPolicy() {
    var supportsObserver = "IntersectionObserver" in window;
    var videos = Array.prototype.slice.call(document.querySelectorAll("video"));

    videos.forEach(function (video) {
      if (!video.hasAttribute("preload")) {
        video.setAttribute("preload", "none");
      }

      if (!video.hasAttribute("playsinline")) {
        video.setAttribute("playsinline", "");
      }

      if (video.hasAttribute("autoplay")) {
        video.dataset.autoplay = "true";
        video.removeAttribute("autoplay");
      }

      if (video.getAttribute("src")) {
        video.dataset.src = video.getAttribute("src");
        video.removeAttribute("src");
      }

      video.querySelectorAll("source[src]").forEach(function (source) {
        source.dataset.src = source.getAttribute("src");
        source.removeAttribute("src");
      });
    });

    if (!supportsObserver) {
      videos.forEach(function (video) {
        hydrateVideo(video);
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;

          if (entry.isIntersecting) {
            hydrateVideo(video);
            if (video.dataset.autoplay === "true") {
              var playPromise = video.play();
              if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
              }
            }
          } else if (video.dataset.autoplay === "true") {
            video.pause();
          }
        });
      },
      {
        rootMargin: "240px 0px",
        threshold: 0.1
      }
    );

    videos.forEach(function (video) {
      observer.observe(video);
    });
  }

  function normalizeExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = link.getAttribute("rel") || "";
      if (!/noopener/i.test(rel) || !/noreferrer/i.test(rel)) {
        var tokens = rel.split(/\s+/).filter(Boolean);
        if (!tokens.includes("noopener")) {
          tokens.push("noopener");
        }
        if (!tokens.includes("noreferrer")) {
          tokens.push("noreferrer");
        }
        link.setAttribute("rel", tokens.join(" "));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavbar();
    initScrollTopButton();
    initPresenceMap();
    initPublicationToggles();
    initPeopleSocialExpanders();
    initBibtexCopyButtons();
    setImageLoadingPolicy();
    setVideoLoadingPolicy();
    normalizeExternalLinks();

    var socialResizeTimer = null;
    window.addEventListener("resize", function () {
      if (socialResizeTimer) {
        clearTimeout(socialResizeTimer);
      }
      socialResizeTimer = setTimeout(initPeopleSocialExpanders, 150);
    });
    window.addEventListener("load", initPeopleSocialExpanders);
  });
})();
