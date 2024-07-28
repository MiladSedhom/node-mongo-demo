import express from 'express'
import { Skill, Student } from '../models/index.js'

const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const skills = await Skill.find()
		res.status(200).json(skills)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: e.message })
	}
})

router.post('/', async (req, res) => {
	const skill = req.body
	try {
		const newSkill = await Skill.create(skill)
		await Student.updateMany({ _id: newSkill.students }, { $push: { skills: newSkill._id } })
		return res.status(200).send(newSkill)
	} catch (e) {
		console.log(e)
		return res.status(500).send('Error adding skill')
	}
})

router.put('/:id', async (req, res) => {
	const id = req.params.id
	const newSkillData = req.body

	const oldSkill = await Skill.findById(id)
	const newSkill = await Skill.findByIdAndUpdate(id, newSkillData, { new: true })
	// { new : true } makes mongoose return the updated doc rather than the old one

	await Student.updateMany({ _id: oldSkill.students }, { $pull: { skills: oldSkill._id } })
	await Student.updateMany({ _id: newSkill.students }, { $push: { skills: newSkill._id } })

	return res.send(newSkill)
})

router.delete('/:id', async (req, res) => {
	const id = req.params.id
	const skill = await Skill.findByIdAndDelete(id)
	await Student.updateMany({ _id: skill.students }, { $pull: { skills: skill._id } })
	return res.send(skill)
})

export default router
