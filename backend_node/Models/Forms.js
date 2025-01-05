// models/Form.js
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  category_name: { type: String, required: true },
  total_count: { type: Number, default: 0 },
  user_questions: { type: Array, required: true },
  actual_values: {
    type: Array,
    default: () => [],
  },
});

module.exports = mongoose.model('Form', formSchema);
