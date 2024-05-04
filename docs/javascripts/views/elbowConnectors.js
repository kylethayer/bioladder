import {transitionSpeed} from "./taxonBoxPositionCalculator.js"

class ElbowConnector{
  
    constructor(childTaxonBox, parentTaxonBox){
      this.childTaxonBox = childTaxonBox
      this.parentTaxonBox = parentTaxonBox
    }

}

function makeElbowDataName(childTaxonBox, parentTaxonBox){
    return parentTaxonBox.taxon.name + "|" + childTaxonBox.taxon.name
}


// Look up d3's current data to see if this TaxonBox already exists to reuse
// otherwise, make a new TaxonBox
function findOrCreateElbowConnector(elbowConnectorContainer, childTaxonBox, parentTaxonBox){
    let allCurrentElbowConnectors = 
        elbowConnectorContainer
            .selectAll("path.elbow-connector")
            .data()

    for(const elbowConnector of allCurrentElbowConnectors){
        if(makeElbowDataName(elbowConnector.childTaxonBox, elbowConnector.parentTaxonBox) 
            == makeElbowDataName(childTaxonBox, parentTaxonBox)){
            return elbowConnector
        }
    }
    return new ElbowConnector(childTaxonBox, parentTaxonBox)
}



// code to create or update the d3 taxon boxes
function elbowConnectorD3(elbowConnectors, elbowConnectorContainer){
    // NOTE: We'll also need a loading circle for unknown / loading
    elbowConnectorContainer
      .selectAll("path.elbow-connector")
      .data(elbowConnectors, (d) => makeElbowDataName(d.childTaxonBox, d.parentTaxonBox))
      .join(enter => enter.append('path')
            .attr('opacity', 0)
            .attr('d', (d) =>  {
                return `
                    M ${d.parentTaxonBox.centerX} ${d.parentTaxonBox.bottomY}
                    L ${d.parentTaxonBox.centerX} ${(d.parentTaxonBox.bottomY + d.childTaxonBox.topY) / 2}
                    L ${d.childTaxonBox.centerX} ${(d.parentTaxonBox.bottomY + d.childTaxonBox.topY) / 2}
                    L ${d.childTaxonBox.centerX} ${d.childTaxonBox.topY}
                        `}) 
            
            .attr('stroke', 'black')
            .attr('fill', 'none')
            //.attr('stroke-dasharray', (d) => "35,10")
            // TODO Add striped if childTaxon's parent isn't the parentTaxon
 

      )
      .attr('class', 'elbow-connector')
      .transition().duration(transitionSpeed)
      .attr('opacity', 1)
      .attr('d', (d) =>  `
                M ${d.parentTaxonBox.centerX} ${d.parentTaxonBox.bottomY}
                L ${d.parentTaxonBox.centerX} ${(d.parentTaxonBox.bottomY + d.childTaxonBox.topY) / 2}
                L ${d.childTaxonBox.centerX} ${(d.parentTaxonBox.bottomY + d.childTaxonBox.topY) / 2}
                L ${d.childTaxonBox.centerX} ${d.childTaxonBox.topY}
                    `) 
      //.attr('stroke-dasharray', (d) => "35,10")
      .attr('stroke', 'black')
      .attr('fill', 'none')
    // TODO Add striped if childTaxon's parent isn't the parentTaxon

  
}

export {ElbowConnector, elbowConnectorD3, findOrCreateElbowConnector}