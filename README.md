# TrafficCue

**FOSS navigation for slow vehicles**  
⚡ Made for 45km/h rides, mopeds, light electric vehicles, and anything mainstream navigation ignores.

---

## 🚗 What is TrafficCue?

**TrafficCue** is a FOSS navigation app built for vehicles that max out at 45 km/h, so mopeds, microcars, LEVs, and the like (but not limited to them!).
Mainstream navigation often routes these vehicles onto roads they're not legally allowed to use. **We don’t.**

Built with **Svelte + Vite**, powered by **Capacitor** for mobile, and focused on _respectful routing_, **TrafficCue** fills the gap.

---

## ✨ Features

- ✅ Road-legal routing for 45 km/h vehicles
- 📱 Android support via Capacitor
- 🗺️ Offline-first map tiles (OpenStreetMap-based) 🔜
- 🧭 Turn-by-turn directions and maneuver cues
- 🚦 Road type filtering (e.g., block highways, tunnels, etc.) 🔜
- 🔐 No tracking, no ads, fully FOSS

---

## 📦 Tech Stack

- Frontend: [Svelte](https://svelte.dev)
- Mobile: [Capacitor](https://capacitorjs.com)
- Maps: OpenStreetMap tiles via MapLibre and OpenFreeMap
- Search: [Photon](https://photon.komoot.io)
- Routing: [Valhalla](https://valhalla.github.io/valhalla/)
- POI Info: Overpass API

---

## 🛠️ Installation

### 📱 Android

Grab the latest APK from the Releases section and sideload it. 🔜

### Web / PWA

You can also run TrafficCue as a PWA in your browser. Just visit the [TrafficCue Web App](#) and install it. 🔜

## 🗺️ Smarter Routing, Built Around Your Vehicle

TrafficCue doesn't assume you're driving a car. **You** tell it what you're driving.
You define your vehicle profile: legal max speed, actual max speed, vehicle type, and more.
Then trafficcue uses the Valhalla routing engine to generate routes that **make sense** for you.

That means no more being sent down motorroads on a 45 km/h moped, ever.
Your route, your rules.
