import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

if(location.href.includes("/login/callback")) {
	const url = new URL(location.href);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	if(code && state) {
		window.opener.postMessage({
			code, state
		}, window.location.origin);
		window.close();
	}
}

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
