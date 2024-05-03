
class TaxonBoxElement{
    // constructor options can have
    // - elementName - the HTML tag name to create
    // - className - the class name to give these elements
    // - refreshPreTransitionFn - settings to set on elements before transition (e.g., permenent, non-transition settings)
    // - postTransitionFn - settings to transition to for new state
    // - initialTransitionFeatures - settings to start with for new elements to transition from on first appearance (defaults to using postTransitionFn)
    constructor(options){
        this.elementName = options.elementName
        this.className = options.className

        if(options.refreshPreTransitionFn){
            this.refreshPreTransitionFn = options.refreshPreTransitionFn
        }else{
            this.refreshPreTransitionFn = selection => selection
        }

        this.postTransitionFn = options.postTransitionFn

        if(options.initialTransitionFeatures){
            this.initialTransitionFeatures = options.initialTransitionFeatures
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


// Create the elements that will be part of the taxon boxes
const taxonBoxElements = [
    //background (with box shadow)
    new TaxonBoxElement({
        elementName: 'rect', 
        className: 'taxon-box-background',
        postTransitionFn: selection => selection
            .attr('width', (d) => d.width)
            .attr('height', (d) => d.height)
            .attr('style', (d) => {
                let popularity = d.taxon.popularity ? d.taxon.popularity : 0;
                let minShadowWidth = popularity / 100.0 * 0.3;
                let maxShadowWidth = popularity / 100.0 * 0.9;
                return `filter: drop-shadow(0 ${minShadowWidth}em ${maxShadowWidth}em rgba(0,0,0,0.8));`
            })
        
    }),
    //taxonLabel rectangle
    new TaxonBoxElement({
        elementName: 'rect', 
        className: 'taxon-label-rect',
        postTransitionFn: selection => selection
            .attr('width', (d) => d.width)
            .attr('height', (d) => d.labelHeight)
            .attr('fill', 'orange')
        
    }),
    // label text
    new TaxonBoxElement({
        elementName: 'text', 
        className: 'taxon-label-text',
        refreshPreTransitionFn: selection => selection
            .text((d) => d.taxon.name)
            .attr('dominant-baseline', 'central')
            .attr('text-anchor', 'middle')
        ,
        postTransitionFn: selection => selection
            .attr('x', (d) => d.width / 2)
            .attr('y', (d) => d.labelHeight / 2)
            // TODO: SCALE FONT SIZE BASED ON LABEL HEIGHT
        
    }),
    // image (hidden if no image)
    new TaxonBoxElement({
        elementName: 'image', 
        className: 'taxon-wikipedia-img',
        refreshPreTransitionFn: selection => selection
            .attr('class', 'taxon-wikipedia-img')
            .attr('href', (d) =>  d.taxon.getPreviewImage())
            .attr('hidden', (d) => d.taxon.getPreviewImage() ? null: true)
        ,
        postTransitionFn: selection => selection
            .attr('x', (d) => {
                if(d.isOpen){
                    return d.labelHeight / 2
                } else {
                    return d.labelHeight / 10
                }
            })
            .attr('y', (d) => {
                if(d.isOpen){
                    return d.labelHeight + 10
                } else {
                    return d.labelHeight / 10
                }
            })
            .attr('transform', (d) =>  `rotate(${-d.rotate}, ${d.labelHeight/1.5}, ${d.labelHeight/1.5})`)  // WHY IS ROTATE 1.5???
            .attr('style', (d) => {
                if(d.isOpen){
                    return `width:${d.width / 2}px; height:${d.height - d.labelHeight - 20}px;`
                } else {
                    return  `width:${d.labelHeight * 8 / 10 * 2}px; height:${d.labelHeight * 8 / 10}px;`
                }
            })        
    }),
    // outline
    new TaxonBoxElement({
        elementName: 'rect', 
        className: 'taxon-box-outline',
        postTransitionFn: selection => selection
            .attr('width', (d) => d.width)
            .attr('height', (d) => d.height)
    }),
]

export {taxonBoxElements}