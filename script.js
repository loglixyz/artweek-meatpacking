// Renders window.CONFIG (defined inline at the top of index.html) into the page.
// Content edits belong in CONFIG, not here.
(function () {
  "use strict";

  var config = window.CONFIG;
  if (!config) return;

  // Look up "a.b.c" in CONFIG.
  function get(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, config);
  }

  // Replace {placeholders} in strings with values from config.festival.
  function fill(text) {
    var tokens = {
      festivalName: config.festival.name,
      festivalDates: config.festival.dates
    };
    return String(text).replace(/\{(\w+)\}/g, function (match, key) {
      return key in tokens ? tokens[key] : match;
    });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = fill(text);
    return node;
  }

  // <picture> with an optional WebP source and the PNG/JPEG as fallback.
  function picture(image, eager) {
    var pic = el("picture");
    if (image.webp) {
      var source = el("source");
      source.type = "image/webp";
      source.srcset = image.webp;
      pic.appendChild(source);
    }
    var img = el("img");
    img.src = image.src;
    img.alt = image.alt;
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    pic.appendChild(img);
    return pic;
  }

  // Image frame with the "Concept illustration" tag in the corner.
  function frame(image, className, eager) {
    var wrap = el("div", className);
    wrap.appendChild(picture(image, eager));
    if (config.imageNote) wrap.appendChild(el("span", "tag", config.imageNote));
    return wrap;
  }

  // Abstract SVG compositions for cards without an illustration. Decorative only.
  var NS = "http://www.w3.org/2000/svg";
  var motifs = {
    forms: [
      ["rect", { x: 0, y: 0, width: 160, height: 120, "class": "m-sand" }],
      ["path", { d: "M22 120 V62 a30 30 0 0 1 60 0 V120 z", "class": "m-teal" }],
      ["circle", { cx: 110, cy: 46, r: 24, "class": "m-sand-deep" }],
      ["path", { d: "M88 120 a28 28 0 0 1 56 0 z", "class": "m-ink" }],
      ["circle", { cx: 52, cy: 30, r: 6, "class": "m-ink" }]
    ]
  };

  function motif(name) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 160 120");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    (motifs[name] || []).forEach(function (part) {
      var shape = document.createElementNS(NS, part[0]);
      Object.keys(part[1]).forEach(function (attr) {
        shape.setAttribute(attr, part[1][attr]);
      });
      svg.appendChild(shape);
    });
    return svg;
  }

  var renderers = {
    "week.items": function (items) {
      return items.map(function (item, i) {
        var li = el("li", "card reveal");
        if (item.image) {
          li.appendChild(frame(item.image, "card__art"));
        } else {
          var art = el("div", "card__art card__art--motif");
          art.appendChild(motif(item.motif));
          li.appendChild(art);
        }
        var body = el("div", "card__body");
        body.appendChild(el("p", "card__num", String(i + 1).padStart(2, "0")));
        body.appendChild(el("h3", "card__title", item.title));
        body.appendChild(el("p", "card__text", item.text));
        li.appendChild(body);
        return li;
      });
    }
  };

  // Plain text bindings.
  document.querySelectorAll("[data-config]").forEach(function (node) {
    var value = get(node.getAttribute("data-config"));
    if (value != null) node.textContent = fill(value);
  });

  // Lists.
  document.querySelectorAll("[data-list]").forEach(function (node) {
    var key = node.getAttribute("data-list");
    var items = get(key) || [];
    node.replaceChildren.apply(node, renderers[key](items));
  });

  // Single images.
  document.querySelectorAll("[data-image]").forEach(function (node) {
    var image = get(node.getAttribute("data-image"));
    if (!image) return;
    node.replaceChildren(frame(image, "hero__frame", true), el("figcaption", null, image.caption));
  });

  // Optional sections.
  document.querySelectorAll("[data-show]").forEach(function (node) {
    if (!get(node.getAttribute("data-show"))) node.hidden = true;
  });

  document.title = config.site.title + " — " + config.site.status;

  // Fade sections in as they scroll into view. Skipped when the viewer
  // prefers reduced motion or the browser lacks IntersectionObserver.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (node) {
      observer.observe(node);
    });
  }
})();
