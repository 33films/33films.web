const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const model = require("./storyboard.js");

describe("storyboard document", () => {
  it("keeps an existing shot on the original storyboard fields", () => {
    const document = model.normalizeDocument({
      scenes: [
        {
          id: "scene-1",
          title: "ESCENA 1",
          shots: [
            {
              id: "shot-1",
              image: "",
              frame: "Plano Medio",
              movement: "Fijo",
              action: "Entra",
              audio: "Puerta",
              duration: "4s",
              notes: "Noche",
            },
          ],
        },
      ],
    });
    const shot = document.scenes[0].shots[0];
    assert.equal(shot.frame, "Plano Medio");
    assert.equal(shot.movement, "Fijo");
    assert.equal(shot.action, "Entra");
    assert.equal(shot.audio, "Puerta");
    assert.equal(shot.duration, "4s");
    assert.equal(shot.notes, "Noche");
    assert.deepEqual(shot.blocks, []);
  });

  it("does not rebuild blocks that were already saved", () => {
    const custom = model.createBlock("custom");
    custom.name = "Prótesis";
    custom.category = "Arte";
    custom.text = "Herida";
    custom.note = "Látex";
    const document = model.normalizeDocument({
      scenes: [{ id: "scene-1", title: "ESCENA 1", shots: [{ id: "shot-1", frame: "Plano General", blocks: [custom] }] }],
    });
    const shot = document.scenes[0].shots[0];
    assert.equal(shot.blocks.length, 1);
    assert.equal(shot.blocks[0].name, "Prótesis");
    assert.equal(shot.blocks[0].category, "Arte");
    assert.equal(shot.blocks[0].text, "Herida");
    assert.equal(shot.blocks[0].note, "Látex");
  });

  it("starts a new shot with the original defaults and no extra blocks", () => {
    const shot = model.createShot();
    assert.deepEqual(shot.blocks, []);
    assert.equal(shot.frame, "Plano Medio");
    assert.equal(shot.movement, "Fijo");
  });

  it("offers the added shot scale and several movements in one block", () => {
    assert.equal(model.FRAMES.includes("Plano Medio Corto (PMC)"), true);
    assert.equal(model.FRAMES.includes("Plano General"), true);
    assert.equal(model.MOVES.includes("Fijo"), true);
    assert.equal(model.MOVES.includes("Dolly In"), true);
    assert.equal(model.MOVES.includes("Bullet Time"), true);
    assert.equal(model.AUDIO.includes("J-Cut"), true);
    assert.equal(model.AUDIO.includes("Diálogo"), true);
    const movement = model.createBlock("movement");
    movement.values = ["Dolly In", "Handheld"];
    assert.deepEqual(movement.values, ["Dolly In", "Handheld"]);
  });

  it("folds the first technical block into the original cells and keeps extras", () => {
    const frame = model.createBlock("frame");
    frame.values = ["Plano Medio Corto (PMC)"];
    const audio = model.createBlock("audio");
    audio.values = ["Diálogo"];
    audio.note = "Susurro";
    const extra = model.createBlock("audio");
    extra.note = "Sala";
    const document = model.normalizeDocument({
      scenes: [
        {
          id: "scene-1",
          title: "ESCENA 1",
          shots: [{ id: "shot-1", frame: "", audio: "", blocks: [frame, audio, extra] }],
        },
      ],
    });
    const shot = document.scenes[0].shots[0];
    assert.equal(shot.frame, "Plano Medio Corto (PMC)");
    assert.equal(shot.audio, "Diálogo — Susurro");
    assert.equal(shot.blocks.length, 1);
    assert.equal(shot.blocks[0].note, "Sala");
    model.mirrorLegacy(shot);
    assert.equal(shot.frame, "Plano Medio Corto (PMC)");
    assert.equal(shot.audio, "Diálogo — Susurro");
  });
});
