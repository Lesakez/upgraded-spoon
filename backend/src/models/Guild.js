import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Guild name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Guild name must be at least 3 characters long'],
    maxlength: [30, 'Guild name cannot exceed 30 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  members: [{
    character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
    role: { 
      type: String, 
      enum: ['leader', 'officer', 'member'],
      default: 'member'
    },
    joinedAt: { type: Date, default: Date.now }
  }],
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 20
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  gold: {
    type: Number,
    default: 0,
    min: 0
  },
  treasury: {
    items: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      quantity: { type: Number, default: 1 }
    }]
  },
  settings: {
    autoAcceptApplications: { type: Boolean, default: false },
    minimumLevel: { type: Number, default: 1 },
    maxMembers: { type: Number, default: 50 }
  },
  applications: [{
    character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
    message: String,
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  announcements: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to add member
guildSchema.methods.addMember = async function(characterId, role = 'member') {
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Guild is full');
  }
  
  const memberExists = this.members.some(m => m.character.toString() === characterId.toString());
  if (memberExists) {
    throw new Error('Character is already a member');
  }
  
  this.members.push({ character: characterId, role });
  await this.save();
};

// Method to remove member
guildSchema.methods.removeMember = async function(characterId) {
  const memberIndex = this.members.findIndex(m => m.character.toString() === characterId.toString());
  if (memberIndex === -1) {
    throw new Error('Character is not a member');
  }
  
  this.members.splice(memberIndex, 1);
  await this.save();
};

// Method to promote/demote member
guildSchema.methods.changeMemberRole = async function(characterId, newRole) {
  const member = this.members.find(m => m.character.toString() === characterId.toString());
  if (!member) {
    throw new Error('Character is not a member');
  }
  
  member.role = newRole;
  await this.save();
};

// Method to check if character is guild leader
guildSchema.methods.isLeader = function(characterId) {
  return this.leader.toString() === characterId.toString();
};

// Method to check if character is officer or leader
guildSchema.methods.hasPermission = function(characterId) {
  const member = this.members.find(m => m.character.toString() === characterId.toString());
  return member && (member.role === 'leader' || member.role === 'officer');
};

export default mongoose.models.Guild || mongoose.model('Guild', guildSchema);