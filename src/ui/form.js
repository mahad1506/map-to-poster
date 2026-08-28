import { state, updateState, defaultState, getSelectedTheme, getSelectedArtisticTheme } from '../core/state.js';
import { hexToRgba } from '../core/utils.js';
import { applyPosterTextLayout } from './poster-text-layout.js';
import { setupPosterSettings } from './poster-settings.js';
import { setupMarkerControls } from './marker-controls.js';
import { setupRouteControls } from './route-controls.js';
import {
	updateMapPosition,
	invalidateMapSize,
	updateArtisticStyle,
	updateMapTheme,
	updateMarkerStyles,
	updateRouteStyles,
	updateRouteGeometry
} from '../map/map-init.js';
import { searchLocation, formatCoords } from '../map/geocoder.js';
import { setupLocationControls } from './location-controls.js';
import { setupThemeControls } from './theme-controls.js';
import { setupCustomThemeModal } from './custom-theme-modal.js';
import { setupOverlayControls } from './overlay-controls.js';
import { setupPresetsModal } from './presets-modal.js';


export function setupControls() {
	const exportBtn = document.getElementById('export-btn');
	const syncPosterSettings = setupPosterSettings(state, updateState, defaultState);
	const syncMarkerControls = setupMarkerControls(state, updateState, updateMarkerStyles);
	const syncRouteControls = setupRouteControls(state, updateState, updateRouteGeometry, updateRouteStyles);
	const syncLocationControls = setupLocationControls(state, updateState, updateMapPosition, updateMarkerStyles, updateRouteGeometry, updateRouteStyles, searchLocation, formatCoords);
	const customThemeModal = setupCustomThemeModal(state, updateState, getSelectedArtisticTheme, updateArtisticStyle, updateRouteStyles);
	const syncThemeControls = setupThemeControls(state, updateState, getSelectedTheme, getSelectedArtisticTheme, updateArtisticStyle, updateMapTheme, invalidateMapSize, updateMarkerStyles, updateRouteStyles, customThemeModal.populateArtisticModal);
	const syncOverlayControls = setupOverlayControls(state, updateState);
	const syncPresetControls = setupPresetsModal(state,updateState);
	const logoBtn = document.getElementById('logo-btn');
	const creditsModal = document.getElementById('credits-modal');
	const closeCredits = document.getElementById('close-credits');
	const creditsOverlay = document.getElementById('credits-overlay');

	if (logoBtn) {
		logoBtn.addEventListener('click', () => {
			if (creditsModal) creditsModal.classList.add('show');
		});
	}

	const closeCreditsFunctions = [closeCredits, creditsOverlay];
	closeCreditsFunctions.forEach(el => {
		if (el) {
			el.addEventListener('click', () => {
				if (creditsModal) creditsModal.classList.remove('show');
			});
		}
	});




	const artisticModal = document.getElementById('artistic-modal');
	const artisticModalContent = document.getElementById('artistic-modal-content');
	const closeArtisticModal = document.getElementById('close-artistic-modal');
	const closeArtisticModalBtn = document.getElementById('close-artistic-modal-btn');
	const artisticModalOverlay = document.getElementById('artistic-modal-overlay');

	const closeArtisticFuncs = [closeArtisticModal, closeArtisticModalBtn, artisticModalOverlay];
	closeArtisticFuncs.forEach(el => {
		if (el) el.addEventListener('click', () => { if (artisticModal) artisticModal.classList.remove('show'); });
	});

	if (false) {
	const ctModal = document.getElementById('custom-theme-modal');
	const ctModalTitle = document.getElementById('custom-theme-modal-title');
	const ctSaveBtn = document.getElementById('custom-theme-save-btn');
	const ctDeleteBtn = document.getElementById('custom-theme-delete-btn');
	const ctCancelBtn = document.getElementById('custom-theme-cancel-btn');
	const ctCloseBtn = document.getElementById('close-custom-theme-modal');
	const ctOverlay = document.getElementById('custom-theme-modal-overlay');

	const CT_FIELDS = [
		{ id: 'ct-bg', key: 'bg' },
		{ id: 'ct-text', key: 'text' },
		{ id: 'ct-water', key: 'water' },
		{ id: 'ct-parks', key: 'parks' },
		{ id: 'ct-road-motorway', key: 'road_motorway' },
		{ id: 'ct-road-primary', key: 'road_primary' },
		{ id: 'ct-road-secondary', key: 'road_secondary' },
		{ id: 'ct-road-tertiary', key: 'road_tertiary' },
		{ id: 'ct-road-residential', key: 'road_residential' },
		{ id: 'ct-road-default', key: 'road_default' },
		{ id: 'ct-route', key: 'route' },
	];

	CT_FIELDS.forEach(({ id }) => {
		const picker = document.getElementById(id);
		const hex = document.getElementById(id + '-hex');
		if (!picker || !hex) return;
		picker.addEventListener('input', () => { hex.value = picker.value; });
		hex.addEventListener('input', () => {
			if (/^#[0-9a-fA-F]{6}$/.test(hex.value.trim())) picker.value = hex.value.trim();
		});
	});

	let _editingCustomKey = null;

	function openCustomThemeEditor(key = null) {
		_editingCustomKey = key;
		ctModalTitle.textContent = key ? 'Edit Custom Theme' : 'Create Custom Theme';
		ctDeleteBtn.classList.toggle('hidden', !key);

		const existing = key ? (loadCustomThemes()[key] || {}) : {};
		document.getElementById('ct-name').value = existing.name || '';
		document.getElementById('ct-desc').value = existing.description || '';
		CT_FIELDS.forEach(({ id, key: fieldKey }) => {
			const picker = document.getElementById(id);
			const hexEl = document.getElementById(id + '-hex');
			const val = existing[fieldKey] || picker.defaultValue || '#000000';
			if (picker) picker.value = val;
			if (hexEl) hexEl.value = val;
		});
		ctModal.classList.add('show');
	}

	function closeCustomThemeEditor() {
		ctModal.classList.remove('show');
		_editingCustomKey = null;
		populateArtisticModal();
		artisticModal?.classList.add('show');
	}

	[ctCancelBtn, ctCloseBtn, ctOverlay].forEach(el => {
		if (el) el.addEventListener('click', closeCustomThemeEditor);
	});

	if (ctSaveBtn) {
		ctSaveBtn.addEventListener('click', () => {
			const name = (document.getElementById('ct-name').value || '').trim();
			if (!name) { document.getElementById('ct-name').focus(); return; }

			const theme = { name, description: (document.getElementById('ct-desc').value || '').trim() };
			CT_FIELDS.forEach(({ id, key: fieldKey }) => {
				theme[fieldKey] = document.getElementById(id)?.value || '#000000';
			});

			const key = _editingCustomKey || newCustomThemeKey();
			saveCustomTheme(key, theme);
			updateState({ artisticTheme: key });
			if (state.renderMode === 'artistic') updateArtisticStyle(getSelectedArtisticTheme());
			closeCustomThemeEditor();
		});
	}

	if (ctDeleteBtn) {
		ctDeleteBtn.addEventListener('click', () => {
			if (!_editingCustomKey) return;
			const name = document.getElementById('ct-name').value || _editingCustomKey;
			if (!confirm(`Delete "${name}"?`)) return;
			deleteCustomTheme(_editingCustomKey);
			if (state.artisticTheme === _editingCustomKey) {
				updateState({ artisticTheme: 'cyber_noir' });
				if (state.renderMode === 'artistic') updateArtisticStyle(getSelectedArtisticTheme());
			}
			closeCustomThemeEditor();
		});
	}

	function populateArtisticModal() {
		if (!artisticModalContent) return;

		const customThemes = loadCustomThemes();
		const customKeys = Object.keys(customThemes);
		const mainKeys = new Set(['cyber_noir', 'golden_era', 'mangrove_maze']);

		const makeSwatches = (t) => {
			const cols = [t.road_motorway, t.road_primary, t.road_secondary, t.road_tertiary, t.text, t.bg];
			return cols.map(c => c || '#cccccc').slice(0, 4)
				.map(c => `<span class="w-6 h-6 rounded-full ring-1 ring-white shrink-0" style="background:${c}"></span>`)
				.join('');
		};

		const customSection = customKeys.length ? `
			<div class="space-y-2 pb-4 border-b border-slate-100">
				<div class="flex items-center justify-between">
					<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Themes</p>
					<div class="flex items-center gap-2">
						<button id="export-custom-themes-btn" class="text-[10px] font-bold text-slate-400 hover:text-accent transition-colors flex items-center gap-1" title="Export all custom themes as JSON">
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
							Export
						</button>
						<button id="delete-all-custom-themes-btn" class="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1" title="Delete all custom themes">
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
							Delete All
						</button>
					</div>
				</div>
				${customKeys.map(key => {
			const t = customThemes[key];
			return `
					<div class="flex items-center gap-2 p-3 border border-slate-100 rounded-2xl hover:shadow-md transition-all" data-search-row>
						<button class="artistic-modal-item flex-1 flex items-center gap-3 text-left" data-key="${key}">
							<div class="flex -space-x-2">${makeSwatches(t)}</div>
							<div>
								<div class="text-sm font-semibold text-slate-900">${t.name || key}</div>
								<div class="text-[10px] text-slate-400 mt-0.5">${t.description || 'Custom theme'}</div>
							</div>
						</button>
						<button class="edit-custom-btn shrink-0 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors" data-key="${key}" title="Edit">
							<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
						</button>
					</div>`;
		}).join('')}
			</div>` : '';

		const builtinHtml = Object.entries(artisticThemes)
			.filter(([k]) => !mainKeys.has(k))
			.map(([key, t]) => `
				<button class="artistic-modal-item group w-full flex items-center p-4 border border-slate-100 rounded-2xl hover:shadow-xl transition-all" data-key="${key}" data-search-row>
					<div class="flex -space-x-2 mr-4">${makeSwatches(t)}</div>
					<div class="text-left">
						<div class="text-sm font-semibold text-slate-900">${t.name || key}</div>
						<div class="text-[10px] text-slate-400 mt-1">${t.description || ''}</div>
					</div>
				</button>`).join('');

		artisticModalContent.innerHTML = `
			<div class="flex gap-2">
				<button id="create-custom-theme-btn" class="flex-1 flex items-center gap-2 p-3.5 border-2 border-dashed border-slate-200 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all text-slate-400 hover:text-accent">
					<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
					<span class="text-xs font-semibold">Create Theme</span>
				</button>
				<button id="import-custom-themes-btn" class="flex items-center gap-2 px-4 py-3.5 border-2 border-dashed border-slate-200 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all text-slate-400 hover:text-accent" title="Import themes from JSON file">
					<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"/></svg>
					<span class="text-xs font-semibold">Import</span>
				</button>
			</div>
			<input type="file" id="import-custom-themes-file" accept=".json,application/json" class="hidden" />
			${customSection}
			<div class="mb-2">
				<input id="artistic-search" type="search" placeholder="Search themes..." class="w-full input-field" />
			</div>
			<div class="space-y-2">${builtinHtml}</div>
		`;

		document.getElementById('create-custom-theme-btn')?.addEventListener('click', () => {
			if (artisticModal) artisticModal.classList.remove('show');
			openCustomThemeEditor(null);
		});

		document.getElementById('import-custom-themes-btn')?.addEventListener('click', () => {
			document.getElementById('import-custom-themes-file')?.click();
		});
		document.getElementById('import-custom-themes-file')?.addEventListener('change', (e) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (ev) => {
				try {
					const { imported, skipped } = importCustomThemesFromJSON(ev.target.result);
					populateArtisticModal();
					alert(`Imported ${imported} theme${imported !== 1 ? 's' : ''}${skipped ? ` (${skipped} skipped — invalid)` : ''}.`);
				} catch {
					alert('Could not read file. Make sure it is a valid JSON export from this app.');
				}
				e.target.value = '';
			};
			reader.readAsText(file);
		});

		document.getElementById('export-custom-themes-btn')?.addEventListener('click', exportCustomThemes);

		document.getElementById('delete-all-custom-themes-btn')?.addEventListener('click', () => {
			if (!confirm(`Delete all ${customKeys.length} custom theme${customKeys.length !== 1 ? 's' : ''}? This cannot be undone.`)) return;
			clearCustomThemes();
			if (customKeys.includes(state.artisticTheme)) updateState({ artisticTheme: 'cyber_noir' });
			populateArtisticModal();
		});

		artisticModalContent.querySelectorAll('.edit-custom-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (artisticModal) artisticModal.classList.remove('show');
				openCustomThemeEditor(btn.dataset.key);
			});
		});

		artisticModalContent.querySelectorAll('.artistic-modal-item').forEach(btn => {
			btn.addEventListener('click', () => {
				const k = btn.dataset.key;
				updateState({ artisticTheme: k });
				if (state.renderMode === 'artistic') {
					updateArtisticStyle(getSelectedArtisticTheme());
					updateRouteStyles(state);
				}
				if (artisticModal) artisticModal.classList.remove('show');
			});
		});

		const artSearch = document.getElementById('artistic-search');
		let artSearchTimeout = null;
		if (artSearch) {
			artSearch.addEventListener('input', (e) => {
				clearTimeout(artSearchTimeout);
				const q = (e.target.value || '').trim().toLowerCase();
				artSearchTimeout = setTimeout(() => {
					artisticModalContent.querySelectorAll('[data-search-row]').forEach(it => {
						const txt = (it.innerText || '').toLowerCase();
						it.style.display = q ? (txt.includes(q) ? '' : 'none') : '';
					});
				}, 120);
			});
		}
	}
	}

	

	return (currentState) => {
		syncLocationControls(currentState);

		syncOverlayControls(currentState);

		syncThemeControls(currentState);
		syncRouteControls(currentState);

		syncMarkerControls(currentState);

		syncPosterSettings(currentState);

		let accentColor = '#0f172a';
		if (currentState.renderMode === 'artistic') {
			const theme = getSelectedArtisticTheme();
			accentColor = theme.road_primary || theme.text || '#0f172a';
			exportBtn.classList.remove('bg-slate-900');
			exportBtn.classList.add('bg-accent');
		} else {
			accentColor = '#0f172a';
			exportBtn.classList.add('bg-slate-900');
			exportBtn.classList.remove('bg-accent');
		}

		const r = parseInt(accentColor.slice(1, 3), 16);
		const g = parseInt(accentColor.slice(3, 5), 16);
		const b = parseInt(accentColor.slice(5, 7), 16);
		document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
	};
}

let lastWidth = null;
let lastHeight = null;
let lastMatEnabled = null;
let lastMatWidth = null;

let _lastArtisticTheme = null;
let _lastRenderMode = null;

export function updatePreviewStyles(currentState) {
	const posterContainer = document.getElementById('poster-container');
	const posterScaler = document.getElementById('poster-scaler');
	const displayCity = document.getElementById('display-city');
	const displayCountry = document.getElementById('display-country');
	const displayCoords = document.getElementById('display-coords');
	const overlay = document.getElementById('poster-overlay');
	const overlayBg = overlay ? overlay.querySelector('.overlay-bg') : null;
	const vignetteOverlay = document.getElementById('vignette-overlay');
	const matBorder = document.getElementById('mat-border');
	const divider = document.getElementById('poster-divider');
	const attribution = document.getElementById('poster-attribution');

	const theme = getSelectedTheme();
	const artisticTheme = getSelectedArtisticTheme();

	const isArtistic = currentState.renderMode === 'artistic';
	const mapPreview = document.getElementById('map-preview');
	const artisticMapDiv = document.getElementById('artistic-map');

	const activeTheme = isArtistic ? artisticTheme : theme;

	const matEnabled = currentState.matEnabled;
	const matWidth = matEnabled ? (currentState.matWidth || 0) : 0;
	const showBorder = matEnabled && currentState.matShowBorder;
	const borderColor = activeTheme.text || activeTheme.textColor || '#000000';
	const borderWidth = currentState.matBorderWidth || 1;
	const borderOpacity = currentState.matBorderOpacity || 1;

	if (isArtistic) {
		mapPreview.style.visibility = 'hidden';
		mapPreview.style.pointerEvents = 'none';
		artisticMapDiv.style.visibility = 'visible';
		artisticMapDiv.style.pointerEvents = 'auto';

		if (_lastRenderMode !== 'artistic' || _lastArtisticTheme !== currentState.artisticTheme) {
			updateArtisticStyle(artisticTheme);
		}
	} else {
		mapPreview.style.visibility = 'visible';
		mapPreview.style.pointerEvents = 'auto';
		artisticMapDiv.style.visibility = 'hidden';
		artisticMapDiv.style.pointerEvents = 'none';
	}
	_lastRenderMode = currentState.renderMode;
	_lastArtisticTheme = currentState.artisticTheme;

	[mapPreview, artisticMapDiv].forEach(el => {
		if (el) {
			el.style.top = `${matWidth}px`;
			el.style.left = `${matWidth}px`;
			el.style.right = `${matWidth}px`;
			el.style.bottom = `${matWidth}px`;
			el.style.outline = 'none';
		}
	});

	if (matBorder) {
		if (matEnabled && showBorder) {
			matBorder.style.display = 'block';
			matBorder.style.top = `${matWidth}px`;
			matBorder.style.left = `${matWidth}px`;
			matBorder.style.right = `${matWidth}px`;
			matBorder.style.bottom = `${matWidth}px`;
			matBorder.style.border = `${borderWidth}px solid ${borderColor}`;
			matBorder.style.opacity = borderOpacity;
		} else {
			matBorder.style.display = 'none';
		}
	}

	if (vignetteOverlay) {
		vignetteOverlay.style.top = `${matWidth}px`;
		vignetteOverlay.style.left = `${matWidth}px`;
		vignetteOverlay.style.right = `${matWidth}px`;
		vignetteOverlay.style.bottom = `${matWidth}px`;
	}

	const sizeChanged = lastWidth !== currentState.width || lastHeight !== currentState.height;
	const matChanged = lastMatEnabled !== currentState.matEnabled || lastMatWidth !== currentState.matWidth;

	lastWidth = currentState.width;
	lastHeight = currentState.height;
	lastMatEnabled = currentState.matEnabled;
	lastMatWidth = currentState.matWidth;

	posterContainer.style.width = `${currentState.width}px`;
	posterContainer.style.height = `${currentState.height}px`;
	posterContainer.style.backgroundColor = activeTheme.bg || activeTheme.background;

	const parent = posterScaler.parentElement;
	const isMobile = window.innerWidth < 768;
	const padding = isMobile ? 40 : 120;
	const availableW = parent.clientWidth - padding;
	const availableH = parent.clientHeight - padding;

	const scaleW = availableW / currentState.width;
	const scaleH = availableH / currentState.height;
	const scale = Math.min(scaleW, scaleH, 1);

	posterScaler.style.transform = `scale(${scale})`;

	displayCity.textContent = (currentState.cityOverride && currentState.cityOverride.length) ? currentState.cityOverride : currentState.city;
	displayCity.style.color = activeTheme.text || activeTheme.textColor;
	displayCity.style.fontFamily = currentState.cityFont;

	if (displayCountry) {
		displayCountry.textContent = (currentState.countryOverride && currentState.countryOverride.length) ? currentState.countryOverride : currentState.country;
		displayCountry.style.color = activeTheme.text || activeTheme.textColor;
		displayCountry.style.fontFamily = currentState.countryFont;
		const countryHasText = !!displayCountry.textContent;
		displayCountry.style.display = (currentState.showCountry !== false && countryHasText) ? 'block' : 'none';
	}

	displayCoords.textContent = formatCoords(currentState.lat, currentState.lon);
	displayCoords.style.color = activeTheme.text || activeTheme.textColor;
	displayCoords.style.fontFamily = currentState.coordsFont;
	displayCoords.style.display = (currentState.showCoords !== false) ? '' : 'none';

	if (overlay) {
		const size = currentState.overlaySize || 'medium';
		if (size === 'none') {
			overlay.style.display = 'none';
			if (overlayBg) {
				overlayBg.style.display = 'none';
				overlayBg.style.backdropFilter = '';
				overlayBg.style.webkitBackdropFilter = '';
			}
			const bgTypeNone = currentState.overlayBgType || 'vignette';
			const colorNone = activeTheme.background || activeTheme.bg || activeTheme.overlayBg || '#ffffff';
			if (vignetteOverlay) {
				if (bgTypeNone === 'vignette') {
					vignetteOverlay.style.display = '';
					vignetteOverlay.style.opacity = '1';
					const colorSolid = hexToRgba(colorNone, 1);
					const colorTrans = hexToRgba(colorNone, 0);
					vignetteOverlay.style.background = `linear-gradient(to bottom, ${colorSolid} 0%, ${colorSolid} 3%, ${colorTrans} 20%, ${colorTrans} 80%, ${colorSolid} 97%, ${colorSolid} 100%)`;
				} else if (bgTypeNone === 'radial') {
					vignetteOverlay.style.display = '';
					vignetteOverlay.style.opacity = '1';
					const colorSolid = hexToRgba(colorNone, 1);
					const colorTrans = hexToRgba(colorNone, 0);
					vignetteOverlay.style.background = `radial-gradient(circle, ${colorTrans} 0%, ${colorTrans} 20%, ${hexToRgba(colorNone, 0.4)} 70%, ${colorSolid} 100%)`;
				} else {
					vignetteOverlay.style.display = 'none';
					vignetteOverlay.style.opacity = '0';
					vignetteOverlay.style.background = '';
				}
			}
		} else {
			overlay.style.display = '';
			applyPosterTextLayout({ overlay, city: displayCity, country: displayCountry, coords: displayCoords, divider, attribution }, currentState);

			const overlayX = currentState.overlayX !== undefined ? currentState.overlayX : 0.5;
			const overlayY = currentState.overlayY !== undefined ? currentState.overlayY : 0.85;
			overlay.style.right = '';
			overlay.style.bottom = '';
			overlay.style.transform = 'translate(-50%, -50%)';
			overlay.style.maxWidth = '90%';
			overlay.style.width = 'max-content';

			overlay.style.left = `${overlayX * 100}%`;
			overlay.style.top = `${overlayY * 100}%`;
			{
				const EDGE = 8;
				const cW = posterContainer.offsetWidth;
				const cH = posterContainer.offsetHeight;
				const oW = overlay.offsetWidth;
				const oH = overlay.offsetHeight;
				if (cW > 0 && cH > 0 && oW > 0 && oH > 0) {
					const cx = Math.max((oW / 2 + EDGE) / cW, Math.min(1 - (oW / 2 + EDGE) / cW, overlayX));
					const cy = Math.max((oH / 2 + EDGE) / cH, Math.min(1 - (oH / 2 + EDGE) / cH, overlayY));
					overlay.style.left = `${cx * 100}%`;
					overlay.style.top = `${cy * 100}%`;
				}
			}

			const bgType = currentState.overlayBgType || 'vignette';
			const color = activeTheme.background || activeTheme.bg || activeTheme.overlayBg || '#ffffff';

			if (overlayBg) {
				overlayBg.style.display = 'none';
				overlayBg.style.backdropFilter = '';
				overlayBg.style.webkitBackdropFilter = '';
			}

			if (vignetteOverlay) {
				if (bgType === 'vignette') {
					vignetteOverlay.style.display = '';
					vignetteOverlay.style.opacity = '1';
					const colorSolid = hexToRgba(color, 1);
					const colorTrans = hexToRgba(color, 0);
					vignetteOverlay.style.background = `linear-gradient(to bottom, ${colorSolid} 0%, ${colorSolid} 3%, ${colorTrans} 20%, ${colorTrans} 80%, ${colorSolid} 97%, ${colorSolid} 100%)`;
				} else if (bgType === 'radial') {
					vignetteOverlay.style.display = '';
					vignetteOverlay.style.opacity = '1';
					const colorSolid = hexToRgba(color, 1);
					const colorTrans = hexToRgba(color, 0);
					vignetteOverlay.style.background = `radial-gradient(circle, ${colorTrans} 0%, ${colorTrans} 20%, ${hexToRgba(color, 0.4)} 70%, ${colorSolid} 100%)`;
				} else {
					vignetteOverlay.style.display = 'none';
				}
			}
		}
	}
	if (divider) {
		divider.style.backgroundColor = activeTheme.text || activeTheme.textColor;
		const countryVisible = currentState.showCountry !== false && !!(displayCountry && displayCountry.textContent);
		const coordsVisible = currentState.showCoords !== false;
		divider.style.display = (countryVisible || coordsVisible) ? '' : 'none';
	}
	if (attribution) {
		attribution.style.color = activeTheme.text || activeTheme.textColor;
	}

	updateMarkerStyles(currentState);

	if (sizeChanged || matChanged) {
		setTimeout(() => {
			invalidateMapSize();
			updateMapPosition(currentState.lat, currentState.lon, currentState.zoom, { animate: false });
		}, 350);

		setTimeout(() => {
			invalidateMapSize();
			updateMapPosition(currentState.lat, currentState.lon, currentState.zoom, { animate: false });
		}, 550);
	}
}
