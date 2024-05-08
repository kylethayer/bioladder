const transitionSpeed = 1000

const taxonOpenLabelHeight = 6
const taxonClosedLabelHeight = 8
const taxonBoxOpenHeight = 28
const taxonBoxOpenWidth = 90
const taxonBoxClosedWidth = 40
const distantTaxonResizeAmt = 0.75
const taxonChildHorizontalSpacing = 2
const popSubtaxonHorizontalSpacing = 2
const popAncestorHorizontalSpacing = 2

const dashLength1 = 1
const dashLength2 = 0.5



//////////////////////////
// vertical spacing

// vertical space is divided into units as follows:
const verticalSpacing = [
    {height: 2, use: "top-padding"}, // - 2 units padding
    {height: taxonClosedLabelHeight*distantTaxonResizeAmt * 1.5, use: "pop-ancestor-space"}, //  each a little lower and to the side
    {height: 6, use: "elbow-parent-pop-ancestor"}, // - 4 units elbow joint
    {height: taxonClosedLabelHeight, use: "parent-box"}, // - 4 units parent taxon box
    {height: 4, use: "elbow-main-parent"}, // - 4 units elbow joint (straight up and down)
    {height: taxonBoxOpenHeight, use: "main-box"}, // - 28 units main taxon box (title bar is 4 of those units)
    {height: 8, use: "elbow-children-parent"}, // - 8 units elbow joint
    {height: taxonClosedLabelHeight, use: "child-box"}, // - 4 units child boxes
    {height: 8, use: "elbow-pop-descendents-parent"},// - 8 units elbow joints
    {height: distantTaxonResizeAmt*taxonBoxClosedWidth, use: "pop-descendents-box"}, //  - 30 units vertical popular descendences (at .75 size, normal width is 40 units)
    {height: 2, use: "bottom-padding"}, // - 2 units padding
]

//calculate for each vertical spacing area what the top, bottom and middle points are
let minHeightUnits = 0
let verticalSpacingLookup = {}

for(const spacingArea of verticalSpacing){
    let currentHeight = spacingArea.height
    minHeightUnits += currentHeight
}

// minHeightUnits is now set

let totalHeightUnits = 100 // TODO: use this to center vertical
let extraYForCenter = 0

function setVerticalSpacingLookup(){
    let ySoFar = extraYForCenter
    for(const spacingArea of verticalSpacing){
        let currentHeight = spacingArea.height
    
        spacingArea.top = ySoFar
        ySoFar += currentHeight
        spacingArea.bottom = ySoFar
        spacingArea.middle = (spacingArea.top + spacingArea.bottom) / 2
    
        verticalSpacingLookup[spacingArea.use] = spacingArea;
    }
}

setVerticalSpacingLookup() // make sure this is run at least once

function setVerticalPixels(taxaViewHeight){
    totalHeightUnits = pixelScale.invert(taxaViewHeight)
    extraYForCenter = (totalHeightUnits - minHeightUnits) / 2
    setVerticalSpacingLookup()
}

function getPopAncestorVerticalCenter(ancestorNum, numAncestors){
    if(numAncestors == 1){
        return verticalSpacingLookup["pop-ancestor-space"].middle
    }

    let topMiddle = verticalSpacingLookup["pop-ancestor-space"].top + distantTaxonResizeAmt * taxonClosedLabelHeight / 2
    let bottomMiddle = verticalSpacingLookup["pop-ancestor-space"].bottom - distantTaxonResizeAmt * taxonClosedLabelHeight / 2

    let verticalChange =  bottomMiddle - topMiddle
    
    let verticalForThis =  verticalChange / (numAncestors - 1) * (numAncestors - ancestorNum)

    return topMiddle + verticalForThis
}

//////////////////////////
// horizontal spacing


let totalWidthUnits = 100 // default, should be recalculated

function setHorizontalWidth(taxaViewWidth){
    totalWidthUnits = pixelScale.invert(taxaViewWidth)
}

function getHorizontalCenter(){
    return totalWidthUnits / 2
}

function getTotalPopAncestorWidth(numAncestors){
    return numAncestors * taxonBoxClosedWidth + (numAncestors - 1) * popAncestorHorizontalSpacing
}

function getPopAncestorHorizontalCenter(ancestorNum, numAncestors){
    let totalPopAncestorWidth = getTotalPopAncestorWidth(numAncestors)
    let rightPosStart = getHorizontalCenter() + totalPopAncestorWidth / 2 // start of rightmost subtaxon
    let numBoxesToRight = ancestorNum // index is the number of children to right (index 0 has none to right)

    let boxCenter = rightPosStart -  //right start
                    numBoxesToRight * (taxonBoxClosedWidth + popAncestorHorizontalSpacing) - // space taken by left boxes
                    taxonBoxClosedWidth / 2 // move to center of this box
    return boxCenter
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

    let totalPopSubtaxonsWidth = numPopSubtaxa * taxonClosedLabelHeight * distantTaxonResizeAmt
                                 + (numPopSubtaxa - 1) * popSubtaxonHorizontalSpacing
    let leftPosStart = parentSubtaxaCenter - totalPopSubtaxonsWidth / 2 // start of leftmost subtaxon
    let numBoxesToLeft = popSubtaxonNum // index is the number of children to left (index 0 has none to left)

    let boxCenter = leftPosStart +  //left start
                    numBoxesToLeft * (taxonClosedLabelHeight * distantTaxonResizeAmt + popSubtaxonHorizontalSpacing) + // space taken by left boxes
                    taxonClosedLabelHeight / 2 // move to center of this box
    return boxCenter
}


const sidePadding = 2
function getMaxWidth(){
    return 2*sidePadding + Math.max(taxonBoxOpenWidth, getTotalPopAncestorWidth(4))
}
let minWidthUnits = getMaxWidth()





/////////////////////
// set up

let pixelScale = (a) => a

function setScales(taxaViewHeight, taxaViewWidth){
    // figure out whether vertical or horizontal is the main problem and set scale accordinlgy
    if(taxaViewHeight == 0 || taxaViewWidth == 0){
        // if one dimension is missing, there is no reasonable action we can take
        return
    }
    let taxaViewAspectRatio = taxaViewWidth / taxaViewHeight
    let ourMinAspectRatio = minWidthUnits / minHeightUnits
    
    if (taxaViewAspectRatio > ourMinAspectRatio){ // more widthy than we need, use height
        pixelScale = d3.scaleLinear([0, minHeightUnits], [0, taxaViewHeight]);
    } else{ // more heighty than we need, use width
        pixelScale = d3.scaleLinear([0, minWidthUnits], [0, taxaViewWidth]);
    }
    setVerticalPixels(taxaViewHeight)
    setHorizontalWidth(taxaViewWidth)
}

export {
    transitionSpeed,
    taxonClosedLabelHeight,
    taxonOpenLabelHeight,
    taxonBoxOpenHeight,
    taxonBoxClosedWidth,
    taxonBoxOpenWidth,
    distantTaxonResizeAmt,
    dashLength1,
    dashLength2,
    pixelScale, 
    setScales, 
    verticalSpacingLookup,
    extraYForCenter,
    getPopAncestorVerticalCenter,
    getHorizontalCenter,
    getPopAncestorHorizontalCenter,
    getSubtaxonHorizontalCenter,
    getPopSubtaxonHorizontalCenter}





