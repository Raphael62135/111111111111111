/* =========================================
   ECLIPSE LAB - INTERACTIVE LIGHT LAB
========================================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const modal = $("#modal");
const modalClose = $("#modalClose");
const modalBottomClose = $("#modalBottomClose");
const modalTitle = $("#modalTitle");
const modalEyebrow = $("#modalEyebrow");
const visualContent = $("#visualContent");
const explanationContent = $("#explanationContent");

const topics = {
  source: {
    category: "INTERACTIVE EXPERIMENT · 01",
    title: "점광원과 면광원"
  },
  path: {
    category: "INTERACTIVE EXPERIMENT · 02",
    title: "태양광의 진행 방향"
  }
};

let previousFocus = null;

function openModal(topic, mode) {
  const data = topics[topic];
  if (!data || !modal) return;

  previousFocus = document.activeElement;

  modalEyebrow.textContent = mode === "visual"
    ? data.category
    : "SCIENTIFIC EXPLANATION";

  modalTitle.textContent = mode === "visual"
    ? data.title
    : `${data.title} - 해설`;

  visualContent.hidden = mode !== "visual";
  explanationContent.hidden = mode !== "explanation";

  $("#sourcePanel").hidden = !(mode === "visual" && topic === "source");
  $("#pathPanel").hidden = !(mode === "visual" && topic === "path");

  $("#sourceExplanation").hidden =
    !(mode === "explanation" && topic === "source");

  $("#pathExplanation").hidden =
    !(mode === "explanation" && topic === "path");

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (mode === "visual") {
    if (topic === "source") drawSourceExperiment();
    if (topic === "path") drawPathExperiment();
  }

  modalClose?.focus();
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  previousFocus?.focus?.();
}

$$("[data-topic][data-action]").forEach(button => {
  button.addEventListener("click", () => {
    openModal(
      button.dataset.topic,
      button.dataset.action === "visual" ? "visual" : "explanation"
    );
  });
});

modalClose?.addEventListener("click", closeModal);
modalBottomClose?.addEventListener("click", closeModal);

modal?.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal?.classList.contains("active")) {
    closeModal();
  }
});

/* =========================================
   SVG UTILITIES
========================================= */

const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);

  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });

  return node;
}

function clear(node) {
  if (node) node.replaceChildren();
}

function addLine(
  group,
  x1,
  y1,
  x2,
  y2,
  color = "#ffd078",
  width = 2,
  dash = ""
) {
  if (!group) return;

  const line = svgEl("line", {
    x1,
    y1,
    x2,
    y2,
    stroke: color,
    "stroke-width": width,
    opacity: 0.9
  });

  if (dash) line.setAttribute("stroke-dasharray", dash);

  group.appendChild(line);
}

function addPolygon(group, points, fill, opacity = 0.7) {
  if (!group) return;

  group.appendChild(svgEl("polygon", {
    points: points.map(p => `${p.x},${p.y}`).join(" "),
    fill,
    opacity
  }));
}

function addText(group, text, x, y, color = "#c7d2e3") {
  if (!group) return;

  const t = svgEl("text", {
    x,
    y,
    fill: color,
    "font-size": 13,
    "text-anchor": "middle"
  });

  t.textContent = text;
  group.appendChild(t);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setOutput(input, output, suffix = "%") {
  if (input && output) {
    output.value = `${input.value}${suffix}`;
  }
}

function lineAtX(x, x1, y1, x2, y2) {
  return y1 + (y2 - y1) * ((x - x1) / (x2 - x1));
}

/* =========================================
   EXPERIMENT 01: POINT / EXTENDED SOURCE
========================================= */

const sourceSize = $("#sourceSize");
const sourceSizeValue = $("#sourceSizeValue");
const sourceObjectPosition = $("#sourceObjectPosition");
const sourceObjectPositionValue = $("#sourceObjectPositionValue");
const sourceShowRays = $("#sourceShowRays");

const sourceRays = $("#sourceRays");
const sourceShadow = $("#sourceShadow");
const sourceEmitter = $("#sourceEmitter");
const pointEmitter = $("#pointEmitter");
const sourceObject = $("#sourceObject");
const sourceStatus = $("#sourceStatus");

const sourceSizeRow = sourceSize?.closest(".control-row");

let sourceMode = "extended";

function drawSourceExperiment() {
  if (!sourceSize || !sourceObjectPosition) return;

  const size = Number(sourceSize.value);
  const pos = Number(sourceObjectPosition.value);

  const objectX = 235 + pos * 2.7;
  const objectTop = 150;
  const objectBottom = 210;

  const emitterX = 79;
  const screenX = 680;
  const centerY = 180;

  // 크기 0%라면 실제 광원 반지름도 0
  const radius = sourceMode === "point"
    ? 0
    : size * 0.65;

  const isPointLike = sourceMode === "point" || size === 0;

  setOutput(sourceSize, sourceSizeValue);
  setOutput(sourceObjectPosition, sourceObjectPositionValue);

  // 점광원 모드에서는 광원 크기 조절 항목 숨김
  if (sourceSizeRow) {
    sourceSizeRow.hidden = sourceMode === "point";
  }

  sourceObject.setAttribute("x", objectX - 9);

  // 광원 표시
  sourceEmitter.hidden = isPointLike;
  pointEmitter.hidden = !isPointLike;

  sourceEmitter.setAttribute("y", centerY - radius);
  sourceEmitter.setAttribute("height", Math.max(1, radius * 2));

  clear(sourceRays);
  clear(sourceShadow);

  const sourceTop = centerY - radius;
  const sourceBottom = centerY + radius;

  /* -------------------------
     점광원 또는 면광원 0%
  ------------------------- */

  if (isPointLike) {
    const upper = lineAtX(
      screenX,
      emitterX,
      centerY,
      objectX,
      objectTop
    );

    const lower = lineAtX(
      screenX,
      emitterX,
      centerY,
      objectX,
      objectBottom
    );

    addLine(sourceRays, emitterX, centerY, objectX, objectTop);
    addLine(sourceRays, emitterX, centerY, objectX, objectBottom);

    addLine(sourceRays, objectX, objectTop, screenX, upper);
    addLine(sourceRays, objectX, objectBottom, screenX, lower);

    addPolygon(sourceShadow, [
      { x: objectX, y: objectTop },
      { x: screenX, y: upper },
      { x: screenX, y: lower },
      { x: objectX, y: objectBottom }
    ], "#030812", 0.9);

    addText(
      sourceShadow,
      "그림자",
      (objectX + screenX) / 2,
      (upper + lower) / 2,
      "#dce7f5"
    );

    if (sourceMode === "point") {
      sourceStatus.textContent =
        "점광원 모형: 광원의 크기를 무시하고 하나의 점에서 빛이 출발한다고 가정합니다.";
    } else {
      sourceStatus.textContent =
        "광원 크기 0%: 면광원의 크기가 0이 되어 점광원과 같은 형태가 되었습니다. 반그림자가 사라집니다.";
    }

  } else {

    /* -------------------------
       크기가 있는 면광원
    ------------------------- */

    const rays = [
      { sy: sourceTop, oy: objectTop, name: "topInner" },
      { sy: sourceBottom, oy: objectBottom, name: "bottomInner" },
      { sy: sourceTop, oy: objectBottom, name: "topOuter" },
      { sy: sourceBottom, oy: objectTop, name: "bottomOuter" }
    ];

    const b = {};

    rays.forEach(ray => {
      b[ray.name] = lineAtX(
        screenX,
        emitterX,
        ray.sy,
        objectX,
        ray.oy
      );

      addLine(
        sourceRays,
        emitterX,
        ray.sy,
        objectX,
        ray.oy,
        "#ffd078",
        1.6
      );

      addLine(
        sourceRays,
        objectX,
        ray.oy,
        screenX,
        b[ray.name],
        "#ffd078",
        1.6
      );
    });

    const outerTop = Math.min(b.topOuter, b.bottomOuter);
    const outerBottom = Math.max(b.topOuter, b.bottomOuter);
    const innerTop = Math.min(b.topInner, b.bottomInner);
    const innerBottom = Math.max(b.topInner, b.bottomInner);

    // 위쪽 반그림자
    addPolygon(sourceShadow, [
      { x: objectX, y: objectTop },
      { x: screenX, y: outerTop },
      { x: screenX, y: innerTop },
      { x: objectX, y: objectTop }
    ], "#76a9dc", 0.25);

    // 본그림자
    addPolygon(sourceShadow, [
      { x: objectX, y: objectTop },
      { x: screenX, y: innerTop },
      { x: screenX, y: innerBottom },
      { x: objectX, y: objectBottom }
    ], "#030812", 0.88);

    // 아래쪽 반그림자
    addPolygon(sourceShadow, [
      { x: objectX, y: objectBottom },
      { x: screenX, y: innerBottom },
      { x: screenX, y: outerBottom },
      { x: objectX, y: objectBottom }
    ], "#76a9dc", 0.25);

    addText(
      sourceShadow,
      "반그림자",
      (objectX + screenX) / 2,
      clamp(outerTop + 15, 55, 300),
      "#91bce8"
    );

    addText(
      sourceShadow,
      "본그림자",
      (objectX + screenX) / 2,
      (innerTop + innerBottom) / 2,
      "#dce7f5"
    );

    sourceStatus.textContent =
      `면광원 모형: 광원 크기 ${size}% · 광원의 일부만 가려지는 영역에는 반그림자가 형성됩니다.`;
  }

  sourceRays.style.display = sourceShowRays.checked
    ? "block"
    : "none";
}

/* 광원 모드 버튼 */

$$("[data-source-mode]").forEach(button => {
  button.addEventListener("click", () => {
    sourceMode = button.dataset.sourceMode;

    $$("[data-source-mode]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    drawSourceExperiment();
  });
});

/* 광원 슬라이더 */

[sourceSize, sourceObjectPosition].forEach(input => {
  input?.addEventListener("input", drawSourceExperiment);
});

sourceShowRays?.addEventListener("change", drawSourceExperiment);

/* 광원 실험 초기화 */

$("#sourceReset")?.addEventListener("click", () => {
  sourceSize.value = 100;
  sourceObjectPosition.value = 45;
  sourceShowRays.checked = true;

  sourceMode = "extended";

  $$("[data-source-mode]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.sourceMode === "extended"
    );
  });

  drawSourceExperiment();
});

/* =========================================
   EXPERIMENT 02: SUNLIGHT / PARALLEL APPROX.
========================================= */

const objectPosition = $("#objectPosition");
const objectPositionValue = $("#objectPositionValue");
const pathSourceSize = $("#pathSourceSize");
const pathSourceSizeValue = $("#pathSourceSizeValue");
const showRays = $("#showRays");

const pathDescription = $("#pathDescription");
const pathRays = $("#pathRays");
const pathShadow = $("#pathShadow");
const pathOccluder = $("#pathOccluder");

let pathMode = "actual";

function drawPathExperiment() {
  if (!objectPosition || !pathSourceSize) return;

  const position = Number(objectPosition.value);
  const apparentSize = Number(pathSourceSize.value);

  const objectX = 235 + position * 2.7;
  const sourceX = 80;
  const screenX = 680;
  const centerY = 180;

  const objectTop = 150;
  const objectBottom = 210;

  const sourceRadius = 34 * apparentSize / 100;

  setOutput(objectPosition, objectPositionValue);
  setOutput(pathSourceSize, pathSourceSizeValue);

  pathOccluder.setAttribute("x", objectX - 9);

  clear(pathRays);
  clear(pathShadow);

  /* -------------------------
     평행광선 근사
  ------------------------- */

  if (pathMode === "parallel") {
    const top = objectTop;
    const bottom = objectBottom;

    [-1, 0, 1].forEach(offset => {
      const y = centerY + offset * 28;

      addLine(
        pathRays,
        sourceX + 42,
        y,
        screenX,
        y,
        "#72b8e8",
        1.8,
        "7 5"
      );
    });

    addPolygon(pathShadow, [
      { x: objectX, y: top },
      { x: screenX, y: top },
      { x: screenX, y: bottom },
      { x: objectX, y: bottom }
    ], "#030812", 0.9);

    addText(
      pathShadow,
      "그림자",
      (objectX + screenX) / 2,
      centerY + 5,
      "#dce7f5"
    );

    pathDescription.textContent =
      "평행광선 근사: 태양이 매우 멀리 있어 지구 부근의 광선 방향 차이를 무시한 모형입니다.";

  } else {

    /* -------------------------
       실제 태양광 모형
    ------------------------- */

    const topSource = centerY - sourceRadius;
    const bottomSource = centerY + sourceRadius;

    const edges = [
      { sy: topSource, oy: objectTop, key: "topInner" },
      { sy: bottomSource, oy: objectBottom, key: "bottomInner" },
      { sy: topSource, oy: objectBottom, key: "topOuter" },
      { sy: bottomSource, oy: objectTop, key: "bottomOuter" }
    ];

    const bounds = {};

    edges.forEach(edge => {
      bounds[edge.key] = lineAtX(
        screenX,
        sourceX,
        edge.sy,
        objectX,
        edge.oy
      );

      addLine(
        pathRays,
        sourceX,
        edge.sy,
        objectX,
        edge.oy
      );

      addLine(
        pathRays,
        objectX,
        edge.oy,
        screenX,
        bounds[edge.key]
      );
    });

    const outerTop = clamp(
      Math.min(bounds.topOuter, bounds.bottomOuter),
      35,
      325
    );

    const outerBottom = clamp(
      Math.max(bounds.topOuter, bounds.bottomOuter),
      35,
      325
    );

    const innerTop = clamp(
      Math.min(bounds.topInner, bounds.bottomInner),
      35,
      325
    );

    const innerBottom = clamp(
      Math.max(bounds.topInner, bounds.bottomInner),
      35,
      325
    );

    addPolygon(pathShadow, [
      { x: objectX, y: objectTop },
      { x: screenX, y: outerTop },
      { x: screenX, y: innerTop },
      { x: objectX, y: objectTop }
    ], "#76a9dc", 0.28);

    addPolygon(pathShadow, [
      { x: objectX, y: objectTop },
      { x: screenX, y: innerTop },
      { x: screenX, y: innerBottom },
      { x: objectX, y: objectBottom }
    ], "#030812", 0.9);

    addPolygon(pathShadow, [
      { x: objectX, y: objectBottom },
      { x: screenX, y: innerBottom },
      { x: screenX, y: outerBottom },
      { x: objectX, y: objectBottom }
    ], "#76a9dc", 0.28);

    addText(
      pathShadow,
      "반그림자",
      565,
      clamp(outerTop + 14, 55, 300),
      "#91bce8"
    );

    addText(
      pathShadow,
      "본그림자",
      565,
      clamp((innerTop + innerBottom) / 2, 55, 300),
      "#dce7f5"
    );

    pathDescription.textContent =
      `실제 태양광 모형: 태양의 겉보기 크기 ${apparentSize}% · 태양의 서로 다른 지점에서 출발한 광선은 완전히 평행하지 않습니다.`;
  }

  pathRays.style.display = showRays.checked
    ? "block"
    : "none";
}

/* 광선 모델 버튼 */

$$("[data-path-mode]").forEach(button => {
  button.addEventListener("click", () => {
    pathMode = button.dataset.pathMode;

    $$("[data-path-mode]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    drawPathExperiment();
  });
});

/* 태양광 슬라이더 */

[objectPosition, pathSourceSize].forEach(input => {
  input?.addEventListener("input", drawPathExperiment);
});

showRays?.addEventListener("change", drawPathExperiment);

/* 태양광 실험 초기화 */

$("#pathReset")?.addEventListener("click", () => {
  objectPosition.value = 45;
  pathSourceSize.value = 100;
  showRays.checked = true;

  pathMode = "actual";

  $$("[data-path-mode]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.pathMode === "actual"
    );
  });

  drawPathExperiment();
});

/* =========================================
   INITIALIZE
========================================= */

drawSourceExperiment();
drawPathExperiment();