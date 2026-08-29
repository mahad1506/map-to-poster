import { state, updateState, defaultState, getSelectedTheme, getSelectedArtisticTheme } from '../core/state.js';
import { hexToRgba } from '../core/utils.js';
import { applyPosterTextLayout } from './poster-text-layout.js';
import { setupPosterSettings } from './poster-settings.js';
import { setupMarkerControls } from './marker-controls.js';
import { setupRouteControls } from './route-controls.js';
import { outputPresets } from '../core/output-presets.js';
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
import { setupCreditsModal } from './credits-modal.js';


export function setupControls() {
	const exportBtn = document.getElementById('export-btn');
	const syncPosterSettings = setupPosterSettings(state, updateState, defaultState);
	const syncMarkerControls = setupMarkerControls(state, updateState, updateMarkerStyles);
	const syncRouteControls = setupRouteControls(state, updateState, updateRouteGeometry, updateRouteStyles);
	const syncLocationControls = setupLocationControls(state, updateState, updateMapPosition, updateMarkerStyles, updateRouteGeometry, updateRouteStyles, searchLocation, formatCoords);
	const customThemeModal = setupCustomThemeModal(state, updateState, getSelectedArtisticTheme, updateArtisticStyle, updateRouteStyles);
	const syncThemeControls = setupThemeControls(state, updateState, getSelectedTheme, getSelectedArtisticTheme, updateArtisticStyle, updateMapTheme, invalidateMapSize, updateMarkerStyles, updateRouteStyles, customThemeModal.populateArtisticModal);
	const syncOverlayControls = setupOverlayControls(state, updateState);
	const syncPresetControls = setupPresetsModal(state, updateState, outputPresets);
	const syncCreditsControls = setupCreditsModal();
		

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
