//import * as d3 from '../../libs/d3v7/d3.v7.js'
//import * from '../../libs/d3v7/d3.v7.min.js'
import {TaxonBox, taxonBoxD3, findOrCreateTaxonBox} from './taxonBox.js'
import {taxonLabelHeight, taxonBoxOpenHeight, taxonBoxClosedWidth, taxonBoxOpenWidth,
  setVerticalPixels, pixelScale, verticalSpacingLookup} from "./taxonBoxPositionCalculator.js"

let taxaView;
let taxaContainer = d3.select("#taxaContainer")

/**
 * goToTaxon function
 * @param {*} taxon 
 * Note: This acts as the d3 "update" function
 */
function gotoTaxon(taxon){
  taxon.ensureLoaded()
  taxon.ensureRelatedLoaded()
  taxon.ensureRelatedRelatedLoaded()

  taxaView = new TaxaView(taxon)
  d3Update()
}

function d3Update(){
  let taxaContainerHeight = taxaContainer.node().getBoundingClientRect().height;
  setVerticalPixels(taxaContainerHeight)

  taxaView.updateTaxonBoxes()
  taxonBoxD3(taxaView.getTaxonBoxes(), taxaContainer)

  taxaView.setUpdateFunctionCalls()
}

class TaxaView{
  
  constructor(mainTaxon){
    this.mainTaxonBox = findOrCreateTaxonBox(taxaContainer, mainTaxon)
  }


  updateTaxonBoxes(){
    let mainTaxon = this.mainTaxonBox.taxon
    if(this.mainTaxonBox.taxon.loadInfo.isLoaded){
      if(mainTaxon.parentTaxon){
        if(!this.parentTaxonBox || this.parentTaxonBox.taxon.name != mainTaxon.parentTaxon.name){
          this.parentTaxonBox = findOrCreateTaxonBox(taxaContainer, mainTaxon.parentTaxon)
        }
      }
      if(mainTaxon.subtaxa && mainTaxon.subtaxa.length > 0){
        this.subtaxonBoxes = []
        // TODO: Do all, but for now test with just one
        this.subtaxonBoxes.push(findOrCreateTaxonBox(taxaContainer, mainTaxon.subtaxa[0]))
        // for(const subtaxa of this.subtaxa){
        //   this.subtaxonBoxes.push(findOrCreateTaxonBox(taxaContainer, mainTaxon.subtaxa))
        // }
      }
    }
  }

  getTaxonBoxes(){
    let taxaContainer = d3.select("#taxaContainer")
    let taxaContainerWidth = taxaContainer.node().getBoundingClientRect().width;
    let taxaContainerHeight = taxaContainer.node().getBoundingClientRect().height;

    let taxonBoxes = []
    
    //set position, scale, and open for each TaxonBox
    this.mainTaxonBox.isOpen = true
    this.mainTaxonBox.centerX = taxaContainerWidth/2 
    this.mainTaxonBox.centerY = pixelScale(verticalSpacingLookup["main-box"].middle)
    this.mainTaxonBox.updatePositionsAndSizes()
    taxonBoxes.push(this.mainTaxonBox)

    if(this.parentTaxonBox){
      this.parentTaxonBox.isOpen = false
      this.parentTaxonBox.centerX = this.mainTaxonBox.centerX
      this.parentTaxonBox.centerY = pixelScale(verticalSpacingLookup["parent-box"].middle)
      this.parentTaxonBox.updatePositionsAndSizes()
      taxonBoxes.push(this.parentTaxonBox)
    }

    if(this.subtaxonBoxes){
      for(const subtaxonBox of this.subtaxonBoxes){
        subtaxonBox.isOpen = false
        subtaxonBox.centerX = this.mainTaxonBox.centerX
        subtaxonBox.centerY = pixelScale(verticalSpacingLookup["child-box"].middle)
        subtaxonBox.updatePositionsAndSizes()
        taxonBoxes.push(subtaxonBox)
      }
    }


    return taxonBoxes
  }

  setUpdateFunctionCalls(){
    // set up update function calls for when things load:
    if(! this.mainTaxonBox.taxon.isLoaded){
      this.mainTaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
    }
    if(this.mainTaxonBox.taxon.exampleMember && !this.mainTaxonBox.taxon.exampleMember.isLoaded){
      this.mainTaxonBox.taxon.exampleMember.loadInfo.loadedUpdateFunction = d3Update
    }
  }

}


export {gotoTaxon, d3Update}