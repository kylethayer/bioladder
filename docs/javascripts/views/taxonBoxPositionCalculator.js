const taxonLabelHeight = 4
const taxonBoxOpenHeight = 28
const taxonBoxOpenWidth = 90
const taxonBoxClosedWidth = 40
const distantTaxonResizeAmt = 0.75
const taxonChildHorizontalSpacing = 2
const popSubtaxonHorizontalSpacing = 2

//////////////////////////
// vertical spacing

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
    {height: distantTaxonResizeAmt*taxonBoxClosedWidth, use: "pop-descendents-box"}, //  - 30 units vertical popular descendences (at .75 size, normal width is 40 units)
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

//////////////////////////
// horizontal spacing
let totalWidthUnits = 100 // default, should be recalculated

function setHorizontalWidth(taxaContainerWidth){
    totalWidthUnits = pixelScale.invert(taxaContainerWidth)
}

function getHorizontalCenter(){
    return totalWidthUnits / 2
}

function getSubtaxonHorizontalCenter(childNum, numChildren){
    let totalSubtaxonsWidth = numChildren * taxonBoxClosedWidth + (numChildren - 1) * taxonChildHorizontalSpacing
    let leftPosStart = getHorizontalCenter() - totalSubtaxonsWidth / 2 // start of leftmost subtaxon
    let numBoxesToLeft = childNum // index is the number of children to left (index 0 has none to left)

    let boxCenter = leftPosStart +  //left start
                    numBoxesToLeft * (taxonBoxClosedWidth + taxonChildHorizontalSpacing) + // space taken by left boxes
                    taxonBoxClosedWidth / 2 // move to center of this box
    return boxCenter
}

function getPopSubtaxonHorizontalCenter(subtaxonNum, numSubtaxa, popSubtaxonNum, numPopSubtaxa){
    let parentSubtaxaCenter = getSubtaxonHorizontalCenter(subtaxonNum, numSubtaxa)

    let totalPopSubtaxonsWidth = numPopSubtaxa * taxonLabelHeight + (numPopSubtaxa - 1) * popSubtaxonHorizontalSpacing
    let leftPosStart = parentSubtaxaCenter - totalPopSubtaxonsWidth / 2 // start of leftmost subtaxon
    let numBoxesToLeft = popSubtaxonNum // index is the number of children to left (index 0 has none to left)

    let boxCenter = leftPosStart +  //left start
                    numBoxesToLeft * (taxonLabelHeight + popSubtaxonHorizontalSpacing) + // space taken by left boxes
                    taxonLabelHeight / 2 // move to center of this box
    return boxCenter
}




/////////////////////
// set up
function setScales(taxaContainerHeight, taxaContainerWidth){
    setVerticalPixels(taxaContainerHeight)
    setHorizontalWidth(taxaContainerWidth)
}

export {
    taxonLabelHeight,
    taxonBoxOpenHeight,
    taxonBoxClosedWidth,
    taxonBoxOpenWidth,
    distantTaxonResizeAmt,
    pixelScale, 
    setScales, 
    verticalSpacingLookup,
    getHorizontalCenter,
    getSubtaxonHorizontalCenter,
    getPopSubtaxonHorizontalCenter}





