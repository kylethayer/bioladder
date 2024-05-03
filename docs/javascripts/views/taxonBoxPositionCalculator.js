const taxonLabelHeight = 4
const taxonBoxOpenHeight = 28
const taxonBoxOpenWidth = 90
const taxonBoxClosedWidth = 40

// vertical space is divided into 100 units as follows:
const verticalSpacing = [
    {height: 2, use: "top-padding"}, // - 2 units padding
    {height: 6, use: "pop-ancestor-space"}, // - 6 units popular ancestors (.75 size => 3 units tall), each a little lower and to the side
    {height: 4, use: "elbow-parent-pop-ancestor"}, // - 4 units elbow joint
    {height: taxonLabelHeight, use: "parent-box"}, // - 4 units parent taxon box
    {height: 4, use: "elbow-main-parent"}, // - 4 units elbow joint (straight up and down)
    {height: taxonBoxOpenHeight, use: "main-box"}, // - 28 units main taxon box (title bar is 4 of those units)
    {height: 8, use: "elbow-children-parent"}, // - 8 units elbow joint
    {height: taxonLabelHeight, use: "child-box"}, // - 4 units child boxes
    {height: 8, use: "elbow-pop-descendents-parent"},// - 8 units elbow joints
    {height: .75*taxonBoxClosedWidth, use: "pop-descendents-box"}, //  - 30 units vertical popular descendences (at .75 size, normal width is 40 units)
    {height: 2, use: "bottom-padding"}, // - 2 units padding
]

//calculate for each vertical spacing area what the top, bottom and middle points are
let ySoFar = 0
let verticalSpacingLookup = {}
for(const spacingArea of verticalSpacing){
    let currentHeight = spacingArea.height

    spacingArea.top = ySoFar
    ySoFar += currentHeight
    spacingArea.bottom = ySoFar
    spacingArea.middle = (spacingArea.top + spacingArea.bottom) / 2

    verticalSpacingLookup[spacingArea.use] = spacingArea;
}

const totalHeightUnits = ySoFar

let verticalPixels = 100
let pixelScale = (a) => a

function setVerticalPixels(pixels){
    verticalPixels = pixels
    pixelScale = d3.scaleLinear([0, totalHeightUnits], [0, verticalPixels]);
}


export {
    taxonLabelHeight,
    taxonBoxOpenHeight,
    taxonBoxClosedWidth,
    taxonBoxOpenWidth,
    setVerticalPixels, 
    pixelScale, 
    verticalSpacingLookup}





