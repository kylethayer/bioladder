import navigateToTaxon from "./controllers/mainController.js"

console.log("initialized")

window.onhashchange = function () {
    if(window.location.hash){
        let taxonName = window.location.hash.substring(1);
        taxonName = decodeURIComponent(taxonName)
        navigateToTaxon(taxonName);
    } else{
        window.location.hash = "#human";
    } 
}

if(!window.location.hash){
    window.location.hash = "#human";
} else {
    window.onhashchange() // first time loading make sure to trigger the first navigation
}


export default {}