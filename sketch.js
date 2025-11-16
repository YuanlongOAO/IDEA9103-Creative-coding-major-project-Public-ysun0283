/* Based on the Structure of Sample Code 1 from Week 7 “Color Block Redrawing (Center Pixel Sampling)” Version
 Render the image as a 64-grid color block mosaic (without outlines to avoid gaps)
 Boundaries are accumulated using rounding, while center pixels are sampled.
 */


//Need a variable to hold our image
let img;

//Divide the image into segments, this is the number of segments in each dimension
//The total number of segments will be 4096 (64 * 64)
let numSegments = 64;

//Store the segments in an array
let segments = [];

//Animation Switch Status
let animationActive = false;
//For moving points
const NUM_TRAIL_POINTS = 500;
let trailSeeds = [];
//Previous frame position
let lastPositions = [];

//Time of color change
let noiseTime = 0;

//Load the image from disk
function preload() {
  img = loadImage('Piet_Mondrian Broadway_Boogie_Woogie.jpeg');
}

function setup() {
  //Make the canvas the same size as the image using its properties
  createCanvas(img.width, img.height);

  //Use the width and height of the image to calculate the size of each segment
  let segmentWidth = img.width / numSegments;
  let segmentHeight = img.height / numSegments;

  /*
  Divide the original image into segments, we are going to use nested loops
  let's have a look at how nested loops work
  first we use a loop to move down the image, 
  we will use the height of the image as the limit of the loop
  then we use a loop to move across the image, 
  we will use the width of the image as the limit of the loop
  Let's look carefully at what happens, the outer loop runs once, so we start at the top of the image
  Then the inner loop runs to completion, moving from left to right across the image
  Then the outer loop runs again, moving down 1 row image, and the inner loop runs again,
  moving all the way from left to right
  */

  //this is looping over the height
  for (let segYPos=0; segYPos<img.height; segYPos+=segmentHeight) {

    //this loops over width
    for (let segXPos=0; segXPos<img.width; segXPos+=segmentWidth) {
      
      //This will create a segment for each x and y position

      // Using the “current floating boundary + rounding” method yields integer pixel boundaries,
      // ensuring the reproduced image remains complete and seamless without gaps
      const segXPos0 = Math.round(segXPos);
      const segYPos0 = Math.round(segYPos);
      const segXPos1 = Math.round(segXPos + segmentWidth);
      const segYPos1 = Math.round(segYPos + segmentHeight);

      //Actual integer size of this block
      const segWidth  = segXPos1 - segXPos0;
      const segHeight  = segYPos1 - segYPos0;

      //If rounding results in width or height being <= 0, skip it
      if (segWidth <= 0 || segHeight <= 0) continue;

      // Find the center pixel of this block
      //Constrain the results within the image boundaries.
      const colorX = Math.min(segXPos0 + Math.floor(segWidth / 2), img.width  - 1);
      const colorY = Math.min(segYPos0 + Math.floor(segHeight / 2), img.height - 1);
      
      //Sample the color at that center pixel. Returns [r, g, b, a].
      const color  = img.get(colorX, colorY);

      //This will create a segment for each x and y position
      let segment = new ImageSegment(
        segXPos0,
        segYPos0,
        segWidth,
        segHeight,
        color);

      //Save it for drawing later in draw()
      segments.push(segment);
    }
  }
}

function draw() {
  //Set background color white
  background(255);

  //Repaint by color block
  for (const segment of segments) {
    segment.draw();
  }

  //Perlin Animation
  if (animationActive) {
    drawNoiseTrails();
    noiseTime += 0.01;
  }

}

//Class for the image segments, we start with the class keyword
class ImageSegment {

  //Give the class a constructor
  constructor(srcImgSegXPosInPrm,srcImgSegYPosInPrm,srcImgSegWidthInPrm,srcImgSegHeightInPrm, fillColorInPrm) {

    //these parameters are used to set the internal properties of an instance of the segment
    //These parameters are named as imageSource as they are derived from the image we are using
    this.srcImgSegXPos = srcImgSegXPosInPrm;
    this.srcImgSegYPos = srcImgSegYPosInPrm;
    this.srcImgSegWidth = srcImgSegWidthInPrm;
    this.srcImgSegHeight = srcImgSegHeightInPrm;

    //Original color
    this.baseR = fillColorInPrm[0];
    this.baseG = fillColorInPrm[1];
    this.baseB = fillColorInPrm[2];
    this.baseA = fillColorInPrm[3];
    
    //Generate color using Perlin noise
    let nx = this.srcImgSegXPos / img.width;
    let ny = this.srcImgSegYPos / img.height;
    let scale = 3.0;

    //0 ~ 1
    let nR = noise(nx * scale, ny * scale);
    let nG = noise(nx * scale + 50.0, ny * scale + 50.0);
    let nB = noise(nx * scale + 100.0, ny * scale + 100.0);

    //Obtain a set of noise colors
    let noiseR = nR * 255;
    let noiseG = nG * 255;
    let noiseB = nB * 255;

    //Blend it with the original color to ensure the target color has variation without completely straying off course.
    this.targetR = lerp(this.baseR, noiseR, 0.6);
    this.targetG = lerp(this.baseG, noiseG, 0.6);
    this.targetB = lerp(this.baseB, noiseB, 0.6);
  }

//draw the segment to the canvas
draw() {
  //Did not press A: Draw using original colors (maintains consistency with the original image)
  if (!animationActive) {
    fill(this.baseR, this.baseG, this.baseB, this.baseA);
  } else {
    //Use position + time as noise input
    let nx = this.srcImgSegXPos / img.width;
    let ny = this.srcImgSegYPos / img.height;  
    let scale = 3.0;

    //t：0~1
    let t = noise(nx * scale, ny * scale + noiseTime);

    //Interpolate between base and target
    let r = lerp(this.baseR, this.targetR, t);
    let g = lerp(this.baseG, this.targetG, t);
    let b = lerp(this.baseB, this.targetB, t);

    //Apply the computed fill color
    fill(r, g, b, this.baseA);
  }
  //Turn off outlines to prevent visible seams
  noStroke();

  //Paint the rectangle for this block
  rect(
      this.srcImgSegXPos,
      this.srcImgSegYPos,
      this.srcImgSegWidth,
      this.srcImgSegHeight
    );
  }
}

//Key Controls
function keyPressed() {
  if (key === 'a' || key === 'A') {
    animationActive = !animationActive;

    if (animationActive) {
      //Reset each time the animation is opened.
      initNoiseTrails();
    }
  }
}

//Initialize
function initNoiseTrails() {
  trailSeeds = [];
  lastPositions = [];

  for (let i = 0; i < NUM_TRAIL_POINTS; i++) {
    trailSeeds.push({
      x: random(1000),
      y: random(1000, 2000)
    });
    lastPositions.push(null);
  }
}

function drawNoiseTrails() {
  for (let i = 0; i < NUM_TRAIL_POINTS; i++) {
    const seed = trailSeeds[i];

    //Generate values between 0 and 1 using 2D noise
    //then map them to canvas coordinates.
    const x = noise(seed.x, noiseTime) * width;
    const y = noise(seed.y, noiseTime) * height;

    //Sample the color at the current point position on the original image.
    const sampleX = constrain(Math.floor(x), 0, img.width - 1);
    const sampleY = constrain(Math.floor(y), 0, img.height - 1);
    const c = img.get(sampleX, sampleY);

    noFill();
    stroke(c[0], c[1], c[2], 200);
    strokeWeight(30);

    const last = lastPositions[i];
    
    if (last) {
      //Motion trajectory
      line(last.x, last.y, x, y);
    } else {
      point(x, y);
    }

    //Update previous frame position
    lastPositions[i] = { x, y };
  }
}