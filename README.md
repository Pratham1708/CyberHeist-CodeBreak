# 🕶️ Cyber Heist: CodeBreaker

[![Watch the Demo](https://img.youtube.com/vi/xFh2nihZx2A/maxresdefault.jpg)](https://www.youtube.com/watch?v=xFh2nihZx2A)

A fast-paced 2D/3D stealth puzzle game built with React, TypeScript, and Vite, where players infiltrate cyberpunk megastructures, dodge enemy bots, and hack terminals to escape.

🌐 [Play Live →](https://cyberheistcodebreak.netlify.app/)

---

## 🚀 Inspiration

Inspired by stealth games and cyberpunk aesthetics, *Cyber Heist: CodeBreaker* challenges your logic and reflexes. The goal is to blend puzzle-solving with simple AI evasion in a visually immersive, minimal UI-first gameplay loop.

---

## 🧠 What It Does

- Navigate through a dark futuristic grid using WASD keys  
- Avoid patrolling enemy bots with different AI patterns  
- Interact with glowing terminals to solve Simon Says-style memory puzzles  
- Unlock doors and escape before being detected  
- Survive increasing difficulty across levels, including **Speed Mode** and **Chaos AI**

---

## 🛠️ How We Built It

- **React + TypeScript**: Core game mechanics and UI rendering  
- **Tailwind CSS**: Neon cyberpunk styling and UI effects  
- **Lucide Icons**: Dynamic SVG icons for in-game visuals  
- **Vite**: Fast local dev server and optimized build pipeline  
- **Netlify**: One-click deployment  

---

## 🚧 Challenges We Ran Into

- Smooth enemy AI pathing for various patterns (diagonal, circular, random)  
- Dynamic difficulty scaling (speed boosts, detection radius adjustments)  
- Preventing input lag during hacking sequences  
- Making the gameplay fun yet minimal — no external libraries or engines  

---

## 🏆 Accomplishments We're Proud Of

- Modular game loop with escalating difficulty phases  
- Fully keyboard-based gameplay with intuitive controls  
- No external engines — pure React game logic  
- Game aesthetics designed for cyberpunk immersion  

---

## 📚 What We Learned

- Advanced use of React state to simulate real-time gameplay  
- Creating circular and randomized pathing without game engines  
- Managing UI/game state transitions efficiently  
- Layering effects like detection zones, glow, and pulsing without canvas/WebGL  

---

## 🔮 What's Next for Cyber Heist: CodeBreaker

- ✅ More AI bot types and double-bot challenge  
- ✅ Level-based scoring and leaderboard  
- ⏳ Sound effects and background score  
- ⏳ VR/WebXR mode (Unity or A-Frame)  
- ⏳ Save progress with Supabase or Firebase  
- ⏳ Speedrun timer + challenge mode  

---

## 🧰 Built With

| Tech               | Purpose                          |
|--------------------|----------------------------------|
| React + TypeScript | Core game structure              |
| Tailwind CSS       | Styling & visual effects         |
| Vite               | Lightning-fast dev + build       |
| Lucide React       | Icons (Terminal, Door, Bot Eye)  |
| Netlify            | Hosting and deployment           |
| GitHub             | Version control + open source    |

---

## 🎮 Controls

- `W A S D` – Move  
- `E` – Interact / Hack Terminal  
- `ESC` – Restart Level  

---

## 📦 Run Locally

```bash
git clone https://github.com/Pratham1708/CyberHeist-CodeBreak.git
cd CyberHeist-CodeBreak
npm install
npm run dev
