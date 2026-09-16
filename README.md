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

### Local Development

1. Clone the repository to your local environment:
   ```bash
   git clone https://github.com/egnake/Mimic.git
   cd Mimic
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the development environment:
   ```bash
   npm run dev
   ```

### Docker Containerization

For isolated penetration testing environments or secure deployment, Mimic includes a multi-stage Docker configuration utilizing Next.js standalone mode.

```bash
docker build -t mimic-framework .
docker run -p 3000:3000 mimic-framework
```

## Usage Guidelines

1. **Import:** Navigate to the main editor and upload a clear, top-down photograph of the target key.
2. **Calibrate:** Align the primary axes (shoulder reference point, blade axis). Adjust the `Pin Spacing` and `First Pin Offset` parameters to precisely intersect the physical bittings.
3. **Decode:** Determine the bitting sequence. The live visualization engine will instantly reconstruct the keyway.
4. **Export:** Export the profile as an OpenSCAD model and process it through a 3D slicer or CAM software for final physical replication.

## Legal Disclaimer

Mimic is developed strictly for academic research, authorized penetration testing, and legitimate physical security auditing. The developers assume no liability and are not responsible for any misuse or damage caused by this software. Use responsibly and only on hardware you own or have explicit authorization to audit.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
