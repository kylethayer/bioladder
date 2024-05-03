import {navigateToTaxonViaUrl} from "../controllers/mainController.js"
import {taxonLabelHeight, taxonBoxOpenHeight, taxonBoxClosedWidth, taxonBoxOpenWidth,  pixelScale} from "./taxonBoxPositionCalculator.js"
import {taxonBoxElements} from './taxonBoxElement.js'
const transitionSpeed = 1000


class TaxonBox{
    constructor(taxon){
        this.taxon = taxon
        this.isOpen = false
        this.centerX = 0
        this.centerY = 0
        this.updatePositionsAndSizes()
    }

    updatePositionsAndSizes(){
        this.labelHeight = pixelScale(taxonLabelHeight)

        if(this.isOpen){
            this.width = pixelScale(taxonBoxOpenWidth)
            this.height = pixelScale(taxonBoxOpenHeight)
        }else{
            this.width = pixelScale(taxonBoxClosedWidth)
            this.height = pixelScale(taxonLabelHeight)
        }


        this.x = this.centerX - this.width / 2
        this.y = this.centerY - this.height / 2

        this.leftX = this.x
        this.rightX = this.x + this.width
        this.topY = this.y
        this.bottomY = this.y + this.height
    }

}

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


function taxonBoxD3(taxonBoxes, taxaContainer){

    // NOTE: We'll also need a loading circle for unknown / loading
    let taxon_svg_groups = 
    taxaContainer
      .selectAll("g.taxon-box")
      .data(taxonBoxes, (d) => d.taxon.name)
      .join(enter => {
        let g = enter.append('g')
            .attr('transform', (d) =>  `translate(${d.x},${-50})`)

        // add the other taxonBoxElements
        for(const taxonBoxElement of taxonBoxElements){
            taxonBoxElement.enterFn(g)
        }

        return g
      })
      .attr('class', 'taxon-box')
      .on("click", (event, d) => navigateToTaxonViaUrl(d.taxon.name))
      .transition().duration(transitionSpeed)
      .attr('transform', (d) =>  `translate(${d.x},${d.y})`)

  
    for(const taxonBoxElement of taxonBoxElements){
        taxonBoxElement.refreshFn(transitionSpeed)
    }
}

export {TaxonBox, taxonBoxD3, findOrCreateTaxonBox}