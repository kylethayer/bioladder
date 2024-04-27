import navigateToTaxon from "./controllers/mainController.js"

console.log("initialized")

window.onhashchange = function () {
    if(window.location.hash){
        let taxonName = window.location.hash.substring(1);
        navigateToTaxon(taxonName);
    } else{
        window.location.hash = "#Human";
    } 
}

if(!window.location.hash){
    window.location.hash = "#Human";
} else {
    window.onhashchange() // first time loading make sure to trigger the first navigation
}


export default {}