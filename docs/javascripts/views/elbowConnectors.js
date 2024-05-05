import {transitionSpeed, dashLength1, dashLength2, pixelScale,} from "./taxonBoxPositionCalculator.js"

class ElbowConnector{
  
    constructor(childTaxonBox, parentTaxonBox){
      this.childTaxonBox = childTaxonBox
      this.parentTaxonBox = parentTaxonBox
      this.sideways = false
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

function getElbowConnectorPath(d, lookupCurrentPos){
    let parentPosition = d.parentTaxonBox
    let childPosition = d.childTaxonBox
    if(lookupCurrentPos){
        parentPosition = parentPosition.getCurrentPosition()
        childPosition = childPosition.getCurrentPosition()
    }

    if(!d.sideways){
        return `
        M ${parentPosition.centerX} ${parentPosition.centerY}
        L ${parentPosition.centerX} ${(parentPosition.bottomY + childPosition.topY) / 2}
        L ${childPosition.centerX} ${(parentPosition.bottomY + childPosition.topY) / 2}
        L ${childPosition.centerX} ${childPosition.centerY}
        `
    }else {
        //debugger
        return `
        M ${parentPosition.centerX} ${parentPosition.centerY}
        L ${(parentPosition.rightX + childPosition.leftX) / 2} ${parentPosition.centerY}
        L ${(parentPosition.rightX + childPosition.leftX) / 2} ${childPosition.centerY}
        L ${childPosition.centerX} ${childPosition.centerY}
        `
    }
}


// code to create or update the d3 elbow connectors
// NOTE: Should be run after the taxon boxes are updated so elbow connector transitions work right
function elbowConnectorD3(elbowConnectors, elbowConnectorContainer){
    // NOTE: We'll also need a loading circle for unknown / loading
    elbowConnectorContainer
      .selectAll("path.elbow-connector")
      .data(elbowConnectors, (d) => makeElbowDataName(d.childTaxonBox, d.parentTaxonBox))
      .join(enter => enter.append('path')
            .attr('opacity', 0)
            .attr('d', (d) => getElbowConnectorPath(d, true)) //TODO: Figure out how to base this on current postion, not destination
            .attr('stroke', 'black')
            .attr('fill', 'none')
            .attr('stroke-dasharray', (d) => {
                if(d.childTaxonBox.taxon.parentTaxon && d.childTaxonBox.taxon.parentTaxon.name == d.parentTaxonBox.taxon.name){
                    return null
                } else{
                    return `${pixelScale(dashLength1)},${pixelScale(dashLength2)}`
                }
            })
 

      )
      .attr('class', 'elbow-connector')
      .transition().duration(transitionSpeed)
      .attr('opacity', 1)
      .attr('d', (d) => getElbowConnectorPath(d, false)) 
      //.attr('stroke-dasharray', (d) => "35,10")
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('stroke-dasharray', (d) => {
            if(d.childTaxonBox.taxon.parentTaxon && d.childTaxonBox.taxon.parentTaxon.name == d.parentTaxonBox.taxon.name){ // solid
                return null
            } else{
                return `${pixelScale(dashLength1)},${pixelScale(dashLength2)}`
            }
        })

  
}

export {ElbowConnector, elbowConnectorD3, findOrCreateElbowConnector}