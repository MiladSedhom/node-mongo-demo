import express from 'express'
import { Address } from '../models/index.js'

const router = express.Router()

router.post('/', async (req, res) => {
	const address = req.body
	const newAddress = await Address.create(address)
	await Student.findByIdAndUpdate(newAddress.student, { $push: { addresses: newAddress._id } })
	return res.send(newAddress)
})

router.delete('/:id', async (req, res) => {
	const id = req.params.id
	const address = await Address.findByIdAndDelete(id)
	await Student.findByIdAndUpdate(address.student, { $pull: { addresses: address._id } })
	return res.send(address)
})

router.put('/:id', async (req, res) => {
	const id = req.params.id
	const newAddressData = req.body

	const oldAddress = await Address.findById(id)
	const newAddress = await Address.findByIdAndUpdate(id, newAddressData, { new: true })

	console.log(oldAddress, newAddress)

	await Student.findByIdAndUpdate(oldAddress.student, { $pull: { addresses: oldAddress._id } })
	await Student.findByIdAndUpdate(newAddress.student, { $push: { addresses: newAddress._id } })

	return res.send(newAddress)
})

router.get('/student/:id', async (req, res) => {
	const id = req.params.id
	const address = await Address.find({ student: id })
	console.log(address)
	return res.send(address)
})

export default router
