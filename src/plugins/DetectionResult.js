export default class DetectionResult {

    constructor(detection) {
        if (!Array.isArray(detection)) {
            this.raw_detection = []
        } else {
            this.raw_detection = detection
        }
    }

    get length() {
        return this.raw_detection.length
    }

    get groupedInvoice() {
        const invoice = []
        this.raw_detection.forEach((item) => {

            let itemExist = false
            for (let i = 0; i < invoice.length; i++) {
                if (item.class.id == invoice[i].id) {
                    itemExist = true
                    invoice[i].quantity++
                    break
                }
            }

            if (!itemExist) {
                invoice.push({ ...item.class, quantity: 1 })
            }
        })

        return invoice
    }

    get invoice() {
        return this.raw_detection
    }

    get invoiceTotal() {
        return this.raw_detection.reduce(
            (sum, item) => sum + item.class.price,
            0
        )
    }
}


/*
Data structure
    
-------------------------------------
invoice (Array)
-------------------------------------
    
    bbox: [
        101.13,
        235.92,
        123.69,
        294.41,
    ],
    class: {
        color: "#f44336",
        id: 1,
        name: "Coca-Cola",
        price: 5000,
    },
    score: "0.7891",


-------------------------------------
grouped invoice (Array)
-------------------------------------

    color: "#f44336",
    id: 1,
    name: "Coca-Cola",
    price: 5000,
    quantity: 1,


[[Prototype]]: Object
*/