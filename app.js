import express from 'express'
import mongoose from 'mongoose'
import { Student } from './models/student.js'

const app = express()

app.use(express.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.send('🍃💨')
})

app.get('/students', (req, res) => {
	Student.find()
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			console.log(e)
		})
})

app.get('/students/id/:id', (req, res) => {
	const { id } = req.params

	Student.findById(id)
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.put('/students/id/:id', (req, res) => {
	const { id } = req.params

	Student.findByIdAndUpdate(id, req.body)
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.get('/students/name/:name', (req, res) => {
	const { name } = req.params

	Student.find({ $or: [{ firstName: name }, { lastName: name }] })
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.get('/students/skill/:skill', (req, res) => {
	const { skill } = req.params

	Student.find({ skills: skill })
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.delete('/students/:id', (req, res) => {
	const { id } = req.params

	Student.findByIdAndDelete(id)
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.post('/create-student', (req, res) => {
	Student.create(req.body)
		.then(r => res.send(r))
		.catch(e => console.log(e))
})

const DB =
	'mongodb+srv://miladsedhom:kXeBGxI9Wh94gODh@cluster0.juqbpjn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose
	.connect(DB)
	.then(r => {
		app.listen(3000, () => console.log('Listening on port 3000'))
	})
	.catch(e => {
		console.log(e)
	})
