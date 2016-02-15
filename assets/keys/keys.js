/* keys for various things*/
var status = "development";

var website = {
    development:"http://localhost:4200",
    live:"http://prefect.co"
}

module.exports = {
    status:status,
    DB:{
        default:"mongodb://obama:drama@ds042698.mongolab.com:42698/prefect"  
    },
    domain:{
        default:website[status],
    },
}