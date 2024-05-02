//import * as d3 from '../../libs/d3v7/d3.v7.js'
//import * from '../../libs/d3v7/d3.v7.min.js'
import {TaxonBox, taxonBoxD3} from './taxonBox.js'

let taxaView;

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
  let taxaContainer = d3.select("#taxaContainer")

  taxaView.updateTaxonBoxes()
  taxonBoxD3(taxaView.getTaxonBoxes(), taxaContainer)

  taxaView.setUpdateFunctionCalls()
}

class TaxaView{
  constructor(mainTaxon){
    this.mainTaxonBox = new TaxonBox(mainTaxon)
  }

  updateTaxonBoxes(){
    let mainTaxon = this.mainTaxonBox.taxon
    if(this.mainTaxonBox.taxon.loadInfo.isLoaded){
      if(mainTaxon.parentTaxon){
        if(!this.parentTaxonBox || this.parentTaxonBox.taxa.name != mainTaxon.parentTaxon.name){
          this.parentTaxonBox = new TaxonBox(mainTaxon.parentTaxon)
        }
      }
    }
  }

  getTaxonBoxes(){
    let taxaContainer = d3.select("#taxaContainer")
    let taxaContainerWidth = taxaContainer.node().getBoundingClientRect().width;
    let taxaContainerHeight = taxaContainer.node().getBoundingClientRect().height;

    let taxonBoxes = []
    
    //set position, scale, and open for each TaxonBox
    this.mainTaxonBox.setOpen(true)
    this.mainTaxonBox.centerX = taxaContainerWidth/2 
    this.mainTaxonBox.centerY = taxaContainerHeight/2 
    this.mainTaxonBox.updatePositions()
    taxonBoxes.push(this.mainTaxonBox)

    if(this.parentTaxonBox){
      this.parentTaxonBox.setOpen(false)
      this.parentTaxonBox.centerX = this.mainTaxonBox.centerX
      this.parentTaxonBox.centerY = this.mainTaxonBox.topY - 50
      this.parentTaxonBox.updatePositions()
      taxonBoxes.push(this.parentTaxonBox)
    }


    return taxonBoxes
  }

  setUpdateFunctionCalls(){
    // set up update function calls for when things load:
    if(! this.mainTaxonBox.taxon.isLoaded){
      this.mainTaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
    }
  }

}


export default gotoTaxon