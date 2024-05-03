
class TaxonBoxElement{
    constructor(elementName, className, 
        refreshPreTransitionFn, postTransitionFn, initialTransitionFeatures){
        this.elementName = elementName
        this.className = className
        this.refreshPreTransitionFn = refreshPreTransitionFn
        this.postTransitionFn = postTransitionFn
        if(initialTransitionFeatures){
            this.initialTransitionFeatures = initialTransitionFeatures
        }else{
            this.initialTransitionFeatures = this.postTransitionFn
        }
    }

    enterFn(g){
        let newSelection = g.append(this.elementName)
            .attr('class', this.className )
        this.initialTransitionFeatures(newSelection)
    }

    refreshFn(transitionSpeed){
        let selection = d3.selectAll(`${this.elementName}.${this.className}`)
        selection = this.refreshPreTransitionFn(selection)
        selection = selection.transition().duration(transitionSpeed)
        this.postTransitionFn(selection)
      
    }
}

const taxonBoxElements = [
    //background (with box shadow)
    new TaxonBoxElement('rect', 'taxon-box-background',
        selection => selection,
        selection => 
            selection
                .attr('width', (d) => d.width)
                .attr('height', (d) => d.height)
                .attr('style', (d) => {
                    let popularity = d.taxon.popularity ? d.taxon.popularity : 0;
                    let minShadowWidth = popularity / 100.0 * 0.3;
                    let maxShadowWidth = popularity / 100.0 * 0.9;
                    return `filter: drop-shadow(0 ${minShadowWidth}em ${maxShadowWidth}em rgba(0,0,0,0.8));`
                })
        
    ),
    //taxonLabel rectangle
    new TaxonBoxElement('rect', 'taxon-label-rect',
        selection => selection,
        selection => 
            selection
                .attr('width', (d) => d.width)
                .attr('height', (d) => d.labelHeight)
                .attr('fill', 'orange')
        
    ),
    // label text
    new TaxonBoxElement('text', 'taxon-label-text',
        selection => 
            selection
                .text((d) => d.taxon.name)
                .attr('dominant-baseline', 'central')
                .attr('text-anchor', 'middle')
        ,
        selection => 
            selection
                .attr('x', (d) => d.width / 2)
                .attr('y', (d) => d.labelHeight / 2)
        
    ),
    // image (only for those that have images)
    new TaxonBoxElement('image', 'taxon-wikipedia-img',
        selection => 
            selection
                .attr('class', 'taxon-wikipedia-img')
                .attr('href', (d) => d.taxon.getPreviewImage())
                .attr('hidden', (d) => d.taxon.getPreviewImage() && d.isOpen ? null: true)
        ,
        selection => 
            selection
                .attr('x', 10)
                .attr('y', (d) => d.labelHeight +10)
                .attr('style', (d) => {
                    return `width:${d.width / 2}px; height:${d.height / 2}px;`
                })
        ,
        selection =>  // initial transition features
            selection
                .attr('x', 10)
                .attr('y', (d) => d.labelHeight +10)
                .attr('style', (d) => {
                    return `width:${0}px; height:${0}px;`
                })
        
    ),
    // outline
    new TaxonBoxElement('rect', 'taxon-box-outline',
        selection => selection,
        selection => 
            selection
                .attr('width', (d) => d.width)
                .attr('height', (d) => d.height)
        
    ),
]

export {taxonBoxElements}