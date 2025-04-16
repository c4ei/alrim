const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // User 모델 참조 (추후 구현)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  attachments: [String] // 파일 첨부 기능 (파일명 저장)
});

module.exports = mongoose.model('Post', postSchema);
