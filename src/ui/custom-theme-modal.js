import { artisticThemes } from '../core/artistic-themes.js';
import { loadCustomThemes, saveCustomTheme, deleteCustomTheme, newCustomThemeKey, exportCustomThemes, importCustomThemesFromJSON, clearCustomThemes } from '../core/custom-themes.js';

const fields = [
	['ct-bg', 'bg'], ['ct-text', 'text'], ['ct-water', 'water'], ['ct-parks', 'parks'],
	['ct-road-motorway', 'road_motorway'], ['ct-road-primary', 'road_primary'],
	['ct-road-secondary', 'road_secondary'], ['ct-road-tertiary', 'road_tertiary'],
	['ct-road-residential', 'road_residential'], ['ct-road-default', 'road_default'], ['ct-route', 'route'],
];

export function setupCustomThemeModal(state, updateState, getSelectedArtisticTheme, updateArtisticStyle, updateRouteStyles) {
	const modal = document.getElementById('artistic-modal');
	const content = document.getElementById('artistic-modal-content');
	const editor = document.getElementById('custom-theme-modal');
	let editingKey = null;

	fields.forEach(([id]) => {
		const picker = document.getElementById(id);
		const hex = document.getElementById(`${id}-hex`);
		picker?.addEventListener('input', () => { if (hex) hex.value = picker.value; });
		hex?.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(hex.value.trim()) && picker) picker.value = hex.value.trim(); });
	});

	function openEditor(key = null) {
		editingKey = key;
		const existing = key ? (loadCustomThemes()[key] || {}) : {};
		document.getElementById('custom-theme-modal-title').textContent = key ? 'Edit Custom Theme' : 'Create Custom Theme';
		document.getElementById('custom-theme-delete-btn').classList.toggle('hidden', !key);
		document.getElementById('ct-name').value = existing.name || '';
		document.getElementById('ct-desc').value = existing.description || '';
		fields.forEach(([id, property]) => {
			const value = existing[property] || document.getElementById(id)?.defaultValue || '#000000';
			document.getElementById(id).value = value;
			document.getElementById(`${id}-hex`).value = value;
		});
		editor.classList.add('show');
	}

	function closeEditor() {
		editor.classList.remove('show');
		editingKey = null;
		modal?.classList.add('show');
		populateArtisticModal();
	}

	[document.getElementById('custom-theme-cancel-btn'), document.getElementById('close-custom-theme-modal'), document.getElementById('custom-theme-modal-overlay')].forEach((element) => element?.addEventListener('click', closeEditor));
	document.getElementById('custom-theme-save-btn')?.addEventListener('click', () => {
		const nameInput = document.getElementById('ct-name');
		const name = nameInput.value.trim();
		if (!name) { nameInput.focus(); return; }
		const theme = { name, description: document.getElementById('ct-desc').value.trim() };
		fields.forEach(([id, property]) => { theme[property] = document.getElementById(id).value || '#000000'; });
		const key = editingKey || newCustomThemeKey();
		saveCustomTheme(key, theme);
		updateState({ artisticTheme: key });
		if (state.renderMode === 'artistic') updateArtisticStyle(getSelectedArtisticTheme());
		closeEditor();
	});
	document.getElementById('custom-theme-delete-btn')?.addEventListener('click', () => {
		if (!editingKey) return;
		const name = document.getElementById('ct-name').value || editingKey;
		if (!confirm(`Delete "${name}"?`)) return;
		deleteCustomTheme(editingKey);
		if (state.artisticTheme === editingKey) updateState({ artisticTheme: 'cyber_noir' });
		closeEditor();
	});

	function populateArtisticModal() {
		if (!content) return;
		const customThemes = loadCustomThemes();
		const customKeys = Object.keys(customThemes);
		const swatches = (theme) => [theme.road_motorway, theme.road_primary, theme.road_secondary, theme.road_tertiary].map((color) => `<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${color || '#ccc'}"></span>`).join('');
		const customHtml = customKeys.map((key) => `<div data-search-row class="flex items-center gap-2 p-3 border border-slate-100 rounded-2xl"><button class="artistic-modal-item flex-1 flex items-center gap-3 text-left" data-key="${key}"><div class="flex -space-x-2">${swatches(customThemes[key])}</div><div><div class="text-sm font-semibold">${customThemes[key].name || key}</div><div class="text-[10px] text-slate-400">${customThemes[key].description || 'Custom theme'}</div></div></button><button class="edit-custom-btn" data-key="${key}" title="Edit">Edit</button></div>`).join('');
		const builtInHtml = Object.entries(artisticThemes).map(([key, theme]) => `<button data-search-row class="artistic-modal-item group w-full flex items-center p-4 border border-slate-100 rounded-2xl" data-key="${key}"><div class="flex -space-x-2 mr-4">${swatches(theme)}</div><div class="text-left"><div class="text-sm font-semibold">${theme.name || key}</div><div class="text-[10px] text-slate-400">${theme.description || ''}</div></div></button>`).join('');
		content.innerHTML = `<div class="flex gap-2"><button id="create-custom-theme-btn" class="flex-1 flex items-center gap-2 p-3.5 border-2 border-dashed border-slate-200 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all text-slate-700 hover:text-accent"><span class="text-xs font-semibold">Create Custom Theme</span></button><button id="import-custom-themes-btn" class="flex items-center gap-2 px-4 py-3.5 border-2 border-dashed border-slate-200 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all text-slate-700 hover:text-accent"><span class="text-xs font-semibold">Import</span></button></div><input type="file" id="import-custom-themes-file" accept=".json,application/json" class="hidden" />${customKeys.length ? `<div data-search-row><p>My Themes</p>${customHtml}<button id="export-custom-themes-btn">Export</button><button id="delete-all-custom-themes-btn">Delete All</button></div>` : ''}<input id="artistic-search" type="search" placeholder="Search themes..." class="w-full input-field" /><div>${builtInHtml}</div>`;
		content.querySelector('#create-custom-theme-btn')?.addEventListener('click', () => { modal?.classList.remove('show'); openEditor(); });
		content.querySelector('#import-custom-themes-btn')?.addEventListener('click', () => content.querySelector('#import-custom-themes-file')?.click());
		content.querySelector('#import-custom-themes-file')?.addEventListener('change', (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (loadEvent) => { try { const result = importCustomThemesFromJSON(loadEvent.target.result); populateArtisticModal(); alert(`Imported ${result.imported} theme${result.imported !== 1 ? 's' : ''}${result.skipped ? ` (${result.skipped} skipped — invalid)` : ''}.`); } catch { alert('Could not read file. Make sure it is a valid JSON export from this app.'); } event.target.value = ''; }; reader.readAsText(file); });
		content.querySelector('#export-custom-themes-btn')?.addEventListener('click', exportCustomThemes);
		content.querySelector('#delete-all-custom-themes-btn')?.addEventListener('click', () => { if (!confirm(`Delete all ${customKeys.length} custom themes? This cannot be undone.`)) return; clearCustomThemes(); if (customKeys.includes(state.artisticTheme)) updateState({ artisticTheme: 'cyber_noir' }); populateArtisticModal(); });
		content.querySelectorAll('.edit-custom-btn').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); modal?.classList.remove('show'); openEditor(button.dataset.key); }));
		content.querySelectorAll('.artistic-modal-item').forEach((button) => button.addEventListener('click', () => { updateState({ artisticTheme: button.dataset.key }); if (state.renderMode === 'artistic') { updateArtisticStyle(getSelectedArtisticTheme()); updateRouteStyles(state); } modal?.classList.remove('show'); }));
		content.querySelector('#artistic-search')?.addEventListener('input', (event) => { const query = event.target.value.trim().toLowerCase(); content.querySelectorAll('[data-search-row]').forEach((row) => { row.style.display = !query || row.innerText.toLowerCase().includes(query) ? '' : 'none'; }); });
	}

	return { populateArtisticModal, openEditor };
}
