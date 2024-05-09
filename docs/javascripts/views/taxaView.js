//import * as d3 from '../../libs/d3v7/d3.v7.js'
//import * from '../../libs/d3v7/d3.v7.min.js'
import {taxonBoxD3, findOrCreateTaxonBox} from './taxonBox.js'
import {elbowConnectorD3, findOrCreateElbowConnector} from './elbowConnectors.js'
import {distantTaxonResizeAmt,
  setScales, pixelScale, verticalSpacingLookup, getPopAncestorVerticalCenter, getHorizontalCenter, getPopAncestorHorizontalCenter, 
  getSubtaxonHorizontalCenter, getSubtaxaWidth, getPopSubtaxonHorizontalCenter} from "./taxonBoxPositionCalculator.js"

let taxaView;
let taxaViewSVG =  d3.select("#taxaView")
let taxaContainer = d3.select("#taxaContainer")
let elbowConnectorContainer = d3.select("#elbowConnectorContainer")

const childDragPosition = [{
  dx: 0,
  numSubtaxa: 0
}]

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
  childDragPosition[0].dx = 0
  d3Update()
}

function d3Update(isDrag){
  let taxaViewHeight = taxaViewSVG.node().getBoundingClientRect().height;
  let taxaViewWidth = taxaViewSVG.node().getBoundingClientRect().width;
  setScales(taxaViewHeight, taxaViewWidth)

  taxaView.updateTaxonBoxes()
  taxonBoxD3(taxaView.getTaxonBoxes(), taxaContainer, isDrag)
  elbowConnectorD3(taxaView.getElbowConnectors(), elbowConnectorContainer, isDrag)
  taxaChildDraggableD3(taxaContainer, isDrag)

  taxaView.setUpdateFunctionCalls()
}

function taxaChildDragged(event, d) {
  d.dx += event.dx
  d3Update(true)
}

function taxaChildDraggableD3(taxaContainer, isDrag){
  if(isDrag){
    taxaContainer.selectAll("rect.taxon-children-draggable")
      .attr('x', (d) =>  d.dx + pixelScale(getHorizontalCenter() - getSubtaxaWidth(d.numSubtaxa + 1)/2))// the plus 1 is for padding
    return
  }
  taxaContainer
      .selectAll("rect.taxon-children-draggable")
      .data(childDragPosition)
      .join('rect')
      .attr('class', 'taxon-children-draggable')
      .lower()// put in background
      .attr('opacity', 0)
      .attr('x', (d) =>  d.dx + pixelScale(getHorizontalCenter() - getSubtaxaWidth(d.numSubtaxa + 1)/2)) // the plus 1 is for padding
      .attr('y', (d) => pixelScale(verticalSpacingLookup["main-box"].bottom))
      .attr('height', (d) => pixelScale(verticalSpacingLookup["bottom-padding"].bottom - verticalSpacingLookup["main-box"].bottom))
      .attr('width', (d) => pixelScale(getSubtaxaWidth(d.numSubtaxa + 1))) // the plus 1 is for padding
      .call(d3.drag().on("drag", taxaChildDragged))
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
      //parent taxon and popular ancestors
      if(mainTaxon.parentTaxon){
        if(!this.parentTaxonBox || this.parentTaxonBox.taxon.name != mainTaxon.parentTaxon.name){
          this.parentTaxonBox = findOrCreateTaxonBox(taxaContainer, mainTaxon.parentTaxon)
        }
        //popular ancestors (of parent)
        if(mainTaxon.parentTaxon.popularAncestors && mainTaxon.parentTaxon.popularAncestors.length > 0){
          this.popularAncestorsTaxonBoxes = []
          for(const popularAncestor of mainTaxon.parentTaxon.popularAncestors){
            this.popularAncestorsTaxonBoxes.push(findOrCreateTaxonBox(taxaContainer, popularAncestor))
          }
        }
      }
      

      //subtaxa and popular descendants of them
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
    this.mainTaxonBox.position = "main"
    this.mainTaxonBox.isOpen = true
    this.mainTaxonBox.centerX = pixelScale(getHorizontalCenter())
    this.mainTaxonBox.centerY = pixelScale(verticalSpacingLookup["main-box"].middle)
    this.mainTaxonBox.rotate = 0
    this.mainTaxonBox.scale = 1
    this.mainTaxonBox.dragX = 0
    this.mainTaxonBox.updatePositionsAndSizes()
    taxonBoxes.push(this.mainTaxonBox)

    if(this.parentTaxonBox){
      this.parentTaxonBox.position = "parent"
      this.parentTaxonBox.isOpen = false
      this.parentTaxonBox.centerX = pixelScale(getHorizontalCenter())
      this.parentTaxonBox.centerY = pixelScale(verticalSpacingLookup["parent-box"].middle)
      this.parentTaxonBox.rotate = 0
      this.parentTaxonBox.scale = 1
      this.parentTaxonBox.dragX = 0
      this.parentTaxonBox.updatePositionsAndSizes()
      taxonBoxes.push(this.parentTaxonBox)
    }

    if(this.popularAncestorsTaxonBoxes){
      const numPopAncestors = this.popularAncestorsTaxonBoxes.length
      for(const [popAncestorNum, popAncestorTaxonBox] of this.popularAncestorsTaxonBoxes.entries()){
        popAncestorTaxonBox.position = "pop-ancestor"
        popAncestorTaxonBox.isOpen = false
        popAncestorTaxonBox.centerX = pixelScale(getPopAncestorHorizontalCenter(popAncestorNum, numPopAncestors))
        popAncestorTaxonBox.centerY = pixelScale(getPopAncestorVerticalCenter(popAncestorNum, numPopAncestors))
        popAncestorTaxonBox.rotate = 0
        popAncestorTaxonBox.scale = distantTaxonResizeAmt
        popAncestorTaxonBox.dragX = 0
        popAncestorTaxonBox.updatePositionsAndSizes()
        taxonBoxes.push(popAncestorTaxonBox)
      }
    }

    if(this.subtaxonBoxes){
      const numSubtaxa = this.subtaxonBoxes.length
      childDragPosition[0].numSubtaxa = numSubtaxa
      for(const [subtaxonNum, subtaxonBox] of this.subtaxonBoxes.entries()){
        subtaxonBox.position = "child"
        subtaxonBox.isOpen = false
        subtaxonBox.centerX = pixelScale(getSubtaxonHorizontalCenter(subtaxonNum, numSubtaxa))
        subtaxonBox.centerY = pixelScale(verticalSpacingLookup["child-box"].middle)
        subtaxonBox.rotate = 0
        subtaxonBox.scale = 1
        subtaxonBox.dragX = childDragPosition[0].dx
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
            popSubtaxonBox.position = "pop-descendants"
            popSubtaxonBox.isOpen = false
            popSubtaxonBox.centerX = pixelScale(
              getPopSubtaxonHorizontalCenter(subtaxonNum, numSubtaxa, popSubtaxonNum, numPopSubtaxa)
            )
            popSubtaxonBox.centerY = pixelScale(verticalSpacingLookup["pop-descendants-box"].middle) 
            popSubtaxonBox.rotate = 90
            popSubtaxonBox.scale = distantTaxonResizeAmt
            popSubtaxonBox.dragX = childDragPosition[0].dx
            popSubtaxonBox.updatePositionsAndSizes()
            taxonBoxes.push(popSubtaxonBox)
          }
        }
      }
    }


    return taxonBoxes
  }

  //NOTE: should be run after getTaxonBoxes
  getElbowConnectors(){
    let elbowConnectors = []

    // parent box -> main
    if(this.mainTaxonBox && this.parentTaxonBox){
      let mainParentElbow = findOrCreateElbowConnector(elbowConnectorContainer, this.mainTaxonBox, this.parentTaxonBox)
      mainParentElbow.sideways = false
      elbowConnectors.push(mainParentElbow)
    }

    // main -> subtaxa, and subtaxa -> pop ancestors
    if(this.subtaxonBoxes){

      for(const [subtaxonBoxNum, subtaxonBox] of this.subtaxonBoxes.entries()){
        let mainSubtaxaElbow = findOrCreateElbowConnector(elbowConnectorContainer, subtaxonBox, this.mainTaxonBox)
        mainSubtaxaElbow.sideways = false
        elbowConnectors.push(mainSubtaxaElbow)

        if(this.popularSubtaxonBoxes && this.popularSubtaxonBoxes[subtaxonBoxNum]){
          for(const popSubtaxonBox of this.popularSubtaxonBoxes[subtaxonBoxNum]){
            let subPopSubElbow = findOrCreateElbowConnector(elbowConnectorContainer, popSubtaxonBox, subtaxonBox)
            subPopSubElbow.sideways = false
            elbowConnectors.push(subPopSubElbow)
          }
        }
      }
    }

    // popAncestors -> next pop ancestors -> parentTaxon
    if(this.popularAncestorsTaxonBoxes && this.parentTaxonBox){
      let lastAncestor = this.parentTaxonBox
      let elbowSideways = false
      for(const popAncestorBox of this.popularAncestorsTaxonBoxes){
        let ancElbow = findOrCreateElbowConnector(elbowConnectorContainer, lastAncestor, popAncestorBox)
        ancElbow.sideways = elbowSideways
        elbowConnectors.push(ancElbow)
        lastAncestor = popAncestorBox
        elbowSideways = true
      }
    }


    return elbowConnectors
  }

  setUpdateFunctionCalls(){
    // set up update function calls for when things load:

    // update for main taxon and preview image loaded
    if(! this.mainTaxonBox.taxon.loadInfo.isLoaded){
      this.mainTaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
    }else if(! this.mainTaxonBox.taxon.loadInfo.isPreviewImageLoaded){
      this.mainTaxonBox.taxon.loadInfo.previewImageloadedUpdateFunction = d3Update
    }
    // update for parent preview image
    if(this.parentTaxonBox){
      if(! this.parentTaxonBox.taxon.loadInfo.isLoaded){
        this.parentTaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
      } else if(! this.parentTaxonBox.taxon.loadInfo.isPreviewImageLoaded){
        this.parentTaxonBox.taxon.loadInfo.previewImageloadedUpdateFunction = d3Update
      }
    }

    // popular ancestors
    if(this.popularAncestorsTaxonBoxes){
      for(const popAncestorBox of this.popularAncestorsTaxonBoxes){
        if(!popAncestorBox.taxon.loadInfo.isLoaded){
          popAncestorBox.taxon.loadInfo.loadedUpdateFunction = d3Update
        } else if(!popAncestorBox.taxon.loadInfo.isPreviewImageLoaded){
          popAncestorBox.taxon.loadInfo.previewImageloadedUpdateFunction = d3Update
        }
      }
    }

    // update for subtaxa and their preview images
    if(this.subtaxonBoxes){
      for(const subtaxonBox of this.subtaxonBoxes){
        if(!subtaxonBox.taxon.loadInfo.isLoaded){
          subtaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
        } else if(!subtaxonBox.taxon.loadInfo.isPreviewImageLoaded){
          subtaxonBox.taxon.loadInfo.previewImageloadedUpdateFunction = d3Update
        }
      }
    }

    // update for popular subtaxa and their preview images
    if(this.popularSubtaxonBoxes){
      // setting update on
      for(const popSubtaxonBoxList of this.popularSubtaxonBoxes){
        if(popSubtaxonBoxList){
          for(const popSubtaxonBox of popSubtaxonBoxList){
            if(!popSubtaxonBox.taxon.loadInfo.isLoaded){
              popSubtaxonBox.taxon.loadInfo.loadedUpdateFunction = d3Update
            } else if(!popSubtaxonBox.taxon.loadInfo.isPreviewImageLoaded){
              popSubtaxonBox.taxon.loadInfo.previewImageloadedUpdateFunction = d3Update
            }
          }
        }
      }
    }
  }

}


export {gotoTaxon, d3Update}