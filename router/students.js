import express from 'express'
import { Address, Skill, Student } from '../models/index.js'
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
		if (mongoose.Types.ObjectId.isValid(q)) data = await Student.findById(q).populate('skills addresses')
		else {
			data = await Student.find({
				$or: [
					{ firstName: q },
					{ lastName: q },
					{ skills: { $in: await Skill.find({ name: q }).select('_id') } },
				],
			}).populate('skills addresses')
		}
		res.status(200).send(data)
	} catch (e) {
		console.log(e)
		res.status(500).json({ message: e.message })
	}
})

router.post('/', async (req, res) => {
	try {
		let { firstName, lastName, skills, addresses: addressesData } = req.body

		const student = await Student.create({ firstName, lastName, skills })

		const addresses = await Promise.all(
			addressesData.map(async address => Address.create({ ...address, student: student._id, _id: undefined }))
		)

		student.addresses = addresses.map(a => a._id)
		student.save()

		await Skill.updateMany({ _id: { $in: skills } }, { $addToSet: { students: student._id } })
		res.status(200).send(student)
	} catch (e) {
		res.status(500).json({ message: e.message })
		console.log(e)
	}
})

router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params
		let { firstName, lastName, skills, addresses } = req.body

		console.log(req.body)

		const student = await Student.findById(id)
		if (!student) return res.status(404).json({ message: 'Student not found' })

		student.firstName = firstName
		student.lastName = lastName

		if (skills) {
			await Skill.updateMany(
				{ _id: { $in: student.skills, $nin: skills.map(s => s._id) } },
				{ $pull: { students: student._id } }
			)

			await Skill.updateMany(
				{ _id: { $in: skills.map(s => s._id), $nin: student.skills } },
				{ $addToSet: { students: student._id } }
			)

			student.skills = skills.map(s => s._id)
		}

		if (addresses) {
			await Address.deleteMany({
				_id: {
					$in: student.addresses,
					$nin: addresses.map(a => {
						if (a._id) return a._id
					}),
				},
				student: student._id,
			})

			// Add or update new addresses
			for (let address of addresses) {
				if (address._id) {
					console.log('if')
					await Address.findByIdAndUpdate(address._id, {
						...address,
						student: student._id,
					})
				} else {
					console.log('else')
					console.log(address)
					const newAddress = new Address({ ...address, _id: undefined, student: student._id })
					await newAddress.save()
					student.addresses.push(newAddress._id)
				}
			}
		}

		await student.save()

		const updatedStudent = await Student.findById(id).populate('skills').populate('addresses')

		res.status(200).json(updatedStudent)
	} catch (e) {
		console.error('Error updating student:', e)
		res.status(500)
	}
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
