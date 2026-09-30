(function () {
  const FRAMES = [
    "Plano General",
    "Plano Americano",
    "Plano Medio",
    "Primer Plano",
    "Primerísimo Primer Plano",
    "Plano Detalle",
    "Plano Cenital",
    "Plano Picado",
    "Plano Contrapicado",
  ];

  const MOVES = [
    "Fijo",
    "Paneo",
    "Tilt",
    "Travelling",
    "Dolly",
    "Steadicam",
    "Handheld",
    "Zoom",
    "Crane",
    "Orbital",
  ];

  const root = document.getElementById("storyboard-app");
  if (!root) return;

  const projectId = root.dataset.projectId || "draft";
  const projectName = root.dataset.projectName || "33 FILMS";
  const storageKey = `33films-storyboard:${projectId}`;

  const state = load() || { scenes: [createScene(1)] };

  function uid() {
    return Math.random().toString(36).slice(2, 10);
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
    };
  }

  function createScene(index) {
    return {
      id: uid(),
      title: `ESCENA ${index}`,
      shots: [createShot()],
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
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

  function options(list, selected) {
    return list
      .map(
        (item) =>
          `<option value="${escapeHtml(item)}"${item === selected ? " selected" : ""}>${escapeHtml(item)}</option>`
      )
      .join("");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
  }

  function renderScene(scene, sceneIndex) {
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
          <div class="sb-shot-num">Toma ${shotIndex + 1}</div>
          <button type="button" class="sb-btn danger" data-action="remove-shot">Eliminar</button>
        </div>
        <label class="sb-cell sb-cell-frame">
          <span class="sb-label">Encuadre / Plano</span>
          <select class="sb-select" data-field="frame">${options(FRAMES, shot.frame)}</select>
        </label>
        <label class="sb-cell sb-cell-move">
          <span class="sb-label">Movimiento de cámara</span>
          <select class="sb-select" data-field="movement">${options(MOVES, shot.movement)}</select>
        </label>
        <label class="sb-cell sb-cell-duration">
          <span class="sb-label">Duración</span>
          <input class="sb-field" data-field="duration" placeholder="00:04" value="${escapeHtml(shot.duration)}" />
        </label>
        <label class="sb-cell sb-cell-action">
          <span class="sb-label">Acción</span>
          <textarea class="sb-area" data-field="action" placeholder="Qué sucede" rows="3">${escapeHtml(shot.action)}</textarea>
        </label>
        <label class="sb-cell sb-cell-audio">
          <span class="sb-label">Audio / Diálogo</span>
          <textarea class="sb-area" data-field="audio" placeholder="Diálogo / FX" rows="3">${escapeHtml(shot.audio)}</textarea>
        </label>
        <label class="sb-cell sb-cell-notes">
          <span class="sb-label">Notas</span>
          <textarea class="sb-area" data-field="notes" placeholder="Notas" rows="3">${escapeHtml(shot.notes)}</textarea>
        </label>
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

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
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
    } else if (action === "export") {
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

    save();
    render();
  });

  root.addEventListener("input", (event) => {
    const field = event.target.dataset.field;
    if (!field || field === "image") return;

    if (field === "title") {
      const scene = sceneFromEl(event.target);
      if (scene) scene.title = event.target.value;
      save();
      return;
    }

    const shot = shotFromEl(event.target);
    if (!shot) return;
    shot[field] = event.target.value;
    save();
  });

  root.addEventListener("change", async (event) => {
    if (event.target.dataset.field !== "image") return;
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
  });

  root.addEventListener("dragover", (event) => {
    const zone = event.target.closest(".sb-image");
    if (!zone) return;
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
})();
