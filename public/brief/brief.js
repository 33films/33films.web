(function () {
  const root = document.getElementById("brief-app");
  if (!root) return;

  const projectId = root.dataset.projectId || "draft";
  const projectName = root.dataset.projectName || "33 FILMS";
  const storageKey = `33films-brief:${projectId}`;

  let saveTimer = null;
  let statusTimer = null;
  let editor = null;
  let statusEl = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function template() {
    return `
      <h1>${escapeHtml(projectName)}</h1>
      <h2>Sinopsis / Concepto</h2>
      <p>Describí la idea central del proyecto en pocas líneas.</p>
      <h2>Objetivo / Público objetivo</h2>
      <p>Qué buscamos lograr y a quién le hablamos.</p>
      <h2>Tono y referencias visuales</h2>
      <ul>
        <li>Tono general</li>
        <li>Referencias de color, luz y cámara</li>
      </ul>
      <h2>Locaciones</h2>
      <ul>
        <li>Locación 1</li>
      </ul>
      <h2>Equipo técnico necesario</h2>
      <ul>
        <li>Dirección</li>
        <li>Cámara y óptica</li>
        <li>Luces y grip</li>
        <li>Sonido</li>
      </ul>
      <h2>Cronograma estimado</h2>
      <ol>
        <li>Preproducción</li>
        <li>Rodaje</li>
        <li>Postproducción</li>
        <li>Entrega</li>
      </ol>
      <h2>Presupuesto (opcional)</h2>
      <p>Rango estimado o notas de presupuesto.</p>
    `.trim();
  }

  function loadDoc() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed?.html === "string" ? parsed.html : null;
    } catch {
      return null;
    }
  }

  function timeLabel() {
    return new Date().toLocaleTimeString("es-UY", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function setStatus(text, isError) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function saveNow() {
    if (!editor) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ html: editor.innerHTML, updatedAt: new Date().toISOString() })
      );
      setStatus(`Guardado ${timeLabel()}`, false);
    } catch {
      setStatus("No se pudo guardar: documento muy pesado", true);
    }
  }

  function scheduleSave() {
    setStatus("Guardando…", false);
    clearTimeout(saveTimer);
    clearTimeout(statusTimer);
    saveTimer = setTimeout(saveNow, 600);
  }

  function exec(command, value) {
    document.execCommand(command, false, value ?? null);
    editor.focus();
    scheduleSave();
    syncToolbar();
  }

  function selectionInEditor() {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return false;
    return editor.contains(selection.anchorNode);
  }

  function currentBlock() {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return "";
    let node = selection.anchorNode;
    if (node.nodeType === 3) node = node.parentNode;
    while (node && node !== editor) {
      const tag = node.nodeName.toLowerCase();
      if (["h1", "h2", "h3", "p", "li", "blockquote"].includes(tag)) return tag;
      node = node.parentNode;
    }
    return "";
  }

  function syncToolbar() {
    if (!editor || !selectionInEditor()) return;
    const block = currentBlock();
    root.querySelectorAll("[data-cmd]").forEach((button) => {
      const command = button.dataset.cmd;
      let active = false;
      try {
        if (command === "formatBlock") {
          active = block === (button.dataset.value || "").toLowerCase();
        } else if (["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList"].includes(command)) {
          active = document.queryCommandState(command);
        }
      } catch {
        active = false;
      }
      button.classList.toggle("is-active", active);
    });
  }

  function pickImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        const dataUrl = await fileToImage(file);
        editor.focus();
        exec("insertImage", dataUrl);
      } catch {
        alert("No se pudo cargar la imagen.");
      }
    });
    input.click();
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
        const max = 1000;
        const scale = Math.min(1, max / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image"));
      };
      img.src = url;
    });
  }

  function inlineToMarkdown(node) {
    if (node.nodeType === 3) return node.textContent.replace(/\s+/g, " ");
    if (node.nodeType !== 1) return "";
    const inner = Array.from(node.childNodes).map(inlineToMarkdown).join("");
    switch (node.nodeName.toLowerCase()) {
      case "strong":
      case "b":
        return inner.trim() ? `**${inner}**` : "";
      case "em":
      case "i":
        return inner.trim() ? `*${inner}*` : "";
      case "u":
        return inner.trim() ? `<u>${inner}</u>` : "";
      case "a":
        return `[${inner}](${node.getAttribute("href") || ""})`;
      case "br":
        return "\n";
      case "img":
        return `![imagen](${node.getAttribute("src") || ""})`;
      default:
        return inner;
    }
  }

  function blockToMarkdown(node, depth) {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      return text ? `${text}\n\n` : "";
    }
    if (node.nodeType !== 1) return "";
    const tag = node.nodeName.toLowerCase();
    const inline = inlineToMarkdown(node).trim();

    if (tag === "h1") return `# ${inline}\n\n`;
    if (tag === "h2") return `## ${inline}\n\n`;
    if (tag === "h3") return `### ${inline}\n\n`;
    if (tag === "blockquote") return `> ${inline}\n\n`;
    if (tag === "img") return `![imagen](${node.getAttribute("src") || ""})\n\n`;
    if (tag === "hr") return `---\n\n`;

    if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.children).filter((el) => el.nodeName.toLowerCase() === "li");
      const pad = "  ".repeat(depth);
      const lines = items.map((li, index) => {
        const nested = Array.from(li.children)
          .filter((el) => ["ul", "ol"].includes(el.nodeName.toLowerCase()))
          .map((el) => blockToMarkdown(el, depth + 1))
          .join("");
        const clone = li.cloneNode(true);
        Array.from(clone.children)
          .filter((el) => ["ul", "ol"].includes(el.nodeName.toLowerCase()))
          .forEach((el) => el.remove());
        const bullet = tag === "ul" ? "-" : `${index + 1}.`;
        return `${pad}${bullet} ${inlineToMarkdown(clone).trim()}\n${nested}`;
      });
      return `${lines.join("")}\n`;
    }

    if (node.matches?.("[data-pinboard]")) {
      const title = node.querySelector("[data-pinboard-title]")?.textContent?.trim() || "Pinboard";
      const imgs = Array.from(node.querySelectorAll("[data-pinboard-tile] img"));
      if (!imgs.length) return `**${title}**\n\n`;
      const lines = imgs.map((img, index) => `![${title} ${index + 1}](${img.getAttribute("src") || ""})`);
      return `**${title}**\n\n${lines.join("\n")}\n\n`;
    }

    if (tag === "div" || tag === "section" || tag === "figure") {
      return Array.from(node.childNodes).map((child) => blockToMarkdown(child, depth)).join("");
    }

    return inline ? `${inline}\n\n` : "";
  }

  function toMarkdown() {
    return Array.from(editor.childNodes)
      .map((node) => blockToMarkdown(node, 0))
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function slug() {
    return String(projectName)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "brief";
  }

  function download(content, mime, extension) {
    const blob = new Blob([content], { type: mime });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `brief-${slug()}.${extension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function exportWord() {
    const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8" /><title>Brief — ${escapeHtml(projectName)}</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.5;}h1{font-size:24pt;}h2{font-size:14pt;text-transform:uppercase;letter-spacing:1px;}h3{font-size:11pt;color:#555;text-transform:uppercase;}img{max-width:100%;}</style></head><body>${editor.innerHTML}</body></html>`;
    download(html, "application/msword", "doc");
  }

  function closeMenus() {
    root.querySelectorAll("[data-menu], [data-add-menu]").forEach((menu) => {
      menu.hidden = true;
    });
  }

  function toggleMenu(selector) {
    const menu = root.querySelector(selector);
    if (!menu) return;
    const willOpen = menu.hidden;
    closeMenus();
    menu.hidden = !willOpen;
  }

  function pinAddMarkup() {
    return `<button type="button" class="bf-pinboard-add" data-pinboard-add aria-label="Agregar imagen">+</button>`;
  }

  function pinTileMarkup(src) {
    return `
      <div class="bf-pinboard-tile" draggable="true" data-pinboard-tile>
        <img src="${escapeHtml(src)}" alt="Referencia" draggable="false" />
        <div class="bf-pinboard-tile-actions">
          <button type="button" class="bf-pinboard-move" data-pinboard-move="-1" aria-label="Mover a la izquierda">‹</button>
          <button type="button" class="bf-pinboard-move" data-pinboard-move="1" aria-label="Mover a la derecha">›</button>
          <button type="button" class="bf-pinboard-delete" data-pinboard-delete aria-label="Quitar imagen">✕</button>
        </div>
      </div>
    `.trim();
  }

  function createPinboard() {
    const board = document.createElement("figure");
    board.className = "bf-pinboard";
    board.contentEditable = "false";
    board.setAttribute("data-pinboard", "");
    board.innerHTML = `
      <div class="bf-pinboard-head">
        <div class="bf-pinboard-title" contenteditable="true" data-pinboard-title>PINBOARD</div>
        <button type="button" class="bf-pinboard-remove" data-pinboard-remove>Quitar</button>
      </div>
      <div class="bf-pinboard-grid" data-pinboard-grid>
        ${pinAddMarkup()}
      </div>
    `;
    return board;
  }

  function currentEditorBlock() {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return null;
    let node =
      selection.anchorNode.nodeType === 1
        ? selection.anchorNode
        : selection.anchorNode.parentElement;
    while (node && node !== editor && node.parentElement !== editor) {
      node = node.parentElement;
    }
    return node && node !== editor ? node : null;
  }

  function insertPinboard() {
    const board = createPinboard();
    const after = document.createElement("p");
    after.innerHTML = "<br>";
    editor.focus();

    const block = currentEditorBlock();
    if (block?.matches?.("[data-pinboard]")) block.after(board);
    else if (block) block.after(board);
    else editor.appendChild(board);

    if (!board.nextElementSibling) board.after(after);
    scheduleSave();
  }

  function hydratePinboards() {
    editor.querySelectorAll("[data-pinboard]").forEach((board) => {
      board.contentEditable = "false";
      if (board.parentElement && board.parentElement !== editor) {
        let block = board;
        while (block.parentElement && block.parentElement !== editor) {
          block = block.parentElement;
        }
        if (block !== board) block.after(board);
      }
      const grid = board.querySelector("[data-pinboard-grid]");
      if (grid && !grid.querySelector("[data-pinboard-add]")) {
        grid.insertAdjacentHTML("beforeend", pinAddMarkup());
      }
    });
  }

  function pickPinboardImages(board) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.addEventListener("change", async () => {
      const files = Array.from(input.files ?? []);
      const grid = board.querySelector("[data-pinboard-grid]");
      const addBtn = grid?.querySelector("[data-pinboard-add]");
      if (!addBtn) return;
      for (const file of files) {
        try {
          const src = await fileToImage(file);
          addBtn.insertAdjacentHTML("beforebegin", pinTileMarkup(src));
        } catch {
          alert("No se pudo cargar una de las imágenes.");
        }
      }
      scheduleSave();
    });
    input.click();
  }

  function movePinTile(tile, delta) {
    if (!tile || !delta) return;
    const grid = tile.parentElement;
    const tiles = Array.from(grid.querySelectorAll("[data-pinboard-tile]"));
    const index = tiles.indexOf(tile);
    const next = tiles[index + delta];
    if (!next) return;
    if (delta < 0) grid.insertBefore(tile, next);
    else grid.insertBefore(tile, next.nextSibling);
    scheduleSave();
  }

  function render() {
    root.innerHTML = `
      <div class="bf-shell">
        <header class="bf-top">
          <div>
            <p class="bf-kicker">33 FILMS · ${escapeHtml(projectName)}</p>
            <h1 class="bf-title">BRIEF</h1>
          </div>
          <div class="bf-actions">
            <span class="bf-status" data-status>Guardado</span>
            <div class="bf-menu">
              <button type="button" class="bf-btn" data-action="toggle-export">Exportar como… ▾</button>
              <div class="bf-menu-list" data-menu hidden>
                <button type="button" class="bf-menu-item" data-action="export-pdf">PDF</button>
                <button type="button" class="bf-menu-item" data-action="export-md">Markdown (.md)</button>
                <button type="button" class="bf-menu-item" data-action="export-doc">Word (.doc)</button>
              </div>
            </div>
            <button type="button" class="bf-btn ghost" data-action="reset">Restaurar plantilla</button>
          </div>
        </header>

        <div class="bf-toolbar">
          <button type="button" class="bf-tool" data-cmd="formatBlock" data-value="h1">T1</button>
          <button type="button" class="bf-tool" data-cmd="formatBlock" data-value="h2">T2</button>
          <button type="button" class="bf-tool" data-cmd="formatBlock" data-value="h3">T3</button>
          <button type="button" class="bf-tool" data-cmd="formatBlock" data-value="p">Texto</button>
          <span class="bf-tool-sep"></span>
          <button type="button" class="bf-tool bf-tool-bold" data-cmd="bold">N</button>
          <button type="button" class="bf-tool bf-tool-italic" data-cmd="italic">C</button>
          <button type="button" class="bf-tool bf-tool-underline" data-cmd="underline">S</button>
          <span class="bf-tool-sep"></span>
          <button type="button" class="bf-tool" data-cmd="insertUnorderedList">• Lista</button>
          <button type="button" class="bf-tool" data-cmd="insertOrderedList">1. Lista</button>
          <span class="bf-tool-sep"></span>
          <button type="button" class="bf-tool" data-action="image">Imagen</button>
          <div class="bf-menu bf-add-menu">
            <button type="button" class="bf-tool" data-action="toggle-add">Agregar: ▾</button>
            <div class="bf-menu-list" data-add-menu hidden>
              <button type="button" class="bf-menu-item" data-action="insert-pinboard">Pinboard</button>
            </div>
          </div>
          <button type="button" class="bf-tool" data-cmd="removeFormat">Limpiar</button>
          <span class="bf-tool-sep"></span>
          <button type="button" class="bf-tool" data-cmd="undo">Deshacer</button>
          <button type="button" class="bf-tool" data-cmd="redo">Rehacer</button>
        </div>

        <div class="bf-doc">
          <div
            class="bf-editor"
            contenteditable="true"
            spellcheck="true"
            data-editor
            data-placeholder="Escribí el brief del proyecto…"
          ></div>
        </div>
      </div>
    `;

    editor = root.querySelector("[data-editor]");
    statusEl = root.querySelector("[data-status]");
    editor.innerHTML = loadDoc() ?? template();
    hydratePinboards();
    setStatus("Guardado", false);
  }

  render();

  root.addEventListener("mousedown", (event) => {
    const tool = event.target.closest(".bf-tool");
    if (tool) event.preventDefault();
  });

  root.addEventListener("click", (event) => {
    const addTile = event.target.closest("[data-pinboard-add]");
    if (addTile) {
      pickPinboardImages(addTile.closest("[data-pinboard]"));
      return;
    }

    const deleteTile = event.target.closest("[data-pinboard-delete]");
    if (deleteTile) {
      deleteTile.closest("[data-pinboard-tile]")?.remove();
      scheduleSave();
      return;
    }

    const moveTile = event.target.closest("[data-pinboard-move]");
    if (moveTile) {
      movePinTile(
        moveTile.closest("[data-pinboard-tile]"),
        Number(moveTile.dataset.pinboardMove)
      );
      return;
    }

    const removeBoard = event.target.closest("[data-pinboard-remove]");
    if (removeBoard) {
      removeBoard.closest("[data-pinboard]")?.remove();
      scheduleSave();
      return;
    }

    const tool = event.target.closest("[data-cmd]");
    if (tool) {
      const command = tool.dataset.cmd;
      exec(command, command === "formatBlock" ? `<${tool.dataset.value}>` : null);
      return;
    }

    const button = event.target.closest("[data-action]");
    if (!button) {
      closeMenus();
      return;
    }

    const action = button.dataset.action;
    if (action === "image") {
      pickImage();
      return;
    }
    if (action === "toggle-add") {
      toggleMenu("[data-add-menu]");
      return;
    }
    if (action === "insert-pinboard") {
      closeMenus();
      insertPinboard();
      return;
    }
    if (action === "toggle-export") {
      toggleMenu("[data-menu]");
      return;
    }
    if (action === "export-pdf") {
      closeMenus();
      saveNow();
      window.print();
      return;
    }
    if (action === "export-md") {
      closeMenus();
      download(toMarkdown(), "text/markdown;charset=utf-8", "md");
      return;
    }
    if (action === "export-doc") {
      closeMenus();
      exportWord();
      return;
    }
    if (action === "reset") {
      closeMenus();
      if (!confirm("¿Restaurar la plantilla base? Se pierde el contenido actual.")) return;
      editor.innerHTML = template();
      hydratePinboards();
      saveNow();
    }
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) closeMenus();
  });

  let dragTile = null;

  root.addEventListener("dragstart", (event) => {
    if (event.target.closest("button, [data-pinboard-title]")) {
      event.preventDefault();
      return;
    }
    const tile = event.target.closest("[data-pinboard-tile]");
    if (!tile) return;
    dragTile = tile;
    tile.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  root.addEventListener("dragend", () => {
    if (dragTile) dragTile.classList.remove("is-dragging");
    root.querySelectorAll(".bf-pinboard-tile.is-over").forEach((el) => {
      el.classList.remove("is-over");
    });
    dragTile = null;
    scheduleSave();
  });

  root.addEventListener("dragover", (event) => {
    if (!dragTile) return;
    const over = event.target.closest("[data-pinboard-tile], [data-pinboard-add]");
    if (!over || over === dragTile) return;
    event.preventDefault();
    root.querySelectorAll(".bf-pinboard-tile.is-over").forEach((el) => {
      el.classList.remove("is-over");
    });
    if (over.matches("[data-pinboard-tile]")) over.classList.add("is-over");
    const grid = over.parentElement;
    if (!grid) return;
    if (over.matches("[data-pinboard-add]")) {
      grid.insertBefore(dragTile, over);
      return;
    }
    const rect = over.getBoundingClientRect();
    const before = event.clientX < rect.left + rect.width / 2;
    grid.insertBefore(dragTile, before ? over : over.nextSibling);
  });

  root.addEventListener("drop", (event) => {
    if (!dragTile) return;
    event.preventDefault();
  });

  editor.addEventListener("input", scheduleSave);
  editor.addEventListener("blur", saveNow);

  editor.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "s") {
      event.preventDefault();
      saveNow();
    }
  });

  editor.addEventListener("paste", (event) => {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        event.preventDefault();
        fileToImage(file)
          .then((dataUrl) => exec("insertImage", dataUrl))
          .catch(() => alert("No se pudo pegar la imagen."));
        return;
      }
    }
    const text = event.clipboardData?.getData("text/plain");
    if (typeof text === "string") {
      event.preventDefault();
      document.execCommand("insertText", false, text);
      scheduleSave();
    }
  });

  document.addEventListener("selectionchange", syncToolbar);
  window.addEventListener("beforeunload", saveNow);
})();
