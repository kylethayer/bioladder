//import * as d3 from '../../libs/d3v7/d3.v7.js'
//import * from '../../libs/d3v7/d3.v7.min.js'
import {taxonBoxD3, findOrCreateTaxonBox} from './taxonBox.js'
import {elbowConnectorD3, findOrCreateElbowConnector} from './elbowConnectors.js'
import {distantTaxonResizeAmt,
  setScales, pixelScale, verticalSpacingLookup, getPopAncestorVerticalCenter, getVerticalNum, getHorizontalCenter, getPopAncestorHorizontalCenter, 
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

  let oldTaxaView = taxaView
  taxaView = new TaxaView(taxon)

  if(oldTaxaView){
    calculateExitEnterLocations(oldTaxaView, taxaView)
  }
  
  childDragPosition[0].dx = 0
  d3Update()
}

function calculateExitEnterLocations(oldTaxaView, newTaxaView){
  let oldTaxonBoxes = oldTaxaView.getTaxonBoxesArray()
  let oldTaxonBoxesInfo = oldTaxonBoxes.map(taxonBox => {return {
    position: taxonBox.position,
    name: taxonBox.taxon.name,
    taxonBox: taxonBox
  }})
  // TODO: make sure these are set, I'll have to switch up d3update
  let taxaViewHeight = taxaViewSVG.node().getBoundingClientRect().height;
  let taxaViewWidth = taxaViewSVG.node().getBoundingClientRect().width;
  setScales(taxaViewHeight, taxaViewWidth)

  taxaView.updateTaxonBoxes()
  let newTaxonBoxes = taxaView.getTaxonBoxes()

  let newTaxonBoxesInfo = newTaxonBoxes.map(taxonBox => {return {
    position: taxonBox.position,
    name: taxonBox.taxon.name,
    taxonBox: taxonBox
  }})

  let oldTaxonNames = oldTaxonBoxesInfo.map(a => a.name)
  let newTaxonNames = newTaxonBoxesInfo.map(a => a.name)


  let exitingBoxes = []
  let enteringBoxes = []
  let updatingBoxes = []

  for(const oldTaxonBoxInfo of oldTaxonBoxesInfo){
    if(newTaxonNames.includes(oldTaxonBoxInfo.taxonBox.name)){
      updatingBoxes.push({
        type: "updating",
        old: oldTaxonBoxInfo,
        new: newTaxonBoxesInfo[newTaxonNames.indexOf(oldTaxonBoxInfo.name)]
      })
    } else{
      oldTaxonBoxInfo.type = "exiting"
      exitingBoxes.push(oldTaxonBoxInfo)
    }
  }
  for(const newTaxonBoxInfo of newTaxonBoxesInfo){
    if(!oldTaxonNames.includes(newTaxonBoxInfo.taxonBox.name)){
      newTaxonBoxesInfo.type = "entering"
      enteringBoxes.push(newTaxonBoxInfo)
    }
  }

  let generalVerticalDirection
  for(const taxonBoxInfo of updatingBoxes){
    let oldVert = getVerticalNum(taxonBoxInfo.old.position)
    let newVert = getVerticalNum(taxonBoxInfo.new.position)
    if(oldVert > newVert){
      console.log("setting vertical direction down", taxonBoxInfo.name)
      taxonBoxInfo.vDirect = "down"
      generalVerticalDirection = "down"
    } else if (oldVert < newVert){
      console.log("setting vertical direction up", taxonBoxInfo.name)
      taxonBoxInfo.vDirect = "up"
      generalVerticalDirection = "up"
    }
  }

  //////////////////////////////////
  //first pass solution, all up or down
  // for(const taxonBoxInfo of enteringBoxes){
  //   taxonBoxInfo.taxonBox.virticalDirection = generalVerticalDirection
  // }

  // for(const taxonBoxInfo of exitingBoxes){
  //   taxonBoxInfo.taxonBox.virticalDirection = generalVerticalDirection
  // }

  // let updatingBoxesByVertNum = {
  //   "old": updatingBoxes.sort((a, b), getVerticalNum(a.old.position) < getVerticalNum(b.old.position)),
  //   "new": updatingBoxes.sort((a, b), getVerticalNum(a.new.position) < getVerticalNum(b.new.position))
  // }

  // function findUpdatingAboveBelow(taxonBoxInfo, updatingBoxes, oldOrNew){
    
  //   let vertNum = getVerticalNum(taxonBoxInfo.position)
    
  //     // find closest updating box above if it exists
  //   let closestUpdatingAbove = false
  //   let closestUpdatingBelow = false
  //   for(const updatingBox of updatingBoxes[oldOrNew]){
      
  //     if(getVerticalNum(updatingBox.old.position) > vertNum){
  //       if(["pop-ancestor", "parent", "main", "child"].includes(taxonBoxInfo.position.name)){
  //         // TODO: Or ancestor, and same branch as child
  //         if(!closestUpdatingAbove){
  //           closestUpdatingAbove = updatingBox
  //         }
  //       }
  //     }
  //     if(getVerticalNum(updatingBox.old.position) > vertNum){
  //       if(["pop-ancestor", "parent", "main"].includes(taxonBoxInfo.position.name)){
  //         // TODO: or "child" or ancestor and same branch
  //         closestUpdatingBelow = updatingBox
  //       }
  //     }
  //   }
  // }

  // // entering boxes
  // for(const taxonBoxInfo of enteringBoxes){
  //   let [above, below] = findUpdatingAboveBelow(taxonBoxInfo, updatingBoxes, "new")
  //   // entering as an ancestor
  //   if(taxonBoxInfo.position.name == "pop-ancestor"){

  //   }
  //   taxonBoxInfo.taxonBox.virticalDirection = generalVerticalDirection
  // }


      // TODO: compare new taxa view with old one for figuring out motion
    // for each box in old/new view
      // find if they are in both, note position change
    // if none are in both (or old view doesn't exist), all fade in
    // if some are in both
      // if any move up or down, that sets general direction
      // for each box check up and down the tree for some guidance on where to go
      // if a parent and child both still exist, this dissapears between them
      // will have to look at neighbor children too, for coming in from side


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

function sortTaxaByBranchPopularity(taxa){
  let taxaCopy = taxa.slice()
  taxaCopy.sort((a, b) =>{
      //find max popularity in subtaxa and it's descendents
      if(a.getMaxThisOrSubtaxaPopularity() > b.getMaxThisOrSubtaxaPopularity()){
          return -1
      } else if(a.getMaxThisOrSubtaxaPopularity() < b.getMaxThisOrSubtaxaPopularity()){
          return 1
      }

      // find out which one has more popular subtaxa
      if(a.popularSubtaxa && (
          !b.popularSubtaxa || 
          a.popularSubtaxa.length > b.popularSubtaxa.length
        )){
        return -1
      }else if(b.popularSubtaxa && (
        !a.popularSubtaxa || 
        b.popularSubtaxa.length > a.popularSubtaxa.length
        )){
          return 1
      }
      
      // otherwise alphabetical order
      if(a.name > b.name){
          return 1
      }else if (a.name < b.name){
          return -1
      } else{
          return 0
      }
    
  })

  //console.log("sorted normal", taxaCopy.map(taxon => taxon.name + ": " + taxon.getMaxThisOrSubtaxaPopularity()))
  return taxaCopy
}

// sort boxes by the popularity of thier branch (max of their or childrens' popularities)
// then make that sort centered (so boxes are centered in view)
function centerSortTaxaByBranchPopularity(taxa){
  let sortedTaxa = sortTaxaByBranchPopularity(taxa)
  let centeredSortedtaxa = []
  let addToFront = false
  for(const subtaxa of sortedTaxa){
      if(addToFront){
        centeredSortedtaxa.push(subtaxa)
      }else{
        centeredSortedtaxa.unshift(subtaxa)
      }
      addToFront = !addToFront
  }

  return centeredSortedtaxa
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
        let centerSortedSubtaxa = centerSortTaxaByBranchPopularity(mainTaxon.subtaxa)

        this.subtaxonBoxes = []
        for(const [subtaxonNum, subtaxon] of centerSortedSubtaxa.entries()){
          this.subtaxonBoxes.push(findOrCreateTaxonBox(taxaContainer, subtaxon))
          if(subtaxon.popularSubtaxa && subtaxon.popularSubtaxa.length > 0){
            let sortedPopSubtaxa = sortTaxaByBranchPopularity(subtaxon.popularSubtaxa)

            if(!this.popularSubtaxonBoxes){
              this.popularSubtaxonBoxes = []
            }
            this.popularSubtaxonBoxes[subtaxonNum] = []
            for(const popSubtaxon of sortedPopSubtaxa){
              this.popularSubtaxonBoxes[subtaxonNum].push(findOrCreateTaxonBox(taxaContainer, popSubtaxon))
            }
          }
        }
      }
      
    }
  }

  getTaxonBoxesArray(){
    let taxonBoxes = []
    taxonBoxes.push(this.mainTaxonBox)
    if(this.parentTaxonBox){
      taxonBoxes.push(this.parentTaxonBox)
    }
    if(this.popularAncestorsTaxonBoxes){
      for(const  popAncestorTaxonBox of this.popularAncestorsTaxonBoxes){
        taxonBoxes.push(popAncestorTaxonBox)
      }
    }
    if(this.subtaxonBoxes){
      for(const subtaxonBox of this.subtaxonBoxes){
        taxonBoxes.push(subtaxonBox)
      }
    }
    if(this.subtaxonBoxes){
      for(const subtaxonBox of this.subtaxonBoxes){
        taxonBoxes.push(subtaxonBox)
      }
    }
    if(this.popularSubtaxonBoxes){
      for(const a of this.popularSubtaxonBoxes){
        if(a){
          for(const popSubtaxonBox of a){
            taxonBoxes.push(popSubtaxonBox)
          }
        }
      }
    }
    return taxonBoxes;
  }

  getTaxonBoxes(){
    let taxonBoxes = []
    
    //set position, scale, and open for each TaxonBox
    this.mainTaxonBox.position = {name: "main"}
    this.mainTaxonBox.isOpen = true
    this.mainTaxonBox.centerX = pixelScale(getHorizontalCenter())
    this.mainTaxonBox.centerY = pixelScale(verticalSpacingLookup["main-box"].middle)
    this.mainTaxonBox.rotate = 0
    this.mainTaxonBox.scale = 1
    this.mainTaxonBox.dragX = 0
    this.mainTaxonBox.updatePositionsAndSizes()
    taxonBoxes.push(this.mainTaxonBox)

    if(this.parentTaxonBox){
      this.parentTaxonBox.position = {name: "parent"}
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
        popAncestorTaxonBox.position = {name: "pop-ancestor", num: popAncestorNum, total: numPopAncestors}
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
        subtaxonBox.position = {name: "child", num: subtaxonNum, total: numSubtaxa}
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
            popSubtaxonBox.position = {name: "pop-descendants", num: subtaxonNum, total: numSubtaxa, popNum: popSubtaxonNum, totalPop: numPopSubtaxa} 
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