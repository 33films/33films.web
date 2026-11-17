(function () {
  const FRAMES = [
    "Plano General",
    "Plano Americano",
    "Plano Medio",
    "Plano Medio Corto (PMC)",
    "Primer Plano",
    "Primerísimo Primer Plano",
    "Plano Detalle",
    "Plano Cenital",
    "Plano Picado",
    "Plano Contrapicado",
  ];

  const ANGLES = [
    "Normal / Eye Level",
    "Picado",
    "Cenital",
    "Contrapicado",
    "Nadir",
    "Dutch Angle",
    "Perfil",
    "Tres cuartos",
    "Espalda / Nuca",
    "Overhead",
  ];

  const MOVES = [
    "Fijo",
    "Paneo",
    "Pan",
    "Tilt",
    "Tilt Up",
    "Tilt Down",
    "Roll",
    "Dolly",
    "Dolly In",
    "Dolly Out",
    "Travelling",
    "Travelling / Tracking",
    "Travelling lateral",
    "Travelling circular / Arc Shot",
    "Orbital",
    "Orbit 360°",
    "Crane",
    "Crane Up",
    "Crane Down",
    "Jib Movement",
    "Handheld",
    "Steadicam",
    "Gimbal",
    "Drone Shot",
    "Whip Pan",
    "Zoom",
    "Zoom In",
    "Zoom Out",
    "Dolly Zoom",
    "Rack Focus",
    "Focus Pull",
    "Crash Zoom",
    "Snap Zoom",
    "Slow Push-in",
    "Slow Pull-out",
    "Reveal Shot",
    "Follow Shot",
    "Lead Shot",
    "Reverse Tracking",
    "Parallax Movement",
    "Dutch Roll",
    "Snorricam",
    "Bodycam",
    "POV Moving Shot",
    "Plano secuencia / One-Take",
    "Bullet Time",
  ];

  const LENSES = [
    "Ultra gran angular",
    "Gran angular",
    "Normal",
    "Teleobjetivo corto",
    "Teleobjetivo",
    "Macro",
    "Anamórfico",
    "Tilt-shift",
  ];

  const LENS_FLAGS = [
    "Bokeh",
    "Enfoque selectivo",
    "Foco infinito",
    "Cambio de distancia focal",
    "Respiración de foco (Focus Breathing)",
  ];

  const DEPTHS = ["Superficial", "Media", "Profunda"];

  const LIGHTING = [
    "Hard Light",
    "Soft Light",
    "Claroscuro",
    "Contraluz",
    "Rim Light",
    "Practical Lighting",
    "Key Light",
    "Fill Light",
    "Back Light",
    "Top Light",
    "Underlighting",
    "High Key",
    "Low Key",
    "Silhouette Lighting",
    "Motivated Lighting",
    "Volumetric Lighting",
    "Haze / Fog",
    "Color Contrast",
    "Efectos prácticos",
  ];

  const COMPOSITION = [
    "Regla de los tercios",
    "Composición simétrica",
    "Espacio negativo",
    "Frame within Frame",
    "Líneas de fuga",
    "Encuadre en profundidad",
    "Silueta",
    "Profundidad de campo",
    "Headroom",
    "Lead Room / Nose Room",
    "Look Room",
    "Dirty Frame",
    "Clean Frame",
    "Split Diopter",
    "Profundidad por capas",
    "Composición diagonal",
    "Composición triangular",
    "Composición radial",
    "Composición central",
    "Composición descentrada",
    "Oclusión parcial",
    "Reflejos y espejos",
  ];

  const AUDIO = [
    "Diálogo",
    "Voz en off (VO)",
    "Voz fuera de campo (OS)",
    "Sonido ambiente",
    "Room Tone",
    "Foley",
    "Sound Effects (SFX)",
    "Música incidental",
    "Música diegética",
    "Música extradiegética",
    "Silencio",
    "Reverberación",
    "Eco",
    "Sonido filtrado",
    "Distorsión sonora",
    "Subgrave",
    "Whoosh",
    "Impact",
    "Risers",
    "Stingers",
    "Sound Design subjetivo",
    "Sonido fuera de sincronía",
    "J-Cut",
    "L-Cut",
    "Sound Bridge",
  ];

  const PERFORMANCE = [
    "Dirección de mirada",
    "Movimiento corporal",
    "Expresión facial",
    "Gestualidad",
    "Desplazamiento",
    "Coreografía",
    "Interacción con objetos",
    "Entrada y salida de cuadro",
    "Movimiento de manos",
    "Cambio de postura",
    "Reacción emocional",
    "Pausas dramáticas",
    "Respiración",
    "Miradas fuera de campo",
    "Acciones simultáneas",
    "Movimiento de extras",
    "Movimiento de elementos ambientales",
  ];

  const VFX_SPEED = [
    "Slow Motion",
    "Speed Ramp",
    "Timelapse",
    "Freeze Frame",
    "Motion Blur",
    "Stutter Effect",
    "Reverse Motion",
    "Frame Blending",
    "Optical Flow",
    "Flicker Effect",
    "Jump Cut",
    "Match Cut",
    "Smash Cut",
    "Flash Frame",
    "Loop",
  ];

  const VFX_IMAGE = [
    "Lens Flare",
    "Light Leak",
    "Chromatic Aberration",
    "Vignette",
    "Distortion",
    "Fisheye",
    "Split Screen",
    "Double Exposure",
    "Ghosting",
    "Glitch",
    "RGB Split",
    "Film Grain",
    "Halation",
    "Bloom",
    "Defocus",
    "Blur",
    "Shutter Drag",
    "Light Painting",
  ];

  const TRANSITIONS = [
    "Corte directo",
    "Fundido a negro",
    "Fundido desde negro",
    "Dissolve",
    "Wipe",
    "Iris In / Iris Out",
    "Graphic Match",
    "Whip Transition",
    "Zoom Transition",
    "Luma Fade",
    "Morph Transition",
    "Glitch Transition",
    "Corte por movimiento",
    "Corte por mirada",
    "Corte por acción",
    "Corte por forma o color",
  ];

  const CATEGORIES = [
    { id: "frame", label: "Plano" },
    { id: "angle", label: "Ángulo" },
    { id: "movement", label: "Movimiento de cámara" },
    { id: "optics", label: "Óptica" },
    { id: "composition", label: "Composición" },
    { id: "lighting", label: "Iluminación" },
    { id: "action", label: "Acción" },
    { id: "performance", label: "Actuación" },
    { id: "duration", label: "Duración" },
    { id: "audio", label: "Audio" },
    { id: "vfx", label: "VFX" },
    { id: "transition", label: "Transición y montaje" },
    { id: "notes", label: "Observaciones" },
    { id: "custom", label: "+ Personalizado" },
  ];

  const CHECK_LISTS = {
    frame: FRAMES,
    angle: ANGLES,
    movement: MOVES,
    composition: COMPOSITION,
    lighting: LIGHTING,
    performance: PERFORMANCE,
    transition: TRANSITIONS,
  };

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function createBlock(type) {
    return {
      id: uid(),
      type,
      collapsed: false,
      values: [],
      flags: [],
      text: "",
      note: "",
      focal: "",
      aperture: "",
      focusDistance: "",
      dof: "",
      execution: "",
      name: "",
      category: "",
    };
  }

  function createShot() {
    return {
      id: uid(),
      image: "",
      frame: "Plano Medio",
      movement: "Fijo",
      action: "",
      audio: "",
      duration: "",
      notes: "",
      blocks: [],
    };
  }

  function createScene(index) {
    return {
      id: uid(),
      title: `ESCENA ${index}`,
      shots: [createShot()],
    };
  }

  function listWithCurrent(list, selected) {
    const extra = (selected || []).filter((item) => item && !list.includes(item));
    return extra.concat(list);
  }

  function absorbCoreBlocks(shot, blocks) {
    const extras = [];
    const seen = new Set();
    blocks.forEach((block) => {
      if (!["frame", "movement", "action", "duration", "audio", "notes"].includes(block.type) || seen.has(block.type)) {
        extras.push(block);
        return;
      }
      seen.add(block.type);
      if (block.type === "frame") {
        const value = block.values[0] || "";
        if (!shot.frame) shot.frame = value;
        else if (value && shot.frame !== value) extras.push(block);
      } else if (block.type === "movement") {
        const [primary, ...rest] = block.values;
        if (!shot.movement && primary) shot.movement = primary;
        if (rest.length) {
          const extra = createBlock("movement");
          extra.values = rest;
          extra.collapsed = block.collapsed;
          extra.note = block.note;
          extras.push(extra);
        } else if (primary && shot.movement && shot.movement !== primary) {
          extras.push(block);
        }
      } else if (block.type === "action") {
        if (!shot.action) shot.action = block.text || "";
        else if (block.text && shot.action !== block.text) extras.push(block);
      } else if (block.type === "duration") {
        if (!shot.duration) shot.duration = block.text || "";
        else if (block.text && shot.duration !== block.text) extras.push(block);
      } else if (block.type === "notes") {
        if (!shot.notes) shot.notes = block.text || "";
        else if (block.text && shot.notes !== block.text) extras.push(block);
      } else if (block.type === "audio") {
        const text = [block.values[0], block.note].filter(Boolean).join(" — ");
        if (!shot.audio) shot.audio = text;
        else if (text && shot.audio !== text) extras.push(block);
      }
    });
    return extras;
  }

  function ensureBlock(block) {
    const next = createBlock(block?.type || "notes");
    const source = block && typeof block === "object" ? block : {};
    next.id = source.id || next.id;
    next.type = typeof source.type === "string" && source.type ? source.type : "custom";
    next.collapsed = Boolean(source.collapsed);
    next.values = Array.isArray(source.values) ? source.values.filter(Boolean) : [];
    next.flags = Array.isArray(source.flags) ? source.flags.filter(Boolean) : [];
    next.text = String(source.text ?? "");
    next.note = String(source.note ?? "");
    next.focal = String(source.focal ?? "");
    next.aperture = String(source.aperture ?? "");
    next.focusDistance = String(source.focusDistance ?? "");
    next.dof = String(source.dof ?? "");
    next.execution = String(source.execution ?? "");
    next.name = String(source.name ?? "");
    next.category = String(source.category ?? "");
    return next;
  }

  function normalizeShot(shot) {
    const next = {
      id: shot?.id || uid(),
      image: typeof shot?.image === "string" ? shot.image : "",
      frame: String(shot?.frame ?? ""),
      movement: String(shot?.movement ?? ""),
      action: String(shot?.action ?? ""),
      audio: String(shot?.audio ?? ""),
      duration: String(shot?.duration ?? ""),
      notes: String(shot?.notes ?? ""),
      blocks: [],
    };
    next.blocks = absorbCoreBlocks(
      next,
      Array.isArray(shot?.blocks) ? shot.blocks.map(ensureBlock) : []
    );
    return next;
  }

  function normalizeDocument(document) {
    const scenes = Array.isArray(document?.scenes) ? document.scenes : [];
    return {
      scenes: scenes.map((scene, index) => ({
        id: scene?.id || uid(),
        title: String(scene?.title || `ESCENA ${index + 1}`),
        shots: Array.isArray(scene?.shots) ? scene.shots.map(normalizeShot) : [],
      })),
    };
  }

  function mirrorLegacy(shot) {
    return shot;
  }

  function reorderShot(document, shotId, targetSceneId, targetIndex) {
    let source = null;
    let shot = null;
    let from = -1;
    for (const scene of document?.scenes || []) {
      const index = scene.shots.findIndex((item) => item.id === shotId);
      if (index >= 0) {
        source = scene;
        from = index;
        shot = scene.shots[index];
        break;
      }
    }
    const target = (document?.scenes || []).find((scene) => scene.id === targetSceneId);
    if (!source || !shot || !target) return false;
    let index = Math.max(0, Math.min(targetIndex, target.shots.length));
    if (source === target && (index === from || index === from + 1)) return false;
    source.shots.splice(from, 1);
    if (source === target && from < index) index -= 1;
    target.shots.splice(Math.max(0, Math.min(index, target.shots.length)), 0, shot);
    return true;
  }

  const api = {
    FRAMES,
    ANGLES,
    MOVES,
    AUDIO,
    CATEGORIES,
    createBlock,
    createShot,
    createScene,
    normalizeDocument,
    mirrorLegacy,
    reorderShot,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;

  const root = typeof document !== "undefined" ? document.getElementById("storyboard-app") : null;
  if (!root) return;

  const projectId = root.dataset.projectId || "draft";
  const projectName = root.dataset.projectName || "33 FILMS";
  const storageKey = `33films-storyboard:${projectId}`;
  const state = normalizeDocument(load()) || { scenes: [] };
  if (!state.scenes.length) state.scenes = [createScene(1)];

  let openMenuShotId = null;
  let dirty = false;
  let remoteTimer = 0;
  let remoteEnabled = true;

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function persistLocal() {
    state.scenes.forEach((scene) => scene.shots.forEach(mirrorLegacy));
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function markStatus(text) {
    const node = root.querySelector("[data-save-status]");
    if (node) node.textContent = text;
  }

  function save() {
    dirty = true;
    persistLocal();
    markStatus("Guardado en este navegador");
    if (!remoteEnabled) return;
    clearTimeout(remoteTimer);
    remoteTimer = setTimeout(pushRemote, 700);
  }

  async function pullRemote() {
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/storyboard`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return { unavailable: true };
      const body = await response.json();
      if (body?.error === "schema") return { unavailable: true };
      return { document: body?.document ?? null };
    } catch {
      return { unavailable: true };
    }
  }

  async function pushRemote() {
    if (!remoteEnabled) return;
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/storyboard`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: state }),
      });
      if (response.status === 503) {
        remoteEnabled = false;
        return;
      }
      if (!response.ok) return;
      markStatus("Guardado");
    } catch {
      markStatus("Guardado en este navegador");
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function categoryLabel(type) {
    return CATEGORIES.find((item) => item.id === type)?.label || "Elemento";
  }

  function summary(block) {
    if (block.type === "custom") return block.name || "";
    if (block.type === "optics") {
      const bits = block.values.slice();
      if (block.focal) bits.push(`${block.focal} mm`);
      if (block.aperture) bits.push(block.aperture);
      if (block.dof) bits.push(block.dof);
      return bits.join(" · ") || "Óptica";
    }
    if (block.type === "audio") {
      return [block.values[0], block.note].filter(Boolean).join(" — ") || "Audio";
    }
    if (block.type === "vfx") {
      const bits = block.values.concat(block.flags);
      return bits.join(" · ") || "VFX";
    }
    if (block.values.length) return block.values.join(" · ");
    const text = (block.text || block.note || "").replace(/\s+/g, " ").trim();
    return text ? text.slice(0, 90) : categoryLabel(block.type);
  }

  function printValue(text) {
    return `<p class="sb-print-value">${escapeHtml(text || "")}</p>`;
  }

  function choice(editor, printed) {
    const value = String(printed || "").trim();
    return `<div class="sb-choice${value ? "" : " is-empty"}">${editor}${printValue(value)}</div>`;
  }

  function checks(block, key, list) {
    const selected = block[key] || [];
    return `<div class="sb-checks">${listWithCurrent(list, selected)
      .map(
        (item) => `<label class="sb-check">
          <input type="checkbox" data-block="${block.id}" data-key="${key}" data-value="${escapeHtml(item)}"${
            selected.includes(item) ? " checked" : ""
          } />
          <span>${escapeHtml(item)}</span>
        </label>`
      )
      .join("")}</div>`;
  }

  function noteField(block, key, label, placeholder) {
    const value = block[key] || "";
    return `<label class="sb-cell${String(value).trim() ? "" : " is-empty"}">
      <span class="sb-label">${label}</span>
      <textarea class="sb-area" data-block="${block.id}" data-key="${key}" rows="1" placeholder="${escapeHtml(
        placeholder
      )}">${escapeHtml(value)}</textarea>
      <div class="sb-print-copy">${escapeHtml(value)}</div>
    </label>`;
  }

  function textField(block, key, label, placeholder) {
    const value = block[key] || "";
    return `<label class="sb-cell${String(value).trim() ? "" : " is-empty"}">
      <span class="sb-label">${label}</span>
      <input class="sb-field" data-block="${block.id}" data-key="${key}" placeholder="${escapeHtml(
        placeholder
      )}" value="${escapeHtml(value)}" />
      ${printValue(String(value).trim())}
    </label>`;
  }

  function selectField(block, key, label, list, placeholder) {
    const current = key === "values" ? block.values[0] || "" : block[key] || "";
    const options = [`<option value="">${escapeHtml(placeholder)}</option>`]
      .concat(
        listWithCurrent(list, current ? [current] : []).map(
          (item) =>
            `<option value="${escapeHtml(item)}"${item === current ? " selected" : ""}>${escapeHtml(item)}</option>`
        )
      )
      .join("");
    return choice(
      `<label class="sb-cell">
      <span class="sb-label">${label}</span>
      <select class="sb-select" data-block="${block.id}" data-key="${key}">${options}</select>
    </label>`,
      current
    );
  }

  function renderBlockBody(block) {
    if (CHECK_LISTS[block.type]) {
      const extra =
        block.type === "lighting"
          ? noteField(block, "note", "Observaciones de luz", "Dirección, intensidad, temperatura, color")
          : block.type === "transition"
            ? noteField(block, "note", "Indicaciones de montaje", "Cómo conecta con el plano siguiente")
            : noteField(block, "note", "Nota", "Detalle opcional");
      return `${choice(checks(block, "values", CHECK_LISTS[block.type]), (block.values || []).join(" · "))}${extra}`;
    }
    if (block.type === "optics") {
      return `${choice(checks(block, "values", LENSES), block.values.join(" · "))}
        <div class="sb-inline">
          ${textField(block, "focal", "Distancia focal", "50")}
          ${textField(block, "aperture", "Apertura", "T2")}
          ${textField(block, "focusDistance", "Distancia de enfoque", "1.4 m")}
        </div>
        ${selectField(block, "dof", "Profundidad de campo", DEPTHS, "Seleccionar")}
        ${choice(`<p class="sb-group">Características</p>${checks(block, "flags", LENS_FLAGS)}`, block.flags.join(" · "))}`;
    }
    if (block.type === "audio") {
      return `${selectField(block, "values", "Elemento", AUDIO, "Seleccionar")}
        ${noteField(block, "note", "Descripción", "Cómo suena este elemento")}`;
    }
    if (block.type === "vfx") {
      const imageFlags = block.flags.filter((item) => VFX_IMAGE.includes(item));
      const transitionFlags = block.flags.filter((item) => TRANSITIONS.includes(item));
      return `${choice(`<p class="sb-group">Velocidad y tiempo</p>${checks(block, "values", VFX_SPEED)}`, block.values.join(" · "))}
        ${choice(`<p class="sb-group">Efectos ópticos y de imagen</p>${checks(block, "flags", VFX_IMAGE)}`, imageFlags.join(" · "))}
        ${choice(`<p class="sb-group">Transiciones</p>${checks(block, "flags", TRANSITIONS)}`, transitionFlags.join(" · "))}
        ${selectField(block, "execution", "Realización", ["Rodaje", "Postproducción"], "Rodaje o postproducción")}
        ${noteField(block, "note", "Descripción del efecto", "Cómo debe ejecutarse")}`;
    }
    if (block.type === "action") return noteField(block, "text", "Acción", "Qué sucede");
    if (block.type === "duration") return textField(block, "text", "Duración", "6 segundos");
    if (block.type === "notes") return noteField(block, "text", "Observaciones", "Notas del plano");
    return noteField(block, "text", "Descripción", "Descripción");
  }

  function blockTools() {
    return `<div class="sb-block-tools">
          <button type="button" class="sb-icon" data-action="move-block" data-dir="-1" aria-label="Subir">↑</button>
          <button type="button" class="sb-icon" data-action="move-block" data-dir="1" aria-label="Bajar">↓</button>
          <button type="button" class="sb-icon" data-action="duplicate-block" aria-label="Duplicar">Dup</button>
          <button type="button" class="sb-icon" data-action="remove-block" aria-label="Eliminar">×</button>
        </div>`;
  }

  function renderBlock(block) {
    if (block.type === "custom") {
      return `<article class="sb-block sb-block-custom${block.collapsed ? " is-collapsed" : ""}" data-block-id="${block.id}">
      <div class="sb-block-head">
        <input class="sb-custom-title" data-block="${block.id}" data-key="name" placeholder="Nombre del campo" value="${escapeHtml(block.name)}" />
        <p class="sb-print-value sb-print-title">${escapeHtml(block.name.trim())}</p>
        <button type="button" class="sb-icon" data-action="toggle-block" aria-label="Contraer">▾</button>
        ${blockTools()}
      </div>
      <div class="sb-block-body">
        ${textField(block, "category", "Categoría", "Categoría")}
        ${noteField(block, "text", "Descripción", "Descripción")}
        ${noteField(block, "note", "Observaciones", "Observaciones")}
      </div>
    </article>`;
    }
    return `<article class="sb-block${block.collapsed ? " is-collapsed" : ""}" data-block-id="${block.id}">
      <div class="sb-block-head">
        <button type="button" class="sb-block-toggle" data-action="toggle-block">
          <span class="sb-label">${escapeHtml(categoryLabel(block.type))}</span>
          <span class="sb-block-summary">${escapeHtml(summary(block))}</span>
        </button>
        <div class="sb-block-tools">
          <button type="button" class="sb-icon" data-action="move-block" data-dir="-1" aria-label="Subir">↑</button>
          <button type="button" class="sb-icon" data-action="move-block" data-dir="1" aria-label="Bajar">↓</button>
          <button type="button" class="sb-icon" data-action="duplicate-block" aria-label="Duplicar">Dup</button>
          <button type="button" class="sb-icon" data-action="remove-block" aria-label="Eliminar">×</button>
        </div>
      </div>
      <div class="sb-block-body">${renderBlockBody(block)}</div>
    </article>`;
  }

  function renderAdder(shot) {
    const open = openMenuShotId === shot.id;
    return `<div class="sb-adder">
      <button type="button" class="sb-btn" data-action="toggle-adder">+ Agregar elemento</button>
      ${
        open
          ? `<div class="sb-menu">${CATEGORIES.map(
              (item) =>
                `<button type="button" data-action="add-block" data-type="${item.id}">${escapeHtml(item.label)}</button>`
            ).join("")}</div>`
          : ""
      }
    </div>`;
  }

  function render() {
    root.innerHTML = `
      <div class="sb-shell">
        <header class="sb-top">
          <div>
            <p class="sb-kicker">33 FILMS · ${escapeHtml(projectName)}</p>
            <h1 class="sb-title">STORYBOARD</h1>
          </div>
          <div class="sb-actions">
            <p class="sb-status" data-save-status></p>
            <button type="button" class="sb-btn" data-action="add-scene">Agregar Escena</button>
            <button type="button" class="sb-btn ghost" data-action="export">Exportar JSON</button>
            <button type="button" class="sb-btn ghost" data-action="print">Imprimir</button>
          </div>
        </header>
        <div class="sb-scenes">
          ${state.scenes.map(renderScene).join("") || `<p class="sb-empty">No hay escenas. Agregá la primera.</p>`}
        </div>
      </div>
    `;
    fitAreas();
    syncPrintView();
  }

  function renderScene(scene) {
    return `
      <section class="sb-scene" data-scene="${scene.id}">
        <div class="sb-scene-head">
          <input class="sb-scene-title" data-field="title" value="${escapeHtml(scene.title)}" />
          <div class="sb-actions">
            <button type="button" class="sb-btn ghost" data-action="add-shot">Agregar Toma</button>
            <button type="button" class="sb-btn danger" data-action="remove-scene">Eliminar escena</button>
          </div>
        </div>
        <div class="sb-shots">
          ${
            scene.shots.length
              ? scene.shots.map((shot, shotIndex) => renderShot(shot, shotIndex)).join("")
              : `<p class="sb-empty">Sin tomas en esta escena.</p>`
          }
        </div>
      </section>
    `;
  }

  function options(list, selected) {
    return listWithCurrent(list, selected ? [selected] : [])
      .map(
        (item) =>
          `<option value="${escapeHtml(item)}"${item === selected ? " selected" : ""}>${escapeHtml(item)}</option>`
      )
      .join("");
  }

  function fitArea(area) {
    if (!area || area.tagName !== "TEXTAREA") return;
    if (area.getClientRects().length === 0) return;
    area.style.height = "0px";
    area.style.height = `${area.scrollHeight}px`;
  }

  function fitAreas() {
    root.querySelectorAll("textarea.sb-area").forEach(fitArea);
  }

  function syncPrintView() {
    root.querySelectorAll("textarea.sb-area").forEach((area) => {
      const copy = area.parentElement?.querySelector(".sb-print-copy");
      if (copy) copy.textContent = area.value;
      area.closest(".sb-cell")?.classList.toggle("is-empty", !area.value.trim());
      fitArea(area);
    });
    root.querySelectorAll("input.sb-field").forEach((field) => {
      const cell = field.closest(".sb-cell");
      const copy = cell?.querySelector(".sb-print-value");
      if (copy) copy.textContent = field.value.trim();
      cell?.classList.toggle("is-empty", !field.value.trim());
    });
    root.querySelectorAll("select.sb-select").forEach((select) => {
      const choice = select.closest(".sb-choice");
      const copy = choice?.querySelector(":scope > .sb-print-value");
      const text = select.value ? select.selectedOptions[0]?.textContent || "" : "";
      if (copy) copy.textContent = text.trim();
      choice?.classList.toggle("is-empty", !text.trim());
    });
    root.querySelectorAll(".sb-checks").forEach((box) => {
      const choice = box.closest(".sb-choice");
      const copy = choice?.querySelector(":scope > .sb-print-value");
      const names = [...box.querySelectorAll("input:checked")].map((input) => input.dataset.value || "");
      if (copy) copy.textContent = names.filter(Boolean).join(" · ");
      choice?.classList.toggle("is-empty", names.filter(Boolean).length === 0);
    });
    root.querySelectorAll(".sb-custom-title").forEach((field) => {
      const title = field.parentElement?.querySelector(".sb-print-title");
      if (title) title.textContent = field.value.trim();
    });
  }

  function syncControl(el) {
    if (!el) return;
    if (el.tagName === "TEXTAREA") {
      const copy = el.parentElement?.querySelector(".sb-print-copy");
      if (copy) copy.textContent = el.value;
      el.closest(".sb-cell")?.classList.toggle("is-empty", !el.value.trim());
      fitArea(el);
      return;
    }
    if (el.classList.contains("sb-custom-title")) {
      const title = el.parentElement?.querySelector(".sb-print-title");
      if (title) title.textContent = el.value.trim();
      return;
    }
    if (el.classList.contains("sb-field")) {
      const cell = el.closest(".sb-cell");
      const copy = cell?.querySelector(".sb-print-value");
      if (copy) copy.textContent = el.value.trim();
      cell?.classList.toggle("is-empty", !el.value.trim());
      return;
    }
    if (el.tagName === "SELECT") {
      const choice = el.closest(".sb-choice");
      const copy = choice?.querySelector(":scope > .sb-print-value");
      const text = el.value ? el.selectedOptions[0]?.textContent || "" : "";
      if (copy) copy.textContent = text.trim();
      choice?.classList.toggle("is-empty", !text.trim());
      return;
    }
    if (el.type === "checkbox") {
      const box = el.closest(".sb-checks");
      const choice = el.closest(".sb-choice");
      const names = [...(box?.querySelectorAll("input:checked") || [])].map((input) => input.dataset.value || "");
      const copy = choice?.querySelector(":scope > .sb-print-value");
      if (copy) copy.textContent = names.filter(Boolean).join(" · ");
      choice?.classList.toggle("is-empty", names.filter(Boolean).length === 0);
    }
  }

  function renderShot(shot, shotIndex) {
    return `
      <article class="sb-shot" data-shot="${shot.id}">
        <label class="sb-image${shot.image ? " has-image" : ""}">
          ${
            shot.image
              ? `<img src="${shot.image}" alt="Toma ${shotIndex + 1}" />`
              : `<span>+ Agregar imagen</span>`
          }
          <input type="file" accept="image/*" data-field="image" />
        </label>
        <div class="sb-shot-meta">
          <div class="sb-shot-id">
            <button type="button" class="sb-shot-handle" aria-label="Arrastrar toma" title="Arrastrar para ordenar">⋮⋮</button>
            <div class="sb-shot-num">Toma ${shotIndex + 1}</div>
          </div>
          <button type="button" class="sb-btn danger" data-action="remove-shot">Eliminar</button>
        </div>
        <label class="sb-cell sb-cell-frame sb-choice">
          <span class="sb-label">Encuadre / Plano</span>
          <select class="sb-select" data-field="frame">${options(FRAMES, shot.frame)}</select>
          ${printValue(shot.frame)}
        </label>
        <label class="sb-cell sb-cell-move sb-choice">
          <span class="sb-label">Movimiento de cámara</span>
          <select class="sb-select" data-field="movement">${options(MOVES, shot.movement)}</select>
          ${printValue(shot.movement)}
        </label>
        <label class="sb-cell sb-cell-duration${String(shot.duration).trim() ? "" : " is-empty"}">
          <span class="sb-label">Duración</span>
          <input class="sb-field" data-field="duration" placeholder="00:04" value="${escapeHtml(shot.duration)}" />
          ${printValue(String(shot.duration).trim())}
        </label>
        <label class="sb-cell sb-cell-action${String(shot.action).trim() ? "" : " is-empty"}">
          <span class="sb-label">Acción</span>
          <textarea class="sb-area" data-field="action" placeholder="Qué sucede" rows="1">${escapeHtml(shot.action)}</textarea>
          <div class="sb-print-copy">${escapeHtml(shot.action)}</div>
        </label>
        <label class="sb-cell sb-cell-audio${String(shot.audio).trim() ? "" : " is-empty"}">
          <span class="sb-label">Audio / Diálogo</span>
          <textarea class="sb-area" data-field="audio" placeholder="Diálogo / FX" rows="1">${escapeHtml(shot.audio)}</textarea>
          <div class="sb-print-copy">${escapeHtml(shot.audio)}</div>
        </label>
        <label class="sb-cell sb-cell-notes${String(shot.notes).trim() ? "" : " is-empty"}">
          <span class="sb-label">Notas</span>
          <textarea class="sb-area" data-field="notes" placeholder="Notas" rows="1">${escapeHtml(shot.notes)}</textarea>
          <div class="sb-print-copy">${escapeHtml(shot.notes)}</div>
        </label>
        <div class="sb-blocks">
          ${shot.blocks.map(renderBlock).join("")}
          ${renderAdder(shot)}
        </div>
      </article>
    `;
  }

  function sceneFromEl(el) {
    const section = el.closest("[data-scene]");
    return state.scenes.find((scene) => scene.id === section?.dataset.scene);
  }

  function shotFromEl(el) {
    const scene = sceneFromEl(el);
    const row = el.closest("[data-shot]");
    return scene?.shots.find((shot) => shot.id === row?.dataset.shot);
  }

  function blockFromEl(el) {
    const shot = shotFromEl(el);
    const id = el.dataset.block || el.closest("[data-block-id]")?.dataset.blockId;
    return shot?.blocks.find((block) => block.id === id);
  }

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("invalid"));
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const max = 720;
        const scale = Math.min(1, max / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image"));
      };
      img.src = url;
    });
  }

  function applyControl(el, fromChange) {
    const block = blockFromEl(el);
    const key = el.dataset.key;
    if (!block || !key) return false;
    if ((el.type === "checkbox" || el.tagName === "SELECT") && !fromChange) return false;
    if (el.type === "checkbox") {
      const value = el.dataset.value;
      const list = Array.isArray(block[key]) ? block[key].slice() : [];
      block[key] = el.checked ? list.concat(value) : list.filter((item) => item !== value);
    } else if (el.tagName === "SELECT" && key === "values") {
      block.values = el.value ? [el.value] : [];
    } else {
      block[key] = el.value;
    }
    const card = el.closest("[data-block-id]");
    const sum = card?.querySelector(".sb-block-summary");
    if (sum) sum.textContent = summary(block);
    save();
    return true;
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) {
      if (
        openMenuShotId &&
        !event.target.closest(".sb-adder") &&
        !event.target.closest("input, textarea, select, label")
      ) {
        openMenuShotId = null;
        render();
      }
      return;
    }
    const action = button.dataset.action;

    if (action === "add-scene") {
      state.scenes.push(createScene(state.scenes.length + 1));
    } else if (action === "remove-scene") {
      const scene = sceneFromEl(button);
      if (!scene) return;
      if (!confirm(`¿Eliminar ${scene.title}?`)) return;
      state.scenes = state.scenes.filter((item) => item.id !== scene.id);
    } else if (action === "add-shot") {
      const scene = sceneFromEl(button);
      if (!scene) return;
      scene.shots.push(createShot());
    } else if (action === "remove-shot") {
      const scene = sceneFromEl(button);
      const shot = shotFromEl(button);
      if (!scene || !shot) return;
      scene.shots = scene.shots.filter((item) => item.id !== shot.id);
    } else if (action === "toggle-adder") {
      const shot = shotFromEl(button);
      if (!shot) return;
      openMenuShotId = openMenuShotId === shot.id ? null : shot.id;
    } else if (action === "add-block") {
      const shot = shotFromEl(button);
      const type = button.dataset.type;
      if (!shot || !CATEGORIES.some((item) => item.id === type)) return;
      shot.blocks.push(createBlock(type));
      openMenuShotId = null;
    } else if (action === "remove-block") {
      const shot = shotFromEl(button);
      const block = blockFromEl(button);
      if (!shot || !block) return;
      shot.blocks = shot.blocks.filter((item) => item.id !== block.id);
    } else if (action === "duplicate-block") {
      const shot = shotFromEl(button);
      const block = blockFromEl(button);
      if (!shot || !block) return;
      const copy = ensureBlock(JSON.parse(JSON.stringify(block)));
      copy.id = uid();
      const index = shot.blocks.findIndex((item) => item.id === block.id);
      shot.blocks.splice(index + 1, 0, copy);
    } else if (action === "move-block") {
      const shot = shotFromEl(button);
      const block = blockFromEl(button);
      if (!shot || !block) return;
      const index = shot.blocks.findIndex((item) => item.id === block.id);
      const next = index + Number(button.dataset.dir || 0);
      if (next < 0 || next >= shot.blocks.length) return;
      const [item] = shot.blocks.splice(index, 1);
      shot.blocks.splice(next, 0, item);
    } else if (action === "toggle-block") {
      const block = blockFromEl(button);
      if (!block) return;
      block.collapsed = !block.collapsed;
    } else if (action === "export") {
      state.scenes.forEach((scene) => scene.shots.forEach(mirrorLegacy));
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `storyboard-${projectId}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    } else if (action === "print") {
      window.print();
      return;
    } else {
      return;
    }

    if (action !== "toggle-adder") save();
    render();
  });

  root.addEventListener("input", (event) => {
    const field = event.target.dataset.field;
    if (field === "title") {
      const scene = sceneFromEl(event.target);
      if (scene) scene.title = event.target.value;
      save();
      return;
    }
    if (field && field !== "image") {
      const shot = shotFromEl(event.target);
      if (shot && Object.prototype.hasOwnProperty.call(shot, field) && field !== "blocks") {
        shot[field] = event.target.value;
        syncControl(event.target);
        save();
        return;
      }
    }
    if (applyControl(event.target)) syncControl(event.target);
  });

  root.addEventListener("change", async (event) => {
    if (event.target.dataset.field === "image") {
      const shot = shotFromEl(event.target);
      const file = event.target.files?.[0];
      if (!shot || !file) return;
      try {
        shot.image = await fileToImage(file);
        save();
        render();
      } catch {
        alert("No se pudo cargar la imagen.");
      }
      return;
    }
    applyControl(event.target, true);
    syncControl(event.target);
  });

  window.addEventListener("resize", fitAreas);
  window.addEventListener("beforeprint", () => {
    syncPrintView();
    fitAreas();
  });

  let dragShot = null;

  function clearShotDrop() {
    root.querySelectorAll(".sb-shot.is-drop-before, .sb-shot.is-drop-after, .sb-shot.is-dragging").forEach((node) => {
      node.classList.remove("is-drop-before", "is-drop-after", "is-dragging");
    });
  }

  function shotRowAt(x, y) {
    const nodes = document.elementsFromPoint(x, y);
    for (const node of nodes) {
      const row = node.closest?.(".sb-shot");
      if (row && !row.classList.contains("is-dragging")) return row;
    }
    return null;
  }

  root.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".sb-shot-handle");
    if (!handle || event.button !== 0) return;
    const row = handle.closest("[data-shot]");
    const scene = sceneFromEl(handle);
    const shot = shotFromEl(handle);
    if (!row || !scene || !shot) return;
    dragShot = { id: shot.id, sceneId: scene.id, pointerId: event.pointerId, moved: false, x: event.clientX, y: event.clientY };
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      /* The drag still follows pointer events when capture is unavailable. */
    }
    event.preventDefault();
  });

  root.addEventListener("pointermove", (event) => {
    if (!dragShot || event.pointerId !== dragShot.pointerId) return;
    if (!dragShot.moved) {
      const distance = Math.hypot(event.clientX - dragShot.x, event.clientY - dragShot.y);
      if (distance < 4) return;
      dragShot.moved = true;
      root.querySelector(`[data-shot="${dragShot.id}"]`)?.classList.add("is-dragging");
    }
    clearShotDrop();
    root.querySelector(`[data-shot="${dragShot.id}"]`)?.classList.add("is-dragging");
    const row = shotRowAt(event.clientX, event.clientY);
    if (!row) return;
    const rect = row.getBoundingClientRect();
    row.classList.add(event.clientY > rect.top + rect.height / 2 ? "is-drop-after" : "is-drop-before");
  });

  function finishShotDrag(event) {
    if (!dragShot || event.pointerId !== dragShot.pointerId) return;
    const active = dragShot;
    const row = active.moved ? shotRowAt(event.clientX, event.clientY) : null;
    dragShot = null;
    clearShotDrop();
    if (!row) return;
    const targetScene = sceneFromEl(row);
    if (!targetScene) return;
    const rect = row.getBoundingClientRect();
    let index = targetScene.shots.findIndex((shot) => shot.id === row.dataset.shot);
    if (event.clientY > rect.top + rect.height / 2) index += 1;
    if (!reorderShot(state, active.id, targetScene.id, index)) return;
    save();
    render();
  }

  root.addEventListener("pointerup", finishShotDrag);
  root.addEventListener("pointercancel", (event) => {
    if (!dragShot || event.pointerId !== dragShot.pointerId) return;
    dragShot = null;
    clearShotDrop();
  });

  root.addEventListener("dragover", (event) => {
    const zone = event.target.closest(".sb-image");
    if (!zone || ![...event.dataTransfer.types].includes("Files")) return;
    event.preventDefault();
    zone.classList.add("is-over");
  });

  root.addEventListener("dragleave", (event) => {
    const zone = event.target.closest(".sb-image");
    if (zone) zone.classList.remove("is-over");
  });

  root.addEventListener("drop", async (event) => {
    const zone = event.target.closest(".sb-image");
    if (!zone) return;
    event.preventDefault();
    zone.classList.remove("is-over");
    const shot = shotFromEl(zone);
    const file = event.dataTransfer?.files?.[0];
    if (!shot || !file) return;
    try {
      shot.image = await fileToImage(file);
      save();
      render();
    } catch {
      alert("No se pudo cargar la imagen.");
    }
  });

  render();

  pullRemote().then((remote) => {
    if (remote.unavailable) {
      remoteEnabled = false;
      return;
    }
    if (remote.document?.scenes && !dirty) {
      const next = normalizeDocument(remote.document);
      if (next.scenes.length) {
        state.scenes = next.scenes;
        persistLocal();
        render();
      }
      return;
    }
    if (!remote.document && state.scenes.length) pushRemote();
  });
})();
