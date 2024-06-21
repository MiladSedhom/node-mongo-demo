import mongoose from 'mongoose'

const adressSchema = new mongoose.Schema({
	country: String,
	city: { type: String, required: true },
	street1: String,
	street2: String,
})

const studentSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	addresses: [adressSchema],
	skills: [String],
})

export const Student = mongoose.model('Student', studentSchema)
