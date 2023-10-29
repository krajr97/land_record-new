
const mongoose = require('mongoose');

const LutautSchema = new mongoose.Schema({
    village_name:{
        type : String,
        required : true,
    },
    khata : {
        type : String,
        required :true,
    },
    keshera : {
        type : String,
        required :true,
    },
    acre : {
        type : String,
        required :true,
    },
    dismil : {
        type : String,
        required :true,
    },
    old_property_holder : {
        type : String,
        required :true,
    },
    north : {
        type : String,
        required :true,
    },
    south : {
        type : String,
        required :true,
    },
    east : {
        type : String,
        required :true,
    },
    west : {
        type : String,
        required :true,
    },
    jamabandi : {
        type : String,
        required :true,
    },
    new_property_holder : {
        type : String,
        required :true,
    },
    remarks : {
        type : String,
        required :true,
    },
    created:{
        type : Date,
        required : true,
        default : Date.now
    }
});

module.exports = mongoose.model('lutauts', LutautSchema);