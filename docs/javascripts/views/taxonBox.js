const taxonBoxClosedWidth = 200
const taxonBoxClosedHeight = 21
const taxonBoxOpenWidth = 500
const taxonBoxOpenHeight = 293


class TaxonBox{
    constructor(taxon){
        this.taxon = taxon
        this.isOpen = false
        this.width = taxonBoxClosedWidth
        this.height = taxonBoxClosedHeight
    }

}

function taxonBoxD3(taxonBoxes, taxaContainer){
    // update data for current centered taxon
    // TODO: make new version of Taxon that is Taxon view data (has taxon model + location [centered, or ancestor or whatever])
    // make an overall model of things on the screen
    // NOTE: We'll also need a loading circle for unknown / loading
    let taxon_svg_groups = 
    taxaContainer
      .selectAll("g.taxon-box")
      .data(taxonBoxes, (d) => d.taxon.name)
      .join('g')
      .attr('class', 'taxon-box')


    taxon_svg_groups
        .append("rect")
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.height)
        .attr('fill', 'orange')

    taxon_svg_groups
        .append("text")
        .text((d) => d.taxon.name)
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle')
        .attr('x', (d) => d.width / 2)
        .attr('y', (d) => d.height / 2)


}

export {TaxonBox, taxonBoxD3}