/* eslint-disable linebreak-style */
const mongoose = require('mongoose')

// membentuk url, dan mengambilnya dari env variable
// eslint-disable-next-line no-undef
const url = process.env.MONGO_URI
console.log(`trying to connect to ${url}`)

// koneksi ke mongo db
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB 🥭🥭!')
  })
  .catch(error => {
    console.log('connection error :', error.message)
  })


const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: (v) => /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s./0-9]*$/g.test(v),
      message: props => `${props.value} is not a valid phone number!`
    },
    minlength: [8, 'number must be atleast 8 Character'],
    maxlength: [20, 'maximul length 20'],
    required: [true, 'phone number required']
  }
})

// mengubah hasil query dari mongodb
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // mengubah key _id menjadi id
    returnedObject.id = returnedObject._id.toString()

    // menghapus key _id
    delete returnedObject._id

    // menghapus key __v
    delete returnedObject.__v
  }
})




module.exports = mongoose.model('Person', personSchema)