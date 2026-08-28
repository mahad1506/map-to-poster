export function setupRouteControls(state, updateState, updateRouteGeometry, updateRouteStyles) {
	const routeToggle = document.getElementById('show-route-toggle');
	const routeSettings = document.getElementById('route-settings');

	routeToggle?.addEventListener('change', async (event) => {
		const show = event.target.checked;

		if (show) {
			updateState({
				routeStartLat: state.lat,
				routeStartLon: state.lon,
				routeEndLat: state.lat - 0.005,
				routeEndLon: state.lon + 0.005,
				routeViaPoints: [],
			});
			await updateRouteGeometry();
		}

		updateState({ showRoute: show });
		routeSettings?.classList.toggle('hidden', !show);
		updateRouteStyles(state);
	});

	document.getElementById('reset-route-btn')?.addEventListener('click', async () => {
		updateState({ routeViaPoints: [] });
		await updateRouteGeometry();
		updateRouteStyles(state);
	});

	return (currentState) => {
		if (routeToggle) routeToggle.checked = !!currentState.showRoute;
		if (routeSettings) routeSettings.classList.toggle('hidden', !currentState.showRoute);

		const routeCountDisplay = document.getElementById('route-count');
		if (routeCountDisplay) {
			routeCountDisplay.textContent = 2 + (currentState.routeViaPoints || []).length;
		}
	};
}