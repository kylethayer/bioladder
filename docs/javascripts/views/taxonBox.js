import {navigateToTaxonViaUrl} from "../controllers/mainController.js"
import {taxonLabelHeight, taxonBoxOpenHeight, taxonBoxClosedWidth, taxonBoxOpenWidth,  pixelScale} from "./taxonBoxPositionCalculator.js"

const transitionSpeed = 1000


class TaxonBox{
    constructor(taxon){
        this.taxon = taxon
        this.isOpen = false
        this.centerX = 0
        this.centerY = 0
        this.updatePositionsAndSizes()
    }

    updatePositionsAndSizes(){
        this.labelHeight = pixelScale(taxonLabelHeight)

        if(this.isOpen){
            this.width = pixelScale(taxonBoxOpenWidth)
            this.height = pixelScale(taxonBoxOpenHeight)
        }else{
            this.width = pixelScale(taxonBoxClosedWidth)
            this.height = pixelScale(taxonLabelHeight)
        }


        this.x = this.centerX - this.width / 2
        this.y = this.centerY - this.height / 2

        this.leftX = this.x
        this.rightX = this.x + this.width
        this.topY = this.y
        this.bottomY = this.y + this.height
    }

}

function findOrCreateTaxonBox(taxaContainer, taxon){
    let allCurrentTaxonBoxes = 
        taxaContainer
            .selectAll("g.taxon-box")
            .data()

    for(const taxonBox of allCurrentTaxonBoxes){
        if(taxonBox.taxon.name == taxon.name){
            return taxonBox
        }
    }
    return new TaxonBox(taxon)
}

function taxon_box_initial_features (g){
    g.attr('transform', (d) =>  `translate(${d.x},${-50})`)
}

function taxon_box_transform_features (g){
    g.attr('transform', (d) =>  `translate(${d.x},${d.y})`)
}

function taxon_box_background_transform_features (background){
    background
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.height)
        .attr('style', (d) => {
            let popularity = d.taxon.popularity ? d.taxon.popularity : 0;
            let minShadowWidth = popularity / 100.0 * 0.3;
            let maxShadowWidth = popularity / 100.0 * 0.9;
            return `filter: drop-shadow(0 ${minShadowWidth}em ${maxShadowWidth}em rgba(0,0,0,0.8));`
        })
}

function taxon_box_label_rect_transform_features(label_rect){
    label_rect
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.labelHeight)
        .attr('fill', 'orange')
}

function taxon_box_label_text_transform_features(label_text){
    label_text
        .attr('x', (d) => d.width / 2)
        .attr('y', (d) => d.labelHeight / 2)
}

function taxon_box_image_initial_features(image){
    image.attr('x', 10)
    .attr('y', (d) => d.labelHeight +10)
    .attr('style', (d) => {
        return `width:${0}px; height:${0}px;`
    })
}

function taxon_box_image_transform_features(image){
    image.attr('x', 10)
        .attr('y', (d) => d.labelHeight +10)
        .attr('style', (d) => {
            return `width:${d.width / 2}px; height:${d.height / 2}px;`
        })
}

function taxon_box_outline_transform_features(outline){
    outline
    .attr('width', (d) => d.width)
    .attr('height', (d) => d.height)
}


function taxonBoxD3(taxonBoxes, taxaContainer){

    // NOTE: We'll also need a loading circle for unknown / loading
    let taxon_svg_groups = 
    taxaContainer
      .selectAll("g.taxon-box")
      .data(taxonBoxes, (d) => d.taxon.name)
      .join(enter => {
        let g = enter.append('g')
        taxon_box_initial_features(g)

        //background (with box shadow)
        let background = g.append('rect')
            .attr('class', 'taxon-box-background')
        taxon_box_background_transform_features(background)
            
        //taxonLabel rectangle
        let label_rect = g.append('rect')
            .attr('class', 'taxon-label-rect')
        taxon_box_label_rect_transform_features(label_rect)
        
        // label text
        let label_text = g.append('text')
            .attr('class', 'taxon-label-text')
        taxon_box_label_text_transform_features(label_text)
        
        //image (only for those that have images)
        let image = g.append('image')
          .attr('class', 'taxon-wikipedia-img')
        taxon_box_image_initial_features(image)

        // outline
        let outline = g.append('rect')
            .attr('class', 'taxon-box-outline')
        taxon_box_outline_transform_features(outline)
        
        return g
      })
      .attr('class', 'taxon-box')
      .on("click", (event, d) => navigateToTaxonViaUrl(d.taxon.name))
      .transition().duration(transitionSpeed)
    taxon_box_transform_features(taxon_svg_groups)

  

    //background (with box shadow)
    let background = d3.selectAll("rect.taxon-box-background")
      .transition().duration(transitionSpeed)
    taxon_box_background_transform_features(background)
    
    //taxonLabel rectangle
    let label_rect = d3.selectAll("rect.taxon-label-rect")
        .transition().duration(transitionSpeed)
    taxon_box_label_rect_transform_features(label_rect)

    // label text
    let label_text = d3.selectAll("text.taxon-label-text")
        .text((d) => d.taxon.name)
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle')
        .transition().duration(transitionSpeed)
    taxon_box_label_text_transform_features(label_text)
        

    // image (only for those that have images)
    let image = d3.selectAll("image.taxon-wikipedia-img")
        .attr('class', 'taxon-wikipedia-img')
        .attr('href', (d) => d.taxon.getPreviewImage())
        .attr('hidden', (d) => d.taxon.getPreviewImage() && d.isOpen ? null: true)
        .transition().duration(transitionSpeed)
    taxon_box_image_transform_features(image)
        
    // outline
    let outline = d3.selectAll("rect.taxon-box-outline")
      .transition().duration(transitionSpeed)
    taxon_box_outline_transform_features(outline)


}

export {TaxonBox, taxonBoxD3, findOrCreateTaxonBox}