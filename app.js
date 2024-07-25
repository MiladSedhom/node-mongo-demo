import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { Address, Skill, Student } from './models/index.js'

const app = express()

app.use(express.json())

app.use(
	cors()
	// { object: 'http://localhost:*' }
)

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.send('🍃💨')
})

app.get('/students', (req, res) => {
	let { limit, page, sortBy, sortType } = req.query

	limit = parseInt(limit) ?? 5
	page = parseInt(page) ?? 0
	sortType = sortType === 'desc' ? -1 : 1 // default to ascending if sortType is not 'desc'
	const sort = sortBy ? { [sortBy]: sortType } : {}

	Student.find()
		.limit(limit)
		.skip(page * limit)
		.sort(sort)
		.populate({ path: 'addresses', select: 'country city street1 street2' })
		.populate('skills', 'name') //the second argument is the field
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			console.log(e)
			res.status(500).send('An error occurred while fetching students')
		})
})

app.get('/students/:q', async (req, res) => {
	const { q } = req.params

	let data
	try {
		if (mongoose.Types.ObjectId.isValid(q)) data = await Student.findById(q)
		else {
			data = await Student.find({
				$or: [
					{ firstName: q },
					{ lastName: q },
					{ skills: { $in: await Skill.find({ name: q }).select('_id') } },
				],
			}).populate('skills')
		}
		res.status(200).send(data)
	} catch (e) {
		console.log(e)
		res.status(500).json({ message: e.message })
	}
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
		.then(r => res.status(200).send(r))
		.catch(e => {
			res.status(500).json({ message: e.message })
			console.log(e)
		})
})

app.get('/skills', async (req, res) => {
	try {
		const skills = await Skill.find()
		res.status(200).json(skills)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: e.message })
	}
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
	'mongodb+srv://miladsedhom:vnhuC7FweqVHwXbT@cluster0.w4xm3gm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose
	.connect(DB)
	.then(r => {
		app.listen(3000, () => console.log('Listening on port 3000'))
	})
	.catch(e => {
		console.log(e)
	})
