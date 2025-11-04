var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// sdk/src/rum.ts
var BATCH_MAX = 50;
var FLUSH_MS = 5e3;
var state = {
  opts: null,
  route: "",
  ctx: {},
  queue: []
};
function deviceClass() {
  try {
    return window.innerWidth < 768 ? "mobile" : "desktop";
  } catch (e) {
    return "unknown";
  }
}
function connectionType() {
  var _a;
  try {
    return ((_a = navigator.connection) == null ? void 0 : _a.effectiveType) || "unknown";
  } catch (e) {
    return "unknown";
  }
}
function push(ev) {
  state.queue.push(ev);
  if (state.queue.length >= BATCH_MAX) flush();
  if (!state.timer) {
    state.timer = window.setTimeout(flush, FLUSH_MS);
  }
}
function urlOk(url, maskers = []) {
  try {
    const u = new URL(url, location.origin).toString();
    return !maskers.some((m) => typeof m === "string" ? u.includes(m) : m.test(u));
  } catch (e) {
    return true;
  }
}
function send(beacons) {
  if (!state.opts) return;
  const payload = {
    writeKey: state.opts.writeKey,
    app: state.opts.app || "web",
    context: __spreadProps(__spreadValues({}, state.ctx), {
      device: deviceClass(),
      connection: connectionType(),
      ua: navigator.userAgent,
      route: state.route
    }),
    events: beacons
  };
  const body = JSON.stringify(payload);
  const url = state.opts.endpoint;
  if (navigator.sendBeacon) {
    const ok = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    if (ok) return;
  }
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body }).catch(() => {
  });
}
function flush() {
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = void 0;
  }
  const copy = state.queue.splice(0, state.queue.length);
  if (copy.length) send(copy);
}
function sampleHit(rate = 1) {
  if (rate >= 1) return true;
  return Math.random() < rate;
}
function observeVitals(opts) {
  var _a, _b;
  const names = new Set((_b = (_a = opts.capture) == null ? void 0 : _a.metrics) != null ? _b : ["LCP", "INP", "CLS", "FCP", "TTFB"]);
  try {
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const name = e.name;
        if (e.entryType === "paint" && names.has("FCP") && name === "first-contentful-paint") {
          push({ type: "metric", name: "FCP", value: e.startTime, ts: Date.now() });
        }
        if (e.entryType === "largest-contentful-paint" && names.has("LCP")) {
          push({ type: "metric", name: "LCP", value: e.renderTime || e.loadTime || e.startTime, ts: Date.now() });
        }
        if (e.entryType === "layout-shift" && names.has("CLS") && !e.hadRecentInput) {
          push({ type: "metric", name: "CLS", value: e.value, ts: Date.now() });
        }
      }
    });
    try {
      po.observe({ type: "paint", buffered: true });
    } catch (e) {
    }
    try {
      po.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
    }
    try {
      po.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
    }
  } catch (e) {
  }
  if (names.has("TTFB")) {
    try {
      const [nav] = performance.getEntriesByType("navigation");
      if (nav) {
        push({ type: "metric", name: "TTFB", value: nav.responseStart, ts: Date.now() });
      }
    } catch (e) {
    }
  }
  if (names.has("LongTask")) {
    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          push({ type: "metric", name: "LongTask", value: e.duration, ts: Date.now(), attrs: { start: e.startTime } });
        }
      });
      po.observe({ type: "longtask", buffered: true });
    } catch (e) {
    }
  }
  if (names.has("ResourceTiming")) {
    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!urlOk(e.name, opts.maskURLs)) continue;
          push({
            type: "resource",
            url: e.name,
            initiatorType: e.initiatorType,
            startTime: e.startTime,
            duration: e.duration,
            transferSize: e.transferSize,
            encodedBodySize: e.encodedBodySize,
            decodedBodySize: e.decodedBodySize,
            ts: Date.now(),
            thirdParty: !e.name.startsWith(location.origin)
          });
        }
      });
      po.observe({ type: "resource", buffered: true });
    } catch (e) {
    }
  }
}
function captureErrors() {
  window.addEventListener("error", (ev) => {
    const err = ev.error || ev.message || "Error";
    const message = typeof err === "string" ? err : (err == null ? void 0 : err.message) || "Error";
    const stack = typeof err === "string" ? void 0 : err == null ? void 0 : err.stack;
    push({ type: "error", name: "Error", message, stack, ts: Date.now() });
  });
  window.addEventListener("unhandledrejection", (ev) => {
    const reason = ev.reason || "UnhandledRejection";
    const message = typeof reason === "string" ? reason : (reason == null ? void 0 : reason.message) || "UnhandledRejection";
    const stack = typeof reason === "string" ? void 0 : reason == null ? void 0 : reason.stack;
    push({ type: "error", name: "UnhandledRejection", message, stack, ts: Date.now() });
  });
}
var Overhaul = {
  init(opts) {
    var _a, _b;
    state.opts = opts;
    if (!sampleHit((_a = opts.sampleRate) != null ? _a : 1)) return;
    observeVitals(opts);
    if (((_b = opts.capture) == null ? void 0 : _b.errors) !== false) captureErrors();
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  },
  shutdown() {
    flush();
    state = { opts: null, route: "", ctx: {}, queue: [] };
  },
  trackMetric(name, value, attrs = {}) {
    push({ type: "metric", name, value, ts: Date.now(), attrs });
  },
  trackError(err, attrs = {}) {
    const message = typeof err === "string" ? err : err.message;
    const stack = typeof err === "string" ? void 0 : err.stack;
    push({ type: "error", name: "ManualError", message, stack, ts: Date.now(), attrs });
  },
  trackResource(entry, attrs = {}) {
    var _a;
    if (!urlOk(entry.name, (_a = state.opts) == null ? void 0 : _a.maskURLs)) return;
    push({
      type: "resource",
      url: entry.name,
      initiatorType: entry.initiatorType,
      startTime: entry.startTime,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      ts: Date.now(),
      thirdParty: !entry.name.startsWith(location.origin),
      attrs
    });
  },
  setContext(ctx) {
    state.ctx = __spreadValues(__spreadValues({}, state.ctx), ctx);
  },
  setRoute(route) {
    state.route = route;
  }
};
var rum_default = Overhaul;
export {
  Overhaul,
  rum_default as default
};
