import { outputPresets } from "../core/output-presets.js";


export function setupPresetsModal(state, updateState) {

const otherPresetsBtn = document.getElementById("other-presets-btn");
const presetsModal = document.getElementById("presets-modal");
const closeModal = document.getElementById("close-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalContent = document.getElementById("modal-content");
const modalOverlay = document.getElementById("modal-overlay");

if (otherPresetsBtn) {
  otherPresetsBtn.addEventListener("click", () => {
    presetsModal.classList.add("show");
    populateModal();
  });
}

const closeFunctions = [closeModal, closeModalBtn, modalOverlay];
closeFunctions.forEach((el) => {
  if (el) {
    el.addEventListener("click", () => {
      if (presetsModal) presetsModal.classList.remove("show");
    });
  }
});
function populateModal() {
  if (!modalContent) return;
  const groupsHtml = Object.entries(outputPresets)
    .filter(([key, presets]) => Array.isArray(presets) && presets.length > 0)
    .map(
      ([key, presets]) => `
            <div class="space-y-4 preset-group">
        <div class="flex items-center space-x-3">
          <div class="w-1 h-5 bg-accent rounded-full"></div>
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">${key.replace("_", " ")}</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${presets
            .map((p) => {
              const isActive =
                state.width === p.width && state.height === p.height;
              return `
              <button class="modal-preset-btn group flex flex-col items-start p-4 border ${isActive ? "border-accent bg-accent-light" : "border-slate-100 bg-slate-50/50"} rounded-2xl hover:border-accent hover:bg-white hover:shadow-xl transition-all text-left" 
                      data-width="${p.width}" data-height="${p.height}">
                <span class="text-[11px] font-bold ${isActive ? "text-accent" : "text-slate-800"} group-hover:text-accent transition-colors">${p.name}</span>
                <span class="text-[9px] ${isActive ? "text-accent/60" : "text-slate-400"} font-bold mt-1 uppercase tracking-tight">${p.width} × ${p.height} px</span>
              </button>
            `;
            })
            .join("")}
        </div>
      </div>
    `,
    )
    .join("");

  modalContent.innerHTML = `
            <div class="mb-4">
                <input id="preset-search" type="search" placeholder="Search sizes or preset names..." class="w-full input-field" />
            </div>
            <div class="space-y-6">${groupsHtml}</div>
        `;

  modalContent.querySelectorAll(".modal-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const width = parseInt(btn.dataset.width);
      const height = parseInt(btn.dataset.height);
      updateState({ width, height });
      presetsModal.classList.remove("show");
    });
  });

  const presetSearch = document.getElementById("preset-search");
  let presetSearchTimeout = null;
  if (presetSearch) {
    presetSearch.addEventListener("input", (e) => {
      clearTimeout(presetSearchTimeout);
      const q = (e.target.value || "").trim().toLowerCase();
      presetSearchTimeout = setTimeout(() => {
        modalContent.querySelectorAll(".modal-preset-btn").forEach((btn) => {
          const txt = (btn.innerText || "").toLowerCase();
          const dims = `${btn.dataset.width} ${btn.dataset.height}`;
          const match = q
            ? txt.indexOf(q) !== -1 || dims.indexOf(q) !== -1
            : true;
          btn.style.display = match ? "" : "none";
        });

        modalContent.querySelectorAll(".preset-group").forEach((group) => {
          const anyVisible = Array.from(
            group.querySelectorAll(".modal-preset-btn"),
          ).some((b) => b.style.display !== "none");
          group.style.display = anyVisible ? "" : "none";
        });
      }, 120);
    });
  }
}   }
