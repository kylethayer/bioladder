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

  taxonBoxD3(taxaView.getTaxonBoxes(), taxaContainer)

  taxaView.setUpdateFunctionCalls()
}

class TaxaView{
  constructor(mainTaxon){
      this.mainTaxonBox = new TaxonBox(mainTaxon)
  }

  getTaxonBoxes(){
    //TODO: set position, scale, and open for each TaxonBox
    this.mainTaxonBox.setOpen(true)
    this.mainTaxonBox.x = 50 
    this.mainTaxonBox.y = 50 
    return [this.mainTaxonBox]
  }

  setUpdateFunctionCalls(){
    // set up update function calls for when things load:
    if(! this.mainTaxonBox.taxon.isLoaded){
      this.mainTaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
    }
  }

}


export default gotoTaxon