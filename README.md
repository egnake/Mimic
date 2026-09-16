<div align="center">
  <img src="./public/favicon.ico" width="128" alt="Mimic Logo">
  <h1>Mimic</h1>
  <p><strong>Advanced Physical Key Decoding & Cryptanalysis Suite</strong></p>

  <p>
    <a href="https://github.com/egnake/Mimic/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
    </a>
    <img src="https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?logo=tailwind-css" alt="Tailwind CSS">
  </p>
</div>

<br />

**Mimic** is a browser-based, high-precision physical key decoder and replication suite. Inspired by professional locksmithing tools and hardware security research, Mimic allows users to trace key bittings from physical photos using a sub-pixel accurate calibration editor. 

It features a dynamic SVG geometry engine that visualizes standard, round, and hexagonal (Schlage) key profiles in real-time. Extracted bittings can be exported as mathematically flawless 3D models (OpenSCAD/STL) ready for 3D printing and CNC replication.

## ✨ Features

- **📸 Optical Key Decoding:** Upload a photo of any standard physical key. Align the shoulder and use the interactive grid to perfectly trace the physical depths.
- **🎯 Sub-Pixel Precision:** Calibrate pin spacing and offsets with `0.1` unit accuracy for mathematically flawless keyway alignment. Free-axis nudging compensates for perspective distortion in photographs.
- **🔄 Live Geometry Rendering:** See your key dynamically reconstructed in 2D vector graphics. Accurately calculates true V-cut boolean intersections, dynamic blade lengths, and taper angles based on real Schlage standards.
- **🏗️ Flawless 3D Export (SCAD):** Translate visual bitting data into mathematically exact 3D models. Outputs OpenSCAD scripts with realistic warding profiles, ready for rendering into STL format for 3D printing.
- **💾 Profile Management:** Save, organize, and export your decoded keys locally using the built-in PWA capabilities.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/egnake/Mimic.git
   cd Mimic
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

Mimic comes with a multi-stage `Dockerfile` optimized for Next.js standalone mode.

```bash
docker build -t mimic-app .
docker run -p 3000:3000 mimic-app
```

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Dark Theme variables
- **State Management:** Zustand
- **PWA:** next-pwa
- **Icons:** Lucide React

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<div align="center">
  <i>"Translating physical security into flawless digital geometry."</i>
</div>
