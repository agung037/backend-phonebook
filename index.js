const express = require('express')
const morgan = require('morgan')
const res = require('express/lib/response')
const cors = require('cors')
require('dotenv').config()

const app = express()

// include phonebook model
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }))



// query semua data person dari mongodb
app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
    })
})



// query specific data berdasarkan id
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})


// dapatkan jumlah data dan tampilkan 
app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        const count = persons.length
        const date = new Date()
        response.send(`phonebook has info for ${count} people <br> ${date}`)
    })
})


// menambahkan data ke mongodb
app.post('/api/persons', (request, response) => {
    const body = request.body

    // memberitau jika body kosong
    if(body.name === undefined){
        return response.status(400).json({error : 'name missing'})
    }

    // membentuk object Person 
    const person = new Person({
        name: body.name,
        number: body.number
    })

    // menyimpan ke mongodb dan menampilkan hasil penyimpanan
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

})

// update data dari mongodb berdasarkan id
app.put('/api/persons/:id', (request, response) => {

    const body = request.body
    console.log("berusaha mengubah", request.body)
    Person.findOneAndUpdate({_id: request.params.id}, {number : body.number})
    .then(() => {
        Person.findById(request.params.id).then(person => {
            response.json(person)
        })
    })
    .catch(error => {
        console.log(error)
    })

})


// menghapus data dari mongodb
app.delete('/api/persons/:id', (request, response) => {
    // cari berdasarkan id
    Person.findById(request.params.id).then(person => {
        // hapus orang yang berhasil dicari id nya
        person.remove()
        // tampilkan di log
        console.log('data berhasil dihapus')
    })
})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`server run on port ${PORT}`))