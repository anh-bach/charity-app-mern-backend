const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const donationSchema = new mongoose.Schema(
  {
    donatedBy: {
      type: ObjectId,
      ref: 'User',
      required: [true, 'A donation should be donated by an user'],
    },
    donatedTo: {
      type: ObjectId,
      ref: 'Campaign',
      required: [true, 'A donation should belong to a campaign'],
    },
    amount: {
      type: Number,
      required: [true, 'How much is donation?'],
    },
    billInfo: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

//Make a model
const Donation = mongoose.model('Donation', donationSchema);
//Export model
module.exports = Donation;
