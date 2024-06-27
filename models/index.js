import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	addresses: [{ type: mongoose.Schema.ObjectId, ref: 'Address' }],
	skills: [{ type: mongoose.Schema.ObjectId, ref: 'Skill' }],
})

const addressSchema = new mongoose.Schema({
	country: { type: String, required: true },
	city: { type: String, required: true },
	street1: { type: String, required: true },
	street2: String,
	student: { type: mongoose.Schema.ObjectId, ref: 'Student' },
})

const skillSchema = new mongoose.Schema({
	name: { type: String, required: true },
	students: [{ type: mongoose.Schema.ObjectId, ref: 'Student' }],
})

export const Student = mongoose.model('Student', studentSchema)
export const Address = mongoose.model('Address', addressSchema)
export const Skill = mongoose.model('Skill', skillSchema)
