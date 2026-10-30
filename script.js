// Renders window.CONFIG (defined inline at the top of index.html) into the page.
// Content edits belong in CONFIG, not here.
(function () {
  "use strict";

  var config = window.CONFIG;
  if (!config) return;

  function isEmpty(value) {
    return value == null || value === "" || value === false ||
      (Array.isArray(value) && value.length === 0);
  }

  // Look up "a.b.c" in CONFIG. "a|b.c" returns the first non-empty value.
  function get(path) {
    var keys = path.split("|");
    for (var i = 0; i < keys.length; i++) {
      var value = keys[i].split(".").reduce(function (obj, key) {
        return obj == null ? undefined : obj[key];
      }, config);
      if (!isEmpty(value)) return value;
    }
    return undefined;
  }

  // Replace {placeholders} in strings with shared CONFIG values.
  function fill(text) {
    var tokens = {
      festivalName: config.festival.name,
      festivalDates: config.festival.dates,
      participationNote: config.participationNote
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

  // Pencil sketches for cards without an illustration. Decorative only.
  // "wash" shapes are soft colour fills; "line" shapes are drawn in graphite
  // and pass through the #pencil filter defined in index.html.
  var NS = "http://www.w3.org/2000/svg";
  var motifs = {
    // An easel with a canvas being drawn on, and loose marks around it.
    sketch: {
      wash: [
        ["rect", { x: 56, y: 22, width: 54, height: 46, "class": "m-wash-teal" }],
        ["circle", { cx: 122, cy: 88, r: 11, "class": "m-wash-sand" }]
      ],
      line: [
        ["rect", { x: 52, y: 18, width: 56, height: 48, rx: 1 }],
        ["path", { d: "M62 52 c8 -14 16 6 24 -8 s12 -2 16 -10" }],
        ["path", { d: "M64 30 q8 4 14 0" }],
        ["path", { d: "M80 66 L66 104 M80 66 L94 104 M80 66 L80 100" }],
        ["path", { d: "M18 100 l22 -22 l4 4 l-22 22 z M18 100 l-3 7 l7 -3" }],
        ["circle", { cx: 124, cy: 86, r: 11 }],
        ["path", { d: "M118 32 q6 -6 12 0 t12 0" }],
        ["path", { d: "M24 30 l6 6 M30 30 l-6 6" }]
      ]
    },
    // Three gathered forms and a long table line.
    forms: {
      wash: [
        ["path", { d: "M28 100 V60 a24 24 0 0 1 48 0 V100 z", "class": "m-wash-teal" }],
        ["circle", { cx: 110, cy: 50, r: 20, "class": "m-wash-sand" }],
        ["path", { d: "M90 100 a24 24 0 0 1 48 0 z", "class": "m-wash-ink" }]
      ],
      line: [
        ["path", { d: "M24 98 V58 a24 24 0 0 1 48 0 V98" }],
        ["circle", { cx: 108, cy: 48, r: 20 }],
        ["path", { d: "M86 98 a24 24 0 0 1 48 0" }],
        ["path", { d: "M12 100 H148" }],
        ["circle", { cx: 52, cy: 26, r: 5 }]
      ]
    }
  };

  function shapes(parent, list, className) {
    list.forEach(function (part) {
      var shape = document.createElementNS(NS, part[0]);
      Object.keys(part[1]).forEach(function (attr) {
        shape.setAttribute(attr, part[1][attr]);
      });
      if (className) shape.classList.add(className);
      parent.appendChild(shape);
    });
  }

  function motif(name) {
    var drawing = motifs[name] || { wash: [], line: [] };
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 160 120");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    shapes(svg, drawing.wash);
    var lines = document.createElementNS(NS, "g");
    lines.setAttribute("class", "pencil m-line");
    shapes(lines, drawing.line);
    svg.appendChild(lines);
    return svg;
  }

  // Numbered title-and-text items, used by several sections.
  function points(items) {
    return items.map(function (item, i) {
      var li = el("li", "point reveal");
      li.appendChild(el("p", "point__num", String(i + 1).padStart(2, "0")));
      li.appendChild(el("h3", "point__title", item.title));
      li.appendChild(el("p", "point__text", item.text));
      return li;
    });
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
        if (!isEmpty(item.note)) body.appendChild(el("p", "card__note", item.note));
        li.appendChild(body);
        return li;
      });
    },
    "why.points": points,
    "model.items": points,
    "exhibitionDirections.items": points,
    "timeline.steps": function (steps) {
      return steps.map(function (step) {
        var li = el("li", "step reveal");
        li.appendChild(el("p", "step__label", step.label));
        li.appendChild(el("h3", "step__title", step.title));
        li.appendChild(el("p", "step__text", step.text));
        return li;
      });
    },
    participation: function (items) {
      return [].concat(items).map(function (text) {
        return el("li", null, text);
      });
    }
  };

  // Conditional blocks first: a block whose CONFIG value is empty is removed
  // from the page entirely, so no empty shells are left behind.
  document.querySelectorAll("[data-if]").forEach(function (node) {
    if (isEmpty(get(node.getAttribute("data-if")))) node.remove();
  });

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

  document.title = config.site.title;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // In-page links scroll to their section without adding #week, #top etc.
  // to the address bar. Focus moves to the section for keyboard and
  // screen-reader users.
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var target = document.getElementById(link.getAttribute("href").slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // Fade sections in as they scroll into view. Skipped when the viewer
  // prefers reduced motion or the browser lacks IntersectionObserver.
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
