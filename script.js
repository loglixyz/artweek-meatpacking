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

  // Replace {placeholders} in strings with values from config.festival / config.site.
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

  function figure(image) {
    var fig = el("figure", "scene");
    var img = el("img");
    img.src = image.src;
    img.alt = image.alt;
    img.loading = "lazy";
    img.decoding = "async";
    fig.appendChild(img);
    fig.appendChild(el("figcaption", null, image.caption));
    return fig;
  }

  // Small abstract SVG compositions for the week cards. Decorative only.
  var NS = "http://www.w3.org/2000/svg";
  var motifs = {
    table: [
      ["rect", { x: 14, y: 52, width: 132, height: 16, rx: 8, "class": "m-ink" }],
      ["circle", { cx: 34, cy: 36, r: 9, "class": "m-teal" }],
      ["circle", { cx: 64, cy: 36, r: 9, "class": "m-teal" }],
      ["circle", { cx: 94, cy: 36, r: 9, "class": "m-teal" }],
      ["circle", { cx: 124, cy: 36, r: 9, "class": "m-teal" }],
      ["circle", { cx: 50, cy: 86, r: 9, "class": "m-sand" }],
      ["circle", { cx: 80, cy: 86, r: 9, "class": "m-sand" }],
      ["circle", { cx: 110, cy: 86, r: 9, "class": "m-sand" }]
    ],
    grid: [
      ["rect", { x: 22, y: 18, width: 50, height: 34, rx: 4, "class": "m-teal" }],
      ["rect", { x: 86, y: 18, width: 50, height: 34, rx: 4, "class": "m-sand" }],
      ["rect", { x: 22, y: 64, width: 50, height: 34, rx: 4, "class": "m-sand" }],
      ["rect", { x: 86, y: 64, width: 50, height: 34, rx: 4, "class": "m-ink" }]
    ],
    cup: [
      ["path", { d: "M44 34 h64 v26 a32 32 0 0 1 -64 0 z", "class": "m-teal" }],
      ["path", { d: "M108 44 a12 12 0 0 1 0 24", "class": "m-stroke" }],
      ["rect", { x: 32, y: 96, width: 88, height: 8, rx: 4, "class": "m-ink" }]
    ],
    forms: [
      ["path", { d: "M18 100 V52 a30 30 0 0 1 60 0 V100 z", "class": "m-teal" }],
      ["circle", { cx: 104, cy: 46, r: 26, "class": "m-sand" }],
      ["path", { d: "M84 100 a28 28 0 0 1 56 0 z", "class": "m-ink" }]
    ]
  };

  function motif(name) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 160 116");
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
        var li = el("li", "card");
        var art = el("div", "card__art");
        art.appendChild(motif(item.motif));
        li.appendChild(art);
        li.appendChild(el("p", "card__num", String(i + 1).padStart(2, "0")));
        li.appendChild(el("h3", "card__title", item.title));
        li.appendChild(el("p", "card__text", item.text));
        return li;
      });
    },
    scenes: function (images) {
      return images.map(figure);
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
    var fresh = figure(image);
    fresh.className = node.className;
    fresh.querySelector("img").loading = "eager";
    node.replaceWith(fresh);
  });

  // Optional sections.
  document.querySelectorAll("[data-show]").forEach(function (node) {
    if (!get(node.getAttribute("data-show"))) node.hidden = true;
  });

  document.title = config.site.title + " — " + config.site.status;
})();
