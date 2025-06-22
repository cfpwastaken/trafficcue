const knownDirections = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

export async function displayLane(lane: Lane) {
	const laneDiv = document.createElement("div");
	laneDiv.className = "lane";
	// Fetch all direction images from the bitmask
	for (let i = 0; i < 10; i++) {
		if (lane.directions & (1 << i)) {
			const bit = 1 << i;
			// Check if the bit is in the known directions
			let img = "";
			if (knownDirections.includes(bit)) {
				img = await fetch(`/img/lanes/${bit}.svg`).then((res) => res.text());
			} else {
				img = `<span>${bit}</span>`;
			}
			const isValid = lane.valid & bit;
			const isActive = lane.active & bit;
			// Create a DOM element
			const laneImage = document.createElement("div");
			laneImage.className = "lane-image";
			laneImage.innerHTML = img;
			// Add the class to the laneDiv
			if (isValid) {
				laneImage.classList.add("valid");
			}
			if (isActive) {
				laneImage.classList.add("active");
			}
			// Add the lane image to the lane div
			laneDiv.appendChild(laneImage);
		}
	}
	return laneDiv;
}
