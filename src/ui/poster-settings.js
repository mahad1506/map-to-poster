import { outputPresets } from '../core/output-presets.js';

const MAX_RESOLUTION = 50000;

export function setupPosterSettings(state, updateState, defaultState) {
	const presetBtns = document.querySelectorAll('.preset-btn');
	const customW = document.getElementById('custom-w');
	const customH = document.getElementById('custom-h');
	const matToggle = document.getElementById('mat-toggle');
	const matSettings = document.getElementById('mat-settings');
	const matWidthSlider = document.getElementById('mat-width-slider');
	const matWidthValue = document.getElementById('mat-width-value');
	const matBorderToggle = document.getElementById('mat-border-toggle');
	const matBorderSettings = document.getElementById('mat-border-settings');
	const matBorderWidthSlider = document.getElementById('mat-border-width-slider');
	const matBorderWidthValue = document.getElementById('mat-border-width-value');
	const matBorderOpacitySlider = document.getElementById('mat-border-opacity-slider');
	const matBorderOpacityValue = document.getElementById('mat-border-opacity-value');

	matToggle?.addEventListener('change', (event) => {
		updateState({ matEnabled: event.target.checked });
	});

	matWidthSlider?.addEventListener('input', (event) => {
		updateState({ matWidth: parseInt(event.target.value) });
	});

	matBorderToggle?.addEventListener('change', (event) => {
		updateState({ matShowBorder: event.target.checked });
	});

	matBorderWidthSlider?.addEventListener('input', (event) => {
		updateState({ matBorderWidth: parseInt(event.target.value) });
	});

	matBorderOpacitySlider?.addEventListener('input', (event) => {
		updateState({ matBorderOpacity: parseFloat(event.target.value) });
	});

	presetBtns.forEach((button) => {
		button.addEventListener('click', () => {
			updateState({
				width: parseInt(button.dataset.width),
				height: parseInt(button.dataset.height),
			});
		});
	});

	customW?.addEventListener('change', (event) => {
		let value = parseInt(event.target.value) || state.width;
		if (value > MAX_RESOLUTION) value = MAX_RESOLUTION;
		updateState({ width: value });
	});

	customH?.addEventListener('change', (event) => {
		let value = parseInt(event.target.value) || state.height;
		if (value > MAX_RESOLUTION) value = MAX_RESOLUTION;
		updateState({ height: value });
	});

	function resetSettings() {
		if (confirm('Are you sure you want to reset all settings?')) {
			updateState(defaultState);
		}
	}

	document.getElementById('reset-settings-btn')?.addEventListener('click', resetSettings);
	['mobile-reset-a-btn', 'mobile-reset-b-btn', 'mobile-reset-c-btn'].forEach((id) => {
		document.getElementById(id)?.addEventListener('click', resetSettings);
	});

	return (currentState) => {
		if (customW) customW.value = currentState.width;
		if (customH) customH.value = currentState.height;

		if (matToggle) matToggle.checked = !!currentState.matEnabled;
		if (matSettings) matSettings.classList.toggle('hidden', !currentState.matEnabled);
		if (matWidthSlider) matWidthSlider.value = currentState.matWidth || 40;
		if (matWidthValue) matWidthValue.textContent = `${currentState.matWidth || 40}px`;
		if (matBorderToggle) matBorderToggle.checked = !!currentState.matShowBorder;

		if (matBorderSettings) {
			matBorderSettings.classList.toggle('hidden', !(currentState.matEnabled && currentState.matShowBorder));
		}
		if (matBorderWidthSlider) matBorderWidthSlider.value = currentState.matBorderWidth || 1;
		if (matBorderWidthValue) matBorderWidthValue.textContent = `${currentState.matBorderWidth || 1}px`;
		if (matBorderOpacitySlider) matBorderOpacitySlider.value = currentState.matBorderOpacity || 1;
		if (matBorderOpacityValue) matBorderOpacityValue.textContent = `${Math.round((currentState.matBorderOpacity || 1) * 100)}%`;

		let isMainPresetActive = false;
		presetBtns.forEach((button) => {
			const isActive = parseInt(button.dataset.width) === currentState.width
				&& parseInt(button.dataset.height) === currentState.height;
			button.classList.toggle('bg-accent', isActive);
			button.classList.toggle('text-white', isActive);
			button.classList.toggle('bg-slate-50', !isActive);
			if (isActive) isMainPresetActive = true;
		});

		const otherPresetsBtn = document.getElementById('other-presets-btn');
		if (otherPresetsBtn) {
			otherPresetsBtn.classList.toggle('bg-accent', !isMainPresetActive);
			otherPresetsBtn.classList.toggle('text-white', !isMainPresetActive);
			otherPresetsBtn.classList.toggle('bg-slate-50', isMainPresetActive);
		}
	};
}