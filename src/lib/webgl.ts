export function checkWebGL() {
	if(window.WebGLRenderingContext) {
		const canvas = document.createElement("canvas");
		try {
			const ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");
			if(ctx && typeof ctx.getParameter == "function") {
				return true;
			}
		} catch(e) {
			// Supported, but disabled
			alert("WebGL is supported but disabled in your browser. Please enable it in your settings.")
		}
		return false;
	}
	// WebGL is not supported
	alert("WebGL is not supported in your browser. Please try a different browser.");
	return false;
}