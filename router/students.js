import express from 'express'
import { Skill, Student } from '../models/index.js'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/', (req, res) => {
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

router.get('/:q', async (req, res) => {
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

router.post('/', async (req, res) => {
	try {
		let { firstName, lastName, skills } = req.body

		const student = await Student.create({ firstName, lastName, skills })
		await Skill.updateMany({ _id: { $in: skills } }, { $addToSet: { students: student._id } })
		res.status(200).send(student)
	} catch (e) {
		res.status(500).json({ message: e.message })
		console.log(e)
	}
})

router.put('/:id', (req, res) => {
	const { id } = req.params

	Student.findByIdAndUpdate(id, req.body)
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

router.delete('/:id', (req, res) => {
	const { id } = req.params

	Student.findByIdAndDelete(id)
		.then(r => {
			res.send(r)
		})
		.catch(e => {
			res.status(500).json({ message: e.message })
		})
})

export default router
