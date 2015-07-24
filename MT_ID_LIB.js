
/*
 * Compliments script MT_CS_POValidations
 * Account IDs that qualify items for CAPEX
 * 13020
 * 13030
 * 13040
 * 13050
 * 13060 
 */
var arr = ['227','228','229','230','459']; //GL account Internal IDs


//returns the item type for a lookup
function getType(n) {
    switch (n.toLowerCase()) {
        case "assembly":
            return "assemblyitem";
        case "description":
            return "descriptionitem";
        case "discount":
            return "discountitem";
        case "dwnlditem":
            return "downloaditem";
        case "endgroup":
            return null;
        case "giftcert":
            return "giftcertificateitem";
        case "group":
            return null;
        case "invtpart":
            return "inventoryitem";
        case "kit":
            return "kititem";
        case "markup":
            return "markupitem";
        case "noninvtpart":
            return "noninventoryitem";
        case "othcharge":
            return "otherchargeitem";
        case "payment":
            return "paymentitem";
        case "service":
            return "serviceitem";
        case "shipitem":
            return null;
        case "subtotal":
            return "subtotalitem";
        case "taxgroup":
            return "taxgroup";
        case "taxitem":
            return null;
        default:
            return null;
    }
}