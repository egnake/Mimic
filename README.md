<div align="center">
  <img src="https://raw.githubusercontent.com/egnake/Mimic/master/public/logo.jpg" width="200" alt="Mimic Logo">
  
  <h1>MIMIC</h1>
  <p><b>Advanced Physical Key Decoding & Cryptanalysis Framework</b></p>
  
  <p>
    <a href="https://github.com/egnake/Mimic/blob/master/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
    </a>
    <img src="https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript" alt="TypeScript">
  </p>
</div>

<br />

## Overview

**Mimic** is an advanced, high-precision physical cryptography and keyway analysis framework. Developed for physical security researchers, penetration testers, and locksmiths, Mimic translates the physical bitting depths of a key into mathematically flawless digital geometry. 

Through optical decoding and sub-pixel calibration, it enables the reverse engineering of physical keys from photographs. The extracted cryptographic parameters (bittings) are processed by a custom mathematical geometry engine that dynamically reconstructs standard, round, and hexagonal (Schlage) key profiles. The finalized geometry can be seamlessly exported into OpenSCAD (.SCAD) or STL formats for direct physical replication via CNC milling or high-resolution 3D printing.

## Core Capabilities

- **Optical Keyway Decoding:** Import photographs of physical keys and utilize an interactive, sub-pixel accurate calibration grid to align the key shoulder and extract physical depths with zero margin of error.
- **Mathematical Geometry Engine:** A highly specialized SVG rendering engine that calculates true V-cut boolean intersections, dynamic blade scaling, and geometrically correct tip taper angles based on real-world lock specifications.
- **Parametric 3D Modeling:** Translates optical bitting arrays into programmable solid 3D geometry. Generates procedural OpenSCAD scripts complete with accurate warding profiles for immediate physical manufacturing.
- **Distortion Compensation:** Advanced horizontal (X-axis) and vertical (Y-axis) free-axis pin nudging capabilities to compensate for perspective distortions and lens aberrations in imported reference photographs.

## Architecture & Technology Stack

The framework is constructed on a modern, highly performant web stack:

- **Core Engine:** Next.js 15 (App Router)
- **Language:** Strict TypeScript
- **State Management:** Zustand (Immutable state stores for calibration coordinates)
- **UI & Visualization:** React-based procedural SVG generation
- **Progressive Web App (PWA):** Fully functional in offline, isolated environments via `next-pwa`.

## Installation & Deployment

Mimic is built for high-security environments and can be run locally or completely isolated inside a Docker container.

### Option A: Local Development Environment

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/egnake/Mimic.git
   cd Mimic
   ```

2. Install dependencies via npm:
   ```bash
   npm install
   ```

3. Initialize the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the framework locally by navigating to `http://localhost:3000` in your web browser.

### Option B: Docker Containerization (Standalone Mode)

For penetration testing environments or isolated deployment, Mimic includes a multi-stage Docker configuration utilizing Next.js standalone mode.

1. Build the lightweight production container:
   ```bash
   docker build -t mimic-framework .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 mimic-framework
   ```
3. Access at `http://localhost:3000`.

## Operational Walkthrough

### Phase 1: Editor & Profile Setup
Start by selecting your target key profile (e.g., Standard Edge, Hexagonal Schlage). The Bitting Editor allows you to directly input known depths or initialize an optical decoding process.

<div align="center">
  <img src="https://raw.githubusercontent.com/egnake/Mimic/master/public/docs/editor.png" alt="Bitting Editor Interface" width="800">
</div>

### Phase 2: Optical Calibration (Physical Decoder)
Upload a top-down, well-lit photograph of the target key. Use the schematic overlay parameters (Zoom, X/Y Offset, Rotation, and Opacity) to perfectly align the physical key beneath the digital decoding grid.

<div align="center">
  <img src="https://raw.githubusercontent.com/egnake/Mimic/master/public/docs/calibration.png" alt="Photo Calibration Module" width="800">
</div>

### Phase 3: Geometry Alignment
Align the primary red axis (`SHOULDER`) precisely with the mechanical shoulder stop of the physical key. Use the individual pin spacing sliders to align the blue intersection nodes with the lowest points of the physical V-cuts. The system calculates perspective distortions and outputs the true bitting sequence.

<div align="center">
  <img src="https://raw.githubusercontent.com/egnake/Mimic/master/public/docs/grid.png" alt="Mathematical Grid Alignment" width="600">
</div>

### Phase 4: Export & Replication
Once decoded, evaluate the live SVG preview. Export the generated `.SCAD` file and process it through OpenSCAD to render a solid, printable `.STL`. The resulting geometry can be sent directly to 3D printers or CNC machines for physical bypass testing.

## Legal Disclaimer

Mimic is developed strictly for academic research, authorized penetration testing, and legitimate physical security auditing. The developers assume no liability and are not responsible for any misuse or damage caused by this software. Use responsibly and only on hardware you own or have explicit authorization to audit.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
