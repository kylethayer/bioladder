//import * as d3 from '../../libs/d3v7/d3.v7.js'
//import * from '../../libs/d3v7/d3.v7.min.js'
import {TaxonBox, taxonBoxD3, findOrCreateTaxonBox} from './taxonBox.js'
import {taxonLabelHeight, taxonBoxOpenHeight, taxonBoxClosedWidth, taxonBoxOpenWidth, distantTaxonResizeAmt,
  setScales, pixelScale, verticalSpacingLookup, getHorizontalCenter, getSubtaxonHorizontalCenter, getPopSubtaxonHorizontalCenter} from "./taxonBoxPositionCalculator.js"

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
  let taxaContainerWidth = taxaContainer.node().getBoundingClientRect().width;
  setScales(taxaContainerHeight, taxaContainerWidth)

  taxaView.updateTaxonBoxes()
  taxonBoxD3(taxaView.getTaxonBoxes(), taxaContainer)

  taxaView.setUpdateFunctionCalls()
}

class TaxaView{
  
  constructor(mainTaxon){
    this.mainTaxonBox = findOrCreateTaxonBox(taxaContainer, mainTaxon)
  }

  // this functions sets the data for this object to have all the taxonBoxes
  // (but it doesn't position them)
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
        for(const [subtaxonNum, subtaxon] of mainTaxon.subtaxa.entries()){
          this.subtaxonBoxes.push(findOrCreateTaxonBox(taxaContainer, subtaxon))
          if(subtaxon.popularSubtaxa && subtaxon.popularSubtaxa.length > 0){
            if(!this.popularSubtaxonBoxes){
              this.popularSubtaxonBoxes = []
            }
            this.popularSubtaxonBoxes[subtaxonNum] = []
            for(const popSubtaxon of subtaxon.popularSubtaxa){
              this.popularSubtaxonBoxes[subtaxonNum].push(findOrCreateTaxonBox(taxaContainer, popSubtaxon))
            }
          }
        }
      }
    }
  }

  getTaxonBoxes(){
    let taxonBoxes = []
    
    //set position, scale, and open for each TaxonBox
    this.mainTaxonBox.isOpen = true
    this.mainTaxonBox.centerX = pixelScale(getHorizontalCenter())
    this.mainTaxonBox.centerY = pixelScale(verticalSpacingLookup["main-box"].middle)
    this.mainTaxonBox.rotate = 0
    this.mainTaxonBox.scale = 1
    this.mainTaxonBox.updatePositionsAndSizes()
    taxonBoxes.push(this.mainTaxonBox)

    if(this.parentTaxonBox){
      this.parentTaxonBox.isOpen = false
      this.parentTaxonBox.centerX = pixelScale(getHorizontalCenter())
      this.parentTaxonBox.centerY = pixelScale(verticalSpacingLookup["parent-box"].middle)
      this.parentTaxonBox.rotate = 0
      this.parentTaxonBox.scale = 1
      this.parentTaxonBox.updatePositionsAndSizes()
      taxonBoxes.push(this.parentTaxonBox)
    }

    if(this.subtaxonBoxes){
      const numSubtaxa = this.subtaxonBoxes.length
      for(const [subtaxonNum, subtaxonBox] of this.subtaxonBoxes.entries()){
        subtaxonBox.isOpen = false
        subtaxonBox.centerX = pixelScale(getSubtaxonHorizontalCenter(subtaxonNum, numSubtaxa))
        subtaxonBox.centerY = pixelScale(verticalSpacingLookup["child-box"].middle)
        subtaxonBox.rotate = 0
        subtaxonBox.scale = 1
        subtaxonBox.updatePositionsAndSizes()
        taxonBoxes.push(subtaxonBox)
      }
    }

    if(this.popularSubtaxonBoxes){
      const numSubtaxa = this.subtaxonBoxes.length
      for(const [subtaxonNum, a] of this.popularSubtaxonBoxes.entries()){
        if(a){
          let numPopSubtaxa = a.length
          for(const [popSubtaxonNum, popSubtaxonBox] of a.entries()){
            popSubtaxonBox.isOpen = false
            popSubtaxonBox.centerX = pixelScale(
              getPopSubtaxonHorizontalCenter(subtaxonNum, numSubtaxa, popSubtaxonNum, numPopSubtaxa)
            )
            popSubtaxonBox.centerY = pixelScale(verticalSpacingLookup["pop-descendents-box"].middle)
            popSubtaxonBox.rotate = 90
            popSubtaxonBox.scale = distantTaxonResizeAmt
            popSubtaxonBox.updatePositionsAndSizes()
            taxonBoxes.push(popSubtaxonBox)
          }
        }
      }
    }


    return taxonBoxes
  }

  setUpdateFunctionCalls(){
    // set up update function calls for when things load:

    // update for main taxon and preview image loaded
    if(! this.mainTaxonBox.taxon.isLoaded){
      this.mainTaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
    }
    if(this.mainTaxonBox.taxon.exampleMember && !this.mainTaxonBox.taxon.exampleMember.isLoaded){
      this.mainTaxonBox.taxon.exampleMember.loadInfo.loadedUpdateFunction = d3Update
    }

    // update for parent preview image
    if(this.parentTaxonBox){
      if(! this.parentTaxonBox.taxon.isLoaded){
        this.parentTaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
      }
      if(this.parentTaxonBox.taxon.exampleMember && !this.parentTaxonBox.taxon.exampleMember.isLoaded){
        this.parentTaxonBox.taxon.exampleMember.loadInfo.loadedUpdateFunction = d3Update
      }
    }

    // update for subtaxa and their preview images
    if(this.subtaxonBoxes){
      // setting update on
      for(const subtaxonBox of this.subtaxonBoxes){
        if(!subtaxonBox.taxon.isLoaded){
          subtaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
        }
        if(subtaxonBox.taxon.exampleMember && !subtaxonBox.taxon.exampleMember.isLoaded){
          subtaxonBox.taxon.exampleMember.loadInfo.loadedUpdateFunction = d3Update
        }
      }
    }
  }

}


export {gotoTaxon, d3Update}