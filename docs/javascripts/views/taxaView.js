
function gotoTaxon(taxon){
    taxon.ensureLoaded()
    taxon.ensureRelatedLoaded()
    taxon.ensureRelatedRelatedLoaded()
}


export default gotoTaxon