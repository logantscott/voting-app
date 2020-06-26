const {
  ObjectId
} = require('mongodb');

const resultsAgg = (id) => {
  return [
    {
      '$match': {
        '_id': new ObjectId(id)
      }
    }, {
      '$lookup': {
        'from': 'votes', 
        'localField': '_id', 
        'foreignField': 'poll', 
        'as': 'votes'
      }
    }, {
      '$unwind': {
        'path': '$votes'
      }
    }, {
      '$group': {
        '_id': {
          'poll': '$_id', 
          'option': '$votes.option'
        }, 
        'votes': {
          '$sum': 1
        }
      }
    }, {
      '$group': {
        '_id': '$_id.poll', 
        'options': {
          '$push': {
            '_id': '$_id.option', 
            'votes': '$votes'
          }
        }
      }
    }
  ];
};

module.exports = {
  resultsAgg
};
