import { themes } from '../core/themes.js';
import { artisticThemes } from '../core/artistic-themes.js';

export function setupThemeControls(
	state,
	updateState,
	getSelectedTheme,
	getSelectedArtisticTheme,
	updateArtisticStyle,
	updateMapTheme,
	invalidateMapSize,
	updateMarkerStyles,
	updateRouteStyles,
	populateArtisticModal
) {
	const modeTile = document.getElementById('mode-tile');
	const modeArtistic = document.getElementById('mode-artistic');
	const standardThemeConfig = document.getElementById('standard-theme-config');
	const artisticThemeConfig = document.getElementById('artistic-theme-config');
	const labelsControl = document.getElementById('labels-control');
	const labelsToggle = document.getElementById('show-labels-toggle');
	const themeSelect = document.getElementById('theme-select');
	const artisticMainGrid = document.getElementById('artistic-main-grid');
	const artisticDesc = document.getElementById('artistic-desc');

	const paletteFor = (theme) => {
		const candidates = [theme.road_motorway, theme.road_primary, theme.road_secondary, theme.road_tertiary, theme.text, theme.bg];
		return candidates.map((color) => color || '#cccccc').slice(0, 4);
	};

	if (artisticMainGrid) {
		const mainKeys = ['cyber_noir', 'golden_era', 'mangrove_maze'];
		const makeCard = (key, theme, isOther = false) => {
			const palette = paletteFor(theme);
			const label = theme?.name || (isOther ? 'Custom Theme' : key);
			return `
				<button type="button" data-key="${key}" class="art-card group p-3 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center text-center hover:shadow-xl transition-all">
					<div class="flex items-center justify-center -space-x-2">
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${palette[0]}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${palette[1]}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${palette[2]}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${palette[3]}"></span>
					</div>
					<div class="mt-3 text-[11px] font-semibold text-slate-900">${label}</div>
				</button>
			`;
		};

		artisticMainGrid.innerHTML = mainKeys.map((key) => makeCard(key, artisticThemes[key] || {})).join('') + makeCard('other', { name: 'Other Theme' }, true);
		artisticMainGrid.querySelectorAll('.art-card').forEach((button) => {
			button.addEventListener('click', () => {
				const key = button.dataset.key;
				if (key === 'other') {
					const modal = document.getElementById('artistic-modal');
					modal?.classList.add('show');
					populateArtisticModal();
					return;
				}
				updateState({ artisticTheme: key });
				if (state.renderMode === 'artistic') {
					updateArtisticStyle(getSelectedArtisticTheme());
					updateRouteStyles(state);
				}
			});
		});
	}

	if (themeSelect) {
		themeSelect.innerHTML = Object.keys(themes)
			.sort((a, b) => (themes[a].name || a).localeCompare(themes[b].name || b))
			.map((key) => `<option value="${key}">${themes[key].name || key}</option>`)
			.join('\n');
	}

	modeTile?.addEventListener('click', () => {
		updateState({ renderMode: 'tile' });
		updateRouteStyles(state);
	});
	modeArtistic?.addEventListener('click', () => {
		updateState({ renderMode: 'artistic' });
		updateRouteStyles(state);
	});
	labelsToggle?.addEventListener('change', (event) => updateState({ showLabels: event.target.checked }));

	let themeChangeTimer = null;
	const applyThemeChange = (value) => {
		updateState({ theme: value });
		if (state.renderMode === 'tile') {
			const theme = getSelectedTheme();
			if (theme?.tileUrl) updateMapTheme(theme.tileUrl);
			invalidateMapSize();
			updateRouteStyles(state);
			updateMarkerStyles(state);
		}
	};
	themeSelect?.addEventListener('change', (event) => {
		clearTimeout(themeChangeTimer);
		themeChangeTimer = setTimeout(() => applyThemeChange(event.target.value), 120);
	});
	themeSelect?.addEventListener('input', (event) => {
		clearTimeout(themeChangeTimer);
		themeChangeTimer = setTimeout(() => applyThemeChange(event.target.value), 120);
	});

	return (currentState) => {
		const isTile = currentState.renderMode === 'tile';
		if (modeTile) modeTile.className = `flex-1 py-2 text-xs font-bold rounded-lg ${isTile ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`;
		if (modeArtistic) modeArtistic.className = `flex-1 py-2 text-xs font-bold rounded-lg ${isTile ? 'text-slate-500 hover:text-slate-900' : 'bg-accent text-white shadow-sm'}`;
		standardThemeConfig?.classList.toggle('hidden', !isTile);
		artisticThemeConfig?.classList.toggle('hidden', isTile);
		labelsControl?.classList.toggle('hidden', !isTile);
		if (labelsToggle) labelsToggle.checked = !!currentState.showLabels;
		if (themeSelect) themeSelect.value = currentState.theme;
		if (artisticDesc) artisticDesc.textContent = getSelectedArtisticTheme().description;

		const mainKeys = new Set(['cyber_noir', 'golden_era', 'mangrove_maze']);
		const selectedKey = currentState.artisticTheme;
		artisticMainGrid?.querySelectorAll('.art-card').forEach((button) => {
			const key = button.dataset.key;
			const active = key === 'other' ? !!selectedKey && !mainKeys.has(selectedKey) : key === selectedKey;
			button.classList.toggle('border-accent', active);
			button.classList.toggle('bg-accent-light', active);
			button.classList.toggle('ring-accent', active);
			if (key === 'other') {
				const activeTheme = getSelectedArtisticTheme();
				const palette = selectedKey && !mainKeys.has(selectedKey) ? paletteFor(activeTheme) : ['#cccccc', '#cccccc', '#cccccc', '#cccccc'];
				button.querySelectorAll('span.w-6.h-6').forEach((span, index) => { span.style.background = palette[index]; });
			}
		});
	};
}
