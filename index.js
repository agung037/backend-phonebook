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
app.get('/api/persons/:id', (request, response, next) => {

    // temukan berdasarkan id
    Person.findById(request.params.id).then(person => {
        // jika ditemukan, berikan data
        if(person){
            response.json(person)
        }else{
            // jika tidak beriksan response error
            response.status(404).end()
        }
    })
    // kemudian jika ada response error 
    // akan ditangkap oleh express menggunakan error handler di bagian bawah
    .catch(error => next(error))

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
app.put('/api/persons/:id', (request, response, next) => {

    const body = request.body

    // membuat object yang menerima parameter berupa name dan number
    // name dan number berasal dari body json
    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


// menghapus data dari mongodb
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))

})



// membuat error handler
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malfomated id'})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`server run on port ${PORT}`))