const taxonBoxClosedWidth = 200
const taxonBoxClosedHeight = 21
const taxonLabelHeight = taxonBoxClosedHeight
const taxonBoxOpenWidth = 500
const taxonBoxOpenHeight = 293


class TaxonBox{
    constructor(taxon){
        this.taxon = taxon
        this.isOpen = false
        this.width = taxonBoxClosedWidth
        this.height = taxonBoxClosedHeight
        this.labelHeight = taxonLabelHeight
        this.x = 0
        this.y = 0
    }

    setOpen(isOpen){
        this.isOpen = isOpen
        if(isOpen){
            this.width = taxonBoxOpenWidth
            this.height = taxonBoxOpenHeight
        }else{
            this.width = taxonBoxClosedWidth
            this.height = taxonBoxClosedHeight
        }
    }

}

function taxonBoxD3(taxonBoxes, taxaContainer){

    // NOTE: We'll also need a loading circle for unknown / loading
    let taxon_svg_groups = 
    taxaContainer
      .selectAll("g.taxon-box")
      .data(taxonBoxes, (d) => d.taxon.name)
      .join('g')
      .attr('class', 'taxon-box')
      .attr('transform', (d) =>  
        `translate(${d.x},${d.y})`)

    // TODO: Below causes duplication, perhaps I need new data/join for each of the following

    //background (with box shadow)
    taxon_svg_groups
      .selectAll("rect.taxon-box-background")
      .data(taxonBoxes, (d) => d.taxon.name)
      .join('rect')
      .attr('class', 'taxon-box-background')
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('style', (d) => {
        let popularity = d.taxon.popularity ? d.taxon.popularity : 0;
        console.log("taxon", d.taxon.name, "popularity", popularity)
        let minShadowWidth = popularity / 100.0 * 0.3;
        let maxShadowWidth = popularity / 100.0 * 0.9;
        return `filter: drop-shadow(0 ${minShadowWidth}em ${maxShadowWidth}em rgba(0,0,0,0.8));`

      })
    
    // taxonLabelHeight
    taxon_svg_groups
        .selectAll("rect.taxon-label-rect")
        .data(taxonBoxes, (d) => d.taxon.name)
        .join('rect')
        .attr('class', 'taxon-label-rect')
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.labelHeight)
        .attr('fill', 'orange')

    taxon_svg_groups
        .selectAll("text.taxon-label-text")
        .data(taxonBoxes, (d) => d.taxon.name)
        .join('text')
        .attr('class', 'taxon-label-text')
        .text((d) => d.taxon.name)
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle')
        .attr('x', (d) => d.width / 2)
        .attr('y', (d) => d.labelHeight / 2)


    // outline
    taxon_svg_groups
      .selectAll("rect.taxon-box-outline")
      .data(taxonBoxes, (d) => d.taxon.name)
      .join('rect')
      .attr('class', 'taxon-box-outline')
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)


}

export {TaxonBox, taxonBoxD3}