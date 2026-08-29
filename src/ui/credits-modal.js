export function setupCreditsModal() {
    const logoBtn = document.getElementById('logo-btn');
    const creditsModal = document.getElementById('credits-modal');
    const closeCredits = document.getElementById('close-credits');
    const creditsOverlay = document.getElementById('credits-overlay');

    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            if (creditsModal) {
                creditsModal.classList.add('show');
            }
        });
    }

    const closeCreditsFunctions = [closeCredits, creditsOverlay];

    closeCreditsFunctions.forEach(el => {
        if (el) {
            el.addEventListener('click', () => {
                if (creditsModal) {
                    creditsModal.classList.remove('show');
                }
            });
        }
    });
}