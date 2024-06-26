import {navigateToTaxonViaUrl} from "../controllers/mainController.js"
import {transitionSpeed, taxonClosedLabelHeight, taxonOpenLabelHeight, taxonBoxOpenHeight, taxonBoxClosedWidth, taxonBoxOpenWidth,  pixelScale} from "./taxonBoxPositionCalculator.js"
import {taxonBoxElements} from './taxonBoxElement.js'



class TaxonBox{
    constructor(taxon){
        this.taxon = taxon
        this.isOpen = false
        this.centerX = 0
        this.centerY = 0
        this.rotate = 0
        this.scale = 1
        this.updatePositionsAndSizes()
    }

    updatePositionsAndSizes(){
        if(this.isOpen){
            this.width = pixelScale(taxonBoxOpenWidth)
            this.height = pixelScale(taxonBoxOpenHeight)
            this.labelHeight = pixelScale(taxonOpenLabelHeight)
        }else{
            this.width = pixelScale(taxonBoxClosedWidth)
            this.height = pixelScale(taxonClosedLabelHeight)
            this.labelHeight = pixelScale(taxonClosedLabelHeight)
        }


        this.x = this.centerX - this.width * this.scale / 2
        this.y = this.centerY - this.height * this.scale / 2

        if(this.rotate == 0){
            this.leftX = this.x
            this.rightX = this.x + this.width * this.scale
            this.topY = this.y
            this.bottomY = this.y + this.height * this.scale
        } else { // assume sideways
            this.leftX = this.centerX - this.height * this.scale / 2
            this.rightX = this.centerX + this.height * this.scale / 2
            this.topY = this.centerY - this.width * this.scale / 2
            this.bottomY = this.centerY + this.width * this.scale / 2
        }
    }

    getCurrentPosition(){
        //based on answer from here: https://stackoverflow.com/questions/18554224/getting-screen-positions-of-d3-nodes-after-transform/18561829
        let taxonName = this.taxon.name

        var taxonBoxg = d3.selectAll("g.taxon-box").filter(function(d){return taxonName == d.taxon.name}).node();

        function getScreenCoords(x, y, ctm) {
            var xn = ctm.e + x*ctm.a + y*ctm.c;
            var yn = ctm.f + x*ctm.b + y*ctm.d;
            return { x: xn, y: yn };
        }

        let topLeft = getScreenCoords(0, 0, taxonBoxg.getCTM());
        let bottomRight = getScreenCoords(this.width*this.scale, this.height*this.scale, taxonBoxg.getCTM());


        let CTMCoords = {leftX: topLeft.x,
            centerX: (topLeft.x + bottomRight.x)/2,
            rightX: bottomRight.x,
            topY: topLeft.y,
            centerY: (topLeft.y + bottomRight.y)/2,
            bottomY: bottomRight.y
        }
        
        return CTMCoords
    }

}

// Look up d3's current data to see if this TaxonBox already exists to reuse
// otherwise, make a new TaxonBox
function findOrCreateTaxonBox(taxaContainer, taxon){
    let allCurrentTaxonBoxes = 
        taxaContainer
            .selectAll("g.taxon-box")
            .data()

    for(const taxonBox of allCurrentTaxonBoxes){
        if(taxonBox.taxon.name == taxon.name){
            return taxonBox
        }
    }
    return new TaxonBox(taxon)
}

// code to create or update the d3 taxon boxes
function taxonBoxD3(taxonBoxes, taxaContainer, isDrag){
    const taxonNames = taxonBoxes.map(tb => tb.taxon.name)
    if(isDrag){// transitions and other updates aren't needed for just dragging children
        let childDragBoxSelect = taxaContainer.selectAll("g.child-drag-taxon-box")
        childDragBoxSelect
            .attr('transform', (d) =>  `translate(${d.dragX},0) `)
        return
    }
    // add draggable boxes for children drag event (when screen too wide)
    let childDragBoxSelect = taxaContainer.selectAll("g.child-drag-taxon-box")
    .data(taxonBoxes, (d) => d.taxon.name)
    .join(enter => {
        let childDragG = enter.append('g')
            .attr('transform', (d) =>  `translate(${d.dragX},0) `)
          
        let g = childDragG.append('g')
            .attr('class', 'taxon-box')
            .attr('opacity', 0)
            .attr('transform', (d) =>  `
                        translate(${d.x},${d.virticalDirection ? (d.virticalDirection == "up" ? -200 : 1000 ): d.y}) 
                        rotate(${d.rotate}, ${d.width*d.scale/2}, ${d.height*d.scale/2})
                        scale(${d.scale})
                        `) 
            // .attr('transform', (d) =>  `
            //             translate(${d.x},${-50}) 
            //             rotate(${d.rotate}, ${d.width*d.scale/2}, ${d.height*d.scale/2})
            //             scale(${d.scale})
            //             `)
        // add the other taxonBoxElements
        for(const taxonBoxElement of taxonBoxElements){
            taxonBoxElement.enterFn(g)
        }

        return childDragG
    },
    (update) => update,
    (exit) => {

        let transition = exit
            .transition().duration(transitionSpeed/2)

        transition.selectAll('g.taxon-box')
            .attr('opacity', 0)
            .attr('transform', (d) =>  `
                translate(${d.x},${d.virticalDirection ? (d.virticalDirection == "up" ? 1000 : -200 ): d.y}) 
                rotate(${d.rotate}, ${d.width*d.scale/2}, ${d.height*d.scale/2})
                scale(${d.scale})
                `) 

        transition
         .remove()
    }

    )
    .attr('class', 'child-drag-taxon-box')
    


    d3.selectAll('g.taxon-box')
      .on("click", (event, d) => navigateToTaxonViaUrl(d.taxon.name))

    childDragBoxSelect
        .transition().duration(transitionSpeed)
        .attr('transform', (d) =>  `translate(${d.dragX},0) `)

    // set transitions (for those currently still existing, others will be being exited)
    d3.selectAll('g.taxon-box').filter(function(d){return taxonNames.includes(d.taxon.name)})
        .transition().duration(transitionSpeed)
        .attr('opacity', (d) => 1)
        .attr('transform', (d) =>  `
            translate(${d.x},${d.y}) 
            rotate(${d.rotate}, ${d.width*d.scale/2}, ${d.height*d.scale/2})
            scale(${d.scale})
        `)

    
        for(const taxonBoxElement of taxonBoxElements){
            taxonBoxElement.refreshFn(transitionSpeed)
        }
    
}

export {TaxonBox, taxonBoxD3, findOrCreateTaxonBox}