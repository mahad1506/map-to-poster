const TEXT_SCALE_REFERENCE = 1080;
const OVERLAY_SIZE_MULTIPLIER = {
	small: 0.75,
	medium: 1,
	large: 1.35,
};

const BASE_OVERLAY_TEXT = {
	pad: 48,
	city: 64,
	country: 20,
	coords: 16,
	gap: 12,
	cityGap: 40,
	dividerWidth: 128,
	dividerHeight: 1,
	attribution: 8,
	attributionOffset: 12,
};

function getPosterTextScale(width, height) {
	const shortestSide = Math.max(1, Math.min(width || TEXT_SCALE_REFERENCE, height || TEXT_SCALE_REFERENCE));
	return shortestSide / TEXT_SCALE_REFERENCE;
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function getOverlayTextConfig(width, height, size = 'medium') {
	const posterScale = getPosterTextScale(width, height);
	const sizeMultiplier = OVERLAY_SIZE_MULTIPLIER[size] || OVERLAY_SIZE_MULTIPLIER.medium;
	const scale = posterScale * sizeMultiplier;

	return {
		pad: clamp(BASE_OVERLAY_TEXT.pad * scale, 12, 480),
		city: clamp(BASE_OVERLAY_TEXT.city * scale, 28, 420),
		country: clamp(BASE_OVERLAY_TEXT.country * scale, 10, 150),
		coords: clamp(BASE_OVERLAY_TEXT.coords * scale, 9, 120),
		gap: clamp(BASE_OVERLAY_TEXT.gap * scale, 4, 90),
		cityGap: clamp(BASE_OVERLAY_TEXT.cityGap * scale, 12, 280),
		dividerWidth: clamp(BASE_OVERLAY_TEXT.dividerWidth * scale, 72, 900),
		dividerHeight: clamp(BASE_OVERLAY_TEXT.dividerHeight * scale, 1, 12),
		attribution: clamp(BASE_OVERLAY_TEXT.attribution * scale, 6, 72),
		attributionOffset: clamp(BASE_OVERLAY_TEXT.attributionOffset * scale, 8, 120),
	};
}

export function applyPosterTextLayout(elements, currentState) {
	const size = currentState.overlaySize || 'medium';
	const sizeConfig = getOverlayTextConfig(currentState.width, currentState.height, size);
	const overlayGap = sizeConfig.gap;

	if (elements.overlay) {
		elements.overlay.style.padding = `${sizeConfig.pad}px`;
		elements.overlay.style.gap = `${overlayGap}px`;
	}
	if (elements.city) {
		elements.city.style.fontSize = `${sizeConfig.city}px`;
		elements.city.style.lineHeight = '1.12';
		elements.city.style.margin = '0px';
	}
	if (elements.country) {
		elements.country.style.fontSize = `${sizeConfig.country}px`;
		elements.country.style.lineHeight = '1.2';
		elements.country.style.margin = '0px';
	}
	if (elements.coords) {
		elements.coords.style.fontSize = `${sizeConfig.coords}px`;
		elements.coords.style.lineHeight = '1.2';
		elements.coords.style.margin = '0px';
	}
	if (elements.divider) {
		elements.divider.style.width = `${sizeConfig.dividerWidth}px`;
		elements.divider.style.height = `${sizeConfig.dividerHeight}px`;
		elements.divider.style.margin = '0px';
	}
	if (elements.attribution) {
		const offset = sizeConfig.attributionOffset;
		elements.attribution.style.fontSize = `${sizeConfig.attribution}px`;
		elements.attribution.style.lineHeight = '1.2';
		elements.attribution.style.right = `${(currentState.matEnabled ? (currentState.matWidth || 0) : 0) + offset}px`;
		elements.attribution.style.bottom = `${(currentState.matEnabled ? (currentState.matWidth || 0) : 0) + offset}px`;
	}
}