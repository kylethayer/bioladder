//import * as d3 from '../../libs/d3v7/d3.v7.js'
//import * from '../../libs/d3v7/d3.v7.min.js'

function gotoTaxon(taxon){
    taxon.ensureLoaded()
    taxon.ensureRelatedLoaded()
    taxon.ensureRelatedRelatedLoaded()

    // update data for current centered taxon
    // TODO: make new version of Taxon that is Taxon view data (has taxon model + location [centered, or ancestor or whatever])
    // make an overall model of things on the screen
    let displayedTaxa = [taxon]
    d3.select("#taxaContainer")
      .selectAll("rect")
      .data(displayedTaxa)
      .join('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', 'orange')

    // todo: make it a g, with appended rectangle and stuff

}


export default gotoTaxon