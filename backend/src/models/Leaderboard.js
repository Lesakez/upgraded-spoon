import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['level', 'gold', 'pvp', 'dungeons', 'quests']
  },
  entries: [{
    character: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Character',
      required: true
    },
    rank: { 
      type: Number, 
      required: true 
    },
    value: { 
      type: Number, 
      required: true 
    },
    additionalData: mongoose.Schema.Types.Mixed // For pvp wins/losses, etc.
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Static method to update leaderboard
leaderboardSchema.statics.updateLeaderboard = async function(type) {
  let sortCriteria = {};
  let aggregationPipeline = [];
  
  switch (type) {
    case 'level':
      sortCriteria = { level: -1, experience: -1 };
      aggregationPipeline = [
        { $sort: sortCriteria },
        { $limit: 100 },
        { $project: {
          character: '$_id',
          value: '$level',
          additionalData: { experience: '$experience' }
        }}
      ];
      break;
      
    case 'gold':
      sortCriteria = { gold: -1 };
      aggregationPipeline = [
        { $sort: sortCriteria },
        { $limit: 100 },
        { $project: {
          character: '$_id',
          value: '$gold'
        }}
      ];
      break;
      
    case 'pvp':
      aggregationPipeline = [
        { $project: {
          character: '$_id',
          value: '$pvpStats.wins',
          additionalData: {
            wins: '$pvpStats.wins',
            losses: '$pvpStats.losses',
            winRate: {
              $cond: {
                if: { $eq: [{ $add: ['$pvpStats.wins', '$pvpStats.losses'] }, 0] },
                then: 0,
                else: { $multiply: [{ $divide: ['$pvpStats.wins', { $add: ['$pvpStats.wins', '$pvpStats.losses'] }] }, 100] }
              }
            }
          }
        }},
        { $sort: { value: -1 } },
        { $limit: 100 }
      ];
      break;
      
    case 'dungeons':
      aggregationPipeline = [
        { $project: {
          character: '$_id',
          value: { $size: { $ifNull: ['$completedDungeons', []] } }
        }},
        { $sort: { value: -1 } },
        { $limit: 100 }
      ];
      break;
      
    case 'quests':
      aggregationPipeline = [
        { $project: {
          character: '$_id',
          value: { $size: { $ifNull: ['$completedQuests', []] } }
        }},
        { $sort: { value: -1 } },
        { $limit: 100 }
      ];
      break;
  }
  
  // Get Character model
  const Character = mongoose.model('Character');
  const entries = await Character.aggregate(aggregationPipeline);
  
  // Add ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  // Update or create leaderboard
  await this.findOneAndUpdate(
    { type },
    { 
      type,
      entries,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
};

export default mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);