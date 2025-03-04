export async function fireConfetti() {
	const { default: confetti } = await import('canvas-confetti')
	// Left cannon
	confetti({
		particleCount: 200,
		spread: 70,
		origin: { x: 0, y: 0.5 },
		angle: 60
	})

	// Right cannon
	confetti({
		particleCount: 200,
		spread: 70,
		origin: { x: 1, y: 0.5 },
		angle: 120
	})

	// Mobile top spray
	if (window.innerWidth < 768) {
		confetti({
			particleCount: 100,
			spread: 100,
			origin: { x: 0.5, y: 0 },
			gravity: 1.2,
			scalar: 0.7
		})
	}
}
