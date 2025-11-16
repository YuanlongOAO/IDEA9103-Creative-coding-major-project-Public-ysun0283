# IDEA9103-Creative-coding-major-project-Public-ysun0283

### Instruction
When the sketch first loads, the image appears as a static 64×64 mosaic of colored blocks, reconstructed from the original Mondrian painting.
Pressing the **`A`** key on the keyboard **toggles the animation on/off**:
Before pressing `A`: Only the static mosaic is visible.
After pressing `A`: Color blocks begin moving by hue, points move and leave vibrant trajectories across the image.

### Drive Part
I chose to animate the image using **Perlin noise**.

### Animation Components
1. **RGB color transformation for each block**
2. **Overlaying Perlin-driven color dot motion trajectories onto the mosaic surface**
   
Each block starts from its **base colour**, sampled from the centre pixel of the corresponding region in the original image.
For each block, I compute a **“target colour”** using **Perlin noise in image space**:
  I normalise the block’s top-left position to \[0, 1\] as (nx, ny).
  I feed (nx, ny) into noise(nx * scale, ny * scale + offsets) to get three independent noise values for R, G, B.
  These noise values are mapped to 0–255 and then **blended with the original colour** using lerp(base, noiseColour, 0.7), so the target colour is different but still related to the source.

### Reference Inspiration
Inspired by The Coding Train's “Perlin Noise Flowfield” challenge, where particles move through a noise-based vector field leaving continuous trails, my trajectory system similarly employs time-varying Perlin noise. However, instead of using a generic palette, I sampled colors directly from Broadway Boogie Woogie, making the trails appear as if playful splashes of color from the painting were moving across the screen.
<img width="795" height="797" alt="22E9FC2E19839D285742A8A39E342EA6" src="https://github.com/user-attachments/assets/8f832d1a-7145-4479-b210-cf9c5ceeb7e8" />

### Technical explanation
This project uses Perlin noise to animate a reconstructed Mondrian painting, turning a static 64×64 colour-block mosaic into a gently shifting composition. Each tile stores its original base colour and a Perlin-noise–generated target colour based on its position in the image. When animation is active, a global noiseTime value is advanced and noise() + lerp() are used in ImageSegment.draw() to smoothly interpolate between base and target colours, creating continuous, non-flickering chromatic motion across the grid.
On top of this, a second Perlin-driven layer adds moving “drawing trails”. Virtual points are positioned each frame using noise(seed.x, noiseTime) and noise(seed.y, noiseTime), then sample colours from the original image via img.get() to draw thick short lines. Over time these strokes accumulate, making it look as if the painting is repeatedly redrawing itself. The entire animation is triggered by pressing the A key and is implemented solely with core p5.js functions such as noise(), lerp(), and basic drawing commands.
