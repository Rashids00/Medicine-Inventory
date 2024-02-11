let mongoose = require('mongoose');


let medicSchema = mongoose.Schema({
  name: String,
  price: Number,
  stockDetails: String,
  description: String,
});

module.exports = mongoose.model('medic', medicSchema)