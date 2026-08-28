export function setupOverlayControls(state, updateState) {
	const overlayBgButtons = document.querySelectorAll('.overlay-bg-btn');
	const overlaySizeButtons = document.querySelectorAll('.overlay-size-btn');
	const overlaySizeGroup = document.getElementById('overlay-size-group');
	const overlayPositionGroup = document.getElementById('overlay-position-group');
	const overlayPositionButtons = document.querySelectorAll('.overlay-pos-btn');
	const overlay = document.getElementById('poster-overlay');
	const posterContainer = document.getElementById('poster-container');

	overlayBgButtons.forEach((button) => {
		button.addEventListener('click', () => updateState({ overlayBgType: button.dataset.bg }));
	});

	if (overlaySizeGroup) {
		overlaySizeButtons.forEach((button) => {
			button.addEventListener('click', () => updateState({ overlaySize: button.dataset.size }));
		});
	}

	overlayPositionButtons.forEach((button) => {
		button.addEventListener('click', () => updateState({
			overlayX: parseFloat(button.dataset.overlayX),
			overlayY: parseFloat(button.dataset.overlayY),
		}));
	});

	document.getElementById('reset-overlay-pos-btn')?.addEventListener('click', () => {
		updateState({ overlayX: 0.5, overlayY: 0.85 });
	});

	if (overlay && posterContainer) {
		let isDragging = false;
		let dragStartClientX = 0;
		let dragStartClientY = 0;
		let dragStartOverlayX = 0.5;
		let dragStartOverlayY = 0.85;

		const startDrag = (clientX, clientY) => {
			if (state.overlaySize === 'none') return;
			isDragging = true;
			dragStartClientX = clientX;
			dragStartClientY = clientY;
			dragStartOverlayX = state.overlayX !== undefined ? state.overlayX : 0.5;
			dragStartOverlayY = state.overlayY !== undefined ? state.overlayY : 0.85;
			overlay.style.cursor = 'grabbing';
			document.body.style.userSelect = 'none';
		};

		const drag = (clientX, clientY) => {
			if (!isDragging) return;
			const rect = posterContainer.getBoundingClientRect();
			const dx = (clientX - dragStartClientX) / rect.width;
			const dy = (clientY - dragStartClientY) / rect.height;
			const edge = 8;
			const containerWidth = posterContainer.offsetWidth;
			const containerHeight = posterContainer.offsetHeight;
			const overlayWidth = overlay.offsetWidth;
			const overlayHeight = overlay.offsetHeight;
			const minX = containerWidth > 0 && overlayWidth > 0 ? (overlayWidth / 2 + edge) / containerWidth : 0.05;
			const maxX = containerWidth > 0 && overlayWidth > 0 ? 1 - (overlayWidth / 2 + edge) / containerWidth : 0.95;
			const minY = containerHeight > 0 && overlayHeight > 0 ? (overlayHeight / 2 + edge) / containerHeight : 0.05;
			const maxY = containerHeight > 0 && overlayHeight > 0 ? 1 - (overlayHeight / 2 + edge) / containerHeight : 0.95;
			updateState({
				overlayX: Math.max(minX, Math.min(maxX, dragStartOverlayX + dx)),
				overlayY: Math.max(minY, Math.min(maxY, dragStartOverlayY + dy)),
			});
		};

		const endDrag = () => {
			if (!isDragging) return;
			isDragging = false;
			overlay.style.cursor = '';
			document.body.style.userSelect = '';
		};

		overlay.addEventListener('mousedown', (event) => {
			startDrag(event.clientX, event.clientY);
			event.preventDefault();
		});
		document.addEventListener('mousemove', (event) => drag(event.clientX, event.clientY));
		document.addEventListener('mouseup', endDrag);
		overlay.addEventListener('touchstart', (event) => {
			if (event.touches.length === 1) {
				startDrag(event.touches[0].clientX, event.touches[0].clientY);
				event.preventDefault();
			}
		}, { passive: false });
		document.addEventListener('touchmove', (event) => {
			if (isDragging && event.touches.length === 1) {
				drag(event.touches[0].clientX, event.touches[0].clientY);
				event.preventDefault();
			}
		}, { passive: false });
		document.addEventListener('touchend', endDrag);
	}

	return (currentState) => {
		const currentX = currentState.overlayX !== undefined ? currentState.overlayX : 0.5;
		const currentY = currentState.overlayY !== undefined ? currentState.overlayY : 0.85;
		overlayPositionGroup?.classList.toggle('hidden', (currentState.overlaySize || 'medium') === 'none');
		const tolerance = 0.02;
		overlayPositionButtons.forEach((button) => {
			const active = Math.abs(currentX - parseFloat(button.dataset.overlayX)) < tolerance
				&& Math.abs(currentY - parseFloat(button.dataset.overlayY)) < tolerance;
			const dot = button.querySelector('.pos-dot');
			button.classList.toggle('border-accent', active);
			button.classList.toggle('bg-accent-light', active);
			button.classList.toggle('border-slate-100', !active);
			button.classList.toggle('bg-slate-50', !active);
			dot?.classList.toggle('bg-accent', active);
			dot?.classList.toggle('bg-slate-300', !active);
		});
		overlayBgButtons.forEach((button) => {
			const active = button.dataset.bg === (currentState.overlayBgType || 'vignette');
			button.classList.toggle('bg-accent', active);
			button.classList.toggle('text-white', active);
			button.classList.toggle('bg-slate-50', !active);
		});
		overlaySizeButtons.forEach((button) => {
			const active = button.dataset.size === (currentState.overlaySize || 'medium');
			button.classList.toggle('bg-accent', active);
			button.classList.toggle('text-white', active);
			button.classList.toggle('bg-slate-50', !active);
		});
	};
}
