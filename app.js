import express from 'express'
import mongoose from 'mongoose'
import { Address, Skill, Student } from './models/index.js'

const app = express()

app.use(express.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.send('🍃💨')
})

app.get('/students', (req, res) => {
	Student.find()
		.populate({ path: 'addresses', select: 'country city street1 street2' })
		.populate('skills', 'name') //the second argument is the field
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			console.log(e)
		})
})

app.get('/student/id/:id', (req, res) => {
	const { id } = req.params

	Student.findById(id)
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.get('/student/name/:name', (req, res) => {
	const { name } = req.params

	Student.find({ $or: [{ firstName: name }, { lastName: name }] })
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.get('/student/skill/:skill', (req, res) => {
	const { skill } = req.params

	Student.find({ skills: skill })
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

app.put('/students/:id', (req, res) => {
	const { id } = req.params

	Student.findByIdAndUpdate(id, req.body)
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

app.post('/students', (req, res) => {
	Student.create(req.body)
		.then(r => res.send(r))
		.catch(e => console.log(e))
})

app.post('/skills', async (req, res) => {
	const skill = req.body
	const newSkill = await Skill.create(skill)
	await Student.updateMany({ _id: newSkill.students }, { $push: { skills: newSkill._id } })
	return res.send(newSkill)
})

app.post('/addresses', async (req, res) => {
	const address = req.body
	const newAddress = await Address.create(address)
	await Student.findByIdAndUpdate(newAddress.student, { $push: { addresses: newAddress._id } })
	return res.send(newAddress)
})

app.delete('/skills/:id', async (req, res) => {
	const id = req.params.id
	const skill = await Skill.findByIdAndDelete(id)
	await Student.updateMany({ _id: skill.students }, { $pull: { skills: skill._id } })
	return res.send(skill)
})

app.delete('/addresses/:id', async (req, res) => {
	const id = req.params.id
	const address = await Address.findByIdAndDelete(id)
	await Student.findByIdAndUpdate(address.student, { $pull: { addresses: address._id } })
	return res.send(address)
})

app.put('/skills/:id', async (req, res) => {
	const id = req.params.id
	const newSkillData = req.body

	const oldSkill = await Skill.findById(id)
	const newSkill = await Skill.findByIdAndUpdate(id, newSkillData, { new: true })
	// { new : true } makes mongoose return the updated doc rather than the old one

	await Student.updateMany({ _id: oldSkill.students }, { $pull: { skills: oldSkill._id } })
	await Student.updateMany({ _id: newSkill.students }, { $push: { skills: newSkill._id } })

	return res.send(newSkill)
})

app.put('/addresses/:id', async (req, res) => {
	const id = req.params.id
	const newAddressData = req.body

	const oldAddress = await Address.findById(id)
	const newAddress = await Address.findByIdAndUpdate(id, newAddressData, { new: true })

	console.log(oldAddress, newAddress)

	await Student.findByIdAndUpdate(oldAddress.student, { $pull: { addresses: oldAddress._id } })
	await Student.findByIdAndUpdate(newAddress.student, { $push: { addresses: newAddress._id } })

	return res.send(newAddress)
})

app.get('/addresses/student/:id', async (req, res) => {
	const id = req.params.id
	const address = await Address.find({ student: id })
	console.log(address)
	return res.send(address)
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
