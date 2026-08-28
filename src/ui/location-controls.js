export function setupLocationControls(
	state,
	updateState,
	updateMapPosition,
	updateMarkerStyles,
	updateRouteGeometry,
	updateRouteStyles,
	searchLocation,
	formatCoords
) {
	const searchInput = document.getElementById('search-input');
	const searchResults = document.getElementById('search-results');
	const searchLoading = document.getElementById('search-loading');
	const latInput = document.getElementById('lat-input');
	const lonInput = document.getElementById('lon-input');
	const cityOverrideInput = document.getElementById('city-override-input');
	const countryOverrideInput = document.getElementById('country-override-input');
	const cityFontSelect = document.getElementById('city-font-select');
	const countryFontSelect = document.getElementById('country-font-select');
	const coordsFontSelect = document.getElementById('coords-font-select');
	const zoomSlider = document.getElementById('zoom-slider');
	const zoomValue = document.getElementById('zoom-value');
	const toggleCountryBtn = document.getElementById('toggle-country-btn');
	const toggleCoordsBtn = document.getElementById('toggle-coords-btn');

	let searchTimeout;
	let currentSearchController = null;
	let searchRequestId = 0;

	searchInput?.addEventListener('input', (event) => {
		clearTimeout(searchTimeout);
		const query = event.target.value;
		if (!query || query.length < 2) {
			searchResults?.classList.add('hidden');
			if (currentSearchController) {
				try { currentSearchController.abort(); } catch (error) { }
				currentSearchController = null;
			}
			return;
		}

		searchTimeout = setTimeout(async () => {
			if (currentSearchController) {
				try { currentSearchController.abort(); } catch (error) { }
			}
			const controller = new AbortController();
			currentSearchController = controller;
			const thisRequestId = ++searchRequestId;
			searchLoading?.classList.remove('hidden');

			let results = [];
			try {
				results = await searchLocation(query, { limit: 15, signal: controller.signal });
			} catch (error) {
				results = [];
			}

			if (thisRequestId !== searchRequestId) return;
			searchLoading?.classList.add('hidden');
			if (results?.length) {
				searchResults.innerHTML = results.map((result) => `
		  <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" data-lat="${result.lat}" data-lon="${result.lon}" data-name="${result.shortName}" data-country="${result.country || ''}">
			${result.name}
		  </div>
		`).join('');
				searchResults.classList.remove('hidden');
			} else {
				searchResults.classList.add('hidden');
			}
			if (currentSearchController === controller) currentSearchController = null;
		}, 1000);
	});

	let lastSelectionAt = 0;
	function selectResultElement(item) {
		const lat = parseFloat(item.dataset.lat);
		const lon = parseFloat(item.dataset.lon);
		const name = item.dataset.name;
		const country = item.dataset.country;

		updateState({
			city: (name || '').toUpperCase(),
			country: (country || '').toUpperCase(),
			lat,
			lon,
			markers: [{ lat, lon }],
			routeStartLat: lat,
			routeStartLon: lon,
			routeEndLat: lat - 0.005,
			routeEndLon: lon + 0.005,
			routeViaPoints: [],
			routeGeometry: []
		});
		updateMapPosition(lat, lon);
		updateMarkerStyles(state);
		if (state.showRoute) {
			updateRouteGeometry().then(() => updateRouteStyles(state));
		}
		searchInput.value = name;
		searchResults.classList.add('hidden');
		lastSelectionAt = Date.now();
	}

	searchResults?.addEventListener('pointerdown', (event) => {
		const item = event.target.closest('[data-lat]');
		if (item) {
			selectResultElement(item);
			event.preventDefault();
		}
	});
	searchResults?.addEventListener('click', (event) => {
		if (Date.now() - lastSelectionAt < 500) return;
		const item = event.target.closest('[data-lat]');
		if (item) selectResultElement(item);
	});

	latInput?.addEventListener('change', (event) => {
		const lat = parseFloat(event.target.value);
		const markers = [...(state.markers || [])];
		if (markers.length > 0) markers[0].lat = lat;
		updateState({ lat, markers });
		updateMapPosition(lat, state.lon);
		updateMarkerStyles(state);
	});
	lonInput?.addEventListener('change', (event) => {
		const lon = parseFloat(event.target.value);
		const markers = [...(state.markers || [])];
		if (markers.length > 0) markers[0].lon = lon;
		updateState({ lon, markers });
		updateMapPosition(state.lat, lon);
		updateMarkerStyles(state);
	});

	cityOverrideInput?.addEventListener('input', (event) => updateState({ cityOverride: event.target.value ? event.target.value.toUpperCase() : '' }));
	countryOverrideInput?.addEventListener('input', (event) => updateState({ countryOverride: event.target.value ? event.target.value.toUpperCase() : '' }));
	toggleCountryBtn?.addEventListener('click', () => updateState({ showCountry: !state.showCountry }));
	toggleCoordsBtn?.addEventListener('click', () => updateState({ showCoords: !state.showCoords }));
	cityFontSelect?.addEventListener('change', (event) => updateState({ cityFont: event.target.value }));
	countryFontSelect?.addEventListener('change', (event) => updateState({ countryFont: event.target.value }));
	coordsFontSelect?.addEventListener('change', (event) => updateState({ coordsFont: event.target.value }));

	function sanitizeCoordInput(value) {
		if (!value) return value;
		let cleaned = String(value).replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
		const hasMinus = cleaned.indexOf('-') !== -1;
		cleaned = cleaned.replace(/\-/g, '');
		if (hasMinus) cleaned = '-' + cleaned;
		const firstDot = cleaned.indexOf('.');
		if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
		return cleaned;
	}

	[latInput, lonInput].forEach((input) => input?.addEventListener('input', (event) => {
		const cleaned = sanitizeCoordInput(event.target.value);
		if (cleaned !== event.target.value) event.target.value = cleaned;
	}));
	zoomSlider?.addEventListener('input', (event) => {
		const zoom = parseInt(event.target.value);
		updateState({ zoom });
		updateMapPosition(undefined, undefined, zoom);
	});

	return (currentState) => {
		if (cityOverrideInput) cityOverrideInput.value = currentState.cityOverride || '';
		if (countryOverrideInput) countryOverrideInput.value = currentState.countryOverride || '';
		if (cityFontSelect) cityFontSelect.value = currentState.cityFont;
		if (countryFontSelect) countryFontSelect.value = currentState.countryFont;
		if (coordsFontSelect) coordsFontSelect.value = currentState.coordsFont;
		if (latInput) latInput.value = currentState.lat.toFixed(6);
		if (lonInput) lonInput.value = currentState.lon.toFixed(6);
		if (zoomSlider) zoomSlider.value = currentState.zoom;
		if (zoomValue) zoomValue.textContent = currentState.zoom;

		const eyeOpen = '<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>';
		const eyeClosed = '<svg class="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>';
		if (toggleCountryBtn) toggleCountryBtn.innerHTML = currentState.showCountry !== false ? eyeOpen : eyeClosed;
		if (toggleCoordsBtn) toggleCoordsBtn.innerHTML = currentState.showCoords !== false ? eyeOpen : eyeClosed;
	};
}