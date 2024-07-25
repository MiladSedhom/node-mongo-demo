import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import studentsRouter from './router/students.js'
import skillsRouter from './router/skills.js'
import addressesRouter from './router/addresses.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
	res.send('🍃💨')
})
app.use('/students', studentsRouter)
app.use('/skills', skillsRouter)
app.use('/addresses', addressesRouter)

const DB =
	'mongodb+srv://miladsedhom:vnhuC7FweqVHwXbT@cluster0.w4xm3gm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose
	.connect(DB)
	.then(r => {
		app.listen(3000, () => console.log('Listening on port 3000'))
	})
	.catch(e => {
		console.log(e)
	})
