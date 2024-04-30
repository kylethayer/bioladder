//import * as d3 from '../../libs/d3v7/d3.v7.js'
//import * from '../../libs/d3v7/d3.v7.min.js'
import {TaxonBox, taxonBoxD3} from './taxonBox.js'

/**
 * goToTaxon function
 * @param {*} taxon 
 * Note: This acts as the d3 "update" function
 */
function gotoTaxon(taxon){
  taxon.ensureLoaded()
  taxon.ensureRelatedLoaded()
  taxon.ensureRelatedRelatedLoaded()

  d3Update(taxon)
}

function d3Update(mainTaxon){
  let taxaView = new TaxaView(mainTaxon)

  let taxaContainer = d3.select("#taxaContainer")

  taxonBoxD3(taxaView.getTaxonBoxes(), taxaContainer)
}

class TaxaView{
  constructor(mainTaxon){
      this.mainTaxonBox = new TaxonBox(mainTaxon)
  }

  getTaxonBoxes(){
    //TODO: set position, scale, and open for each TaxonBox
    return [this.mainTaxonBox]
  }
}


export default gotoTaxon