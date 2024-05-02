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
        this.centerX = 0
        this.centerY = 0
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

    updatePositions(){
        this.x = this.centerX - this.width / 2
        this.y = this.centerY - this.height / 2

        this.leftX = this.x
        this.rightX = this.x + this.width
        this.topY = this.y
        this.bottomY = this.y + this.height
    }

}

function taxonBoxD3(taxonBoxes, taxaContainer){

    // NOTE: We'll also need a loading circle for unknown / loading
    let taxon_svg_groups = 
    taxaContainer
      .selectAll("g.taxon-box")
      .data(taxonBoxes, (d) => d.taxon.name)
      .join(enter => {
        let g = enter.append('g')
        //background (with box shadow)
        g.append('rect')
            .attr('class', 'taxon-box-background')
        //taxonLabel rectangle
        g.append('rect')
            .attr('class', 'taxon-label-rect')
        // label text
        g.append('text')
            .attr('class', 'taxon-label-text')
        // image (only for those that have images)
        g.append('image')
          .attr('class', 'taxon-wikipedia-img')
        // outline
        g.append('rect')
            .attr('class', 'taxon-box-outline')
        return g
      })
      .attr('class', 'taxon-box')
      .attr('transform', (d) =>  
        `translate(${d.x},${d.y})`)

    //background (with box shadow)
    d3.selectAll("rect.taxon-box-background")
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('style', (d) => {
        let popularity = d.taxon.popularity ? d.taxon.popularity : 0;
        console.log("taxon", d.taxon.name, "popularity", popularity)
        let minShadowWidth = popularity / 100.0 * 0.3;
        let maxShadowWidth = popularity / 100.0 * 0.9;
        return `filter: drop-shadow(0 ${minShadowWidth}em ${maxShadowWidth}em rgba(0,0,0,0.8));`
    })
    
    //taxonLabel rectangle
    d3.selectAll("rect.taxon-label-rect")
        .attr('width', (d) => d.width)
        .attr('height', (d) => d.labelHeight)
        .attr('fill', 'orange')

    // label text
    d3.selectAll("text.taxon-label-text")
        .text((d) => {
            console.log("text label taxon name", d.taxon.name); 
            return d.taxon.name})
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle')
        .attr('x', (d) => d.width / 2)
        .attr('y', (d) => d.labelHeight / 2)

    // image (only for those that have images)
    d3.selectAll("image.taxon-wikipedia-img")
        .attr('class', 'taxon-wikipedia-img')
        .attr('href', (d) => d.taxon.wikipediaImg)
        .attr('hidden', (d) => d.taxon.wikipediaImg && d.isOpen ? null: true)
        .attr('x', 10)
        .attr('y', (d) => d.labelHeight +10)


    // outline
    d3.selectAll("rect.taxon-box-outline")
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)


}

export {TaxonBox, taxonBoxD3}