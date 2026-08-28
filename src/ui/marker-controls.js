export function setupMarkerControls(state, updateState, updateMarkerStyles) {
	const markerToggle = document.getElementById('show-marker-toggle');
	const markerSettings = document.getElementById('marker-settings');
	const markerIconSelect = document.getElementById('marker-icon-select');
	const markerSizeSlider = document.getElementById('marker-size-slider');
	const markerSizeValue = document.getElementById('marker-size-value');

	markerIconSelect?.addEventListener('change', (event) => {
		updateState({ markerIcon: event.target.value });
		updateMarkerStyles(state);
	});

	markerSizeSlider?.addEventListener('input', (event) => {
		const size = parseInt(event.target.value);
		updateState({ markerSize: size / 40.0 });
		updateMarkerStyles(state);
		if (markerSizeValue) markerSizeValue.textContent = `${size}px`;
	});

	markerToggle?.addEventListener('change', (event) => {
		const show = event.target.checked;
		if (show && (!state.markers || state.markers.length === 0)) {
			updateState({ markers: [{ lat: state.lat, lon: state.lon }] });
		}
		updateState({ showMarker: show });
		updateMarkerStyles(state);
		markerSettings?.classList.toggle('hidden', !show);
	});

	document.getElementById('add-marker-btn')?.addEventListener('click', () => {
		const markers = [...(state.markers || []), { lat: state.lat, lon: state.lon }];
		updateState({ markers });
		updateMarkerStyles(state);
	});

	document.getElementById('remove-marker-btn')?.addEventListener('click', () => {
		const markers = [...(state.markers || [])];
		if (markers.length === 0) return;
		markers.pop();
		updateState({ markers });
		updateMarkerStyles(state);
	});

	document.getElementById('clear-markers-btn')?.addEventListener('click', () => {
		updateState({ markers: [], showMarker: false });
		if (markerToggle) markerToggle.checked = false;
		updateMarkerStyles(state);
		markerSettings?.classList.add('hidden');
	});

	return (currentState) => {
		if (markerToggle) markerToggle.checked = !!currentState.showMarker;
		if (markerSettings) markerSettings.classList.toggle('hidden', !currentState.showMarker);

		const markerCountDisplay = document.getElementById('marker-count');
		if (markerCountDisplay) markerCountDisplay.textContent = (currentState.markers || []).length;

		if (markerIconSelect) markerIconSelect.value = currentState.markerIcon || 'pin';
		if (markerSizeSlider) markerSizeSlider.value = Math.round((currentState.markerSize || 1) * 40);
		if (markerSizeValue) markerSizeValue.textContent = `${Math.round((currentState.markerSize || 1) * 40)}px`;
	};
}