const { del } = require('express/lib/application')
const mongoose = require('mongoose')

// membentuk url, dan mengambilnya dari env variable
const url = process.env.MONGO_URI

console.log(`trying to connect to ${url}`)

// koneksi ke mongo db
mongoose.connect(url)
    .then(result => {
        console.log("connected to MongoDB 🥭🥭!")
    })
    .catch(error => {
        console.log("connection error :", error.message)
    })


const personSchema = new mongoose.Schema({
    name: String,
    number: String
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