import Guild from '../models/Guild.js';
import Character from '../models/Character.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Create new guild
// @route   POST /api/guilds
// @access  Private
export const createGuild = asyncHandler(async (req, res) => {
  const { name, description, characterId } = req.body;
  const createCost = 1000;

  const character = await Character.findById(characterId);
  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }

  // Check if character already in a guild
  if (character.guildId) {
    res.status(400);
    throw new Error('Character is already in a guild');
  }

  // Check if character has enough gold
  if (character.gold < createCost) {
    res.status(400);
    throw new Error('Not enough gold to create a guild');
  }

  // Check if guild name is taken
  const existingGuild = await Guild.findOne({ name });
  if (existingGuild) {
    res.status(400);
    throw new Error('Guild name is already taken');
  }

  // Create guild
  const guild = await Guild.create({
    name,
    description,
    leader: character._id,
    members: [{ character: character._id, role: 'leader' }]
  });

  // Deduct gold and update character
  character.gold -= createCost;
  character.guildId = guild._id;
  await character.save();

  res.status(201).json({
    success: true,
    data: guild
  });
});

// @desc    Get all guilds
// @route   GET /api/guilds
// @access  Private
export const getGuilds = asyncHandler(async (req, res) => {
  const guilds = await Guild.find()
    .populate('leader', 'name level class')
    .populate('members.character', 'name level class')
    .select('-applications -announcements -treasury');

  res.status(200).json({
    success: true,
    count: guilds.length,
    data: guilds
  });
});

// @desc    Get single guild
// @route   GET /api/guilds/:id
// @access  Private
export const getGuild = asyncHandler(async (req, res) => {
  const guild = await Guild.findById(req.params.id)
    .populate('leader', 'name level class')
    .populate('members.character', 'name level class')
    .populate('applications.character', 'name level class')
    .populate('announcements.author', 'name');

  if (!guild) {
    res.status(404);
    throw new Error('Guild not found');
  }

  res.status(200).json({
    success: true,
    data: guild
  });
});

// @desc    Apply to guild
// @route   POST /api/guilds/:id/apply
// @access  Private
export const applyToGuild = asyncHandler(async (req, res) => {
  const { characterId, message } = req.body;
  const guild = await Guild.findById(req.params.id);
  const character = await Character.findById(characterId);

  if (!guild) {
    res.status(404);
    throw new Error('Guild not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }

  // Check if character already in a guild
  if (character.guildId) {
    res.status(400);
    throw new Error('Character is already in a guild');
  }

  // Check if character already applied
  const existingApplication = guild.applications.find(
    app => app.character.toString() === characterId
  );
  if (existingApplication) {
    res.status(400);
    throw new Error('Already applied to this guild');
  }

  // Check level requirement
  if (character.level < guild.settings.minimumLevel) {
    res.status(400);
    throw new Error(`Character must be at least level ${guild.settings.minimumLevel}`);
  }

  // Add application
  guild.applications.push({
    character: characterId,
    message,
    status: 'pending'
  });

  // Auto-accept if enabled
  if (guild.settings.autoAcceptApplications) {
    await guild.addMember(characterId);
    character.guildId = guild._id;
    await character.save();
  }

  await guild.save();

  res.status(200).json({
    success: true,
    data: guild.settings.autoAcceptApplications ? 'Accepted' : 'Applied'
  });
});

// @desc    Handle application (accept/reject)
// @route   PUT /api/guilds/:id/applications/:applicationId
// @access  Private
export const handleApplication = asyncHandler(async (req, res) => {
  const { characterId, action } = req.body; // characterId is the officer/leader making the decision
  const guild = await Guild.findById(req.params.id);
  const character = await Character.findById(characterId);

  if (!guild) {
    res.status(404);
    throw new Error('Guild not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Check permissions
  if (!guild.hasPermission(characterId)) {
    res.status(403);
    throw new Error('Not authorized to handle applications');
  }

  const application = guild.applications.id(req.params.applicationId);
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (action === 'accept') {
    // Add character to guild
    await guild.addMember(application.character);
    
    // Update character's guild
    const applicantCharacter = await Character.findById(application.character);
    applicantCharacter.guildId = guild._id;
    await applicantCharacter.save();
    
    application.status = 'accepted';
  } else if (action === 'reject') {
    application.status = 'rejected';
  } else {
    res.status(400);
    throw new Error('Invalid action');
  }

  await guild.save();

  res.status(200).json({
    success: true,
    data: guild
  });
});

// @desc    Leave guild
// @route   POST /api/guilds/:id/leave
// @access  Private
export const leaveGuild = asyncHandler(async (req, res) => {
  const { characterId } = req.body;
  const guild = await Guild.findById(req.params.id);
  const character = await Character.findById(characterId);

  if (!guild) {
    res.status(404);
    throw new Error('Guild not found');
  }

  if (!character) {
    res.status(404);
    throw new Error('Character not found');
  }

  // Make sure user owns character
  if (character.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to use this character');
  }

  // Check if character is in the guild
  const member = guild.members.find(m => m.character.toString() === characterId);
  if (!member) {
    res.status(400);
    throw new Error('Character is not a member of this guild');
  }

  // Check if character is the leader
  if (guild.isLeader(characterId)) {
    res.status(400);
    throw new Error('Guild leader cannot leave without disbanding the guild');
  }

  // Remove from guild
  await guild.removeMember(characterId);
  character.guildId = undefined;
  await character.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Kick member from guild
// @route   POST /api/guilds/:id/kick
// @access  Private
export const kickMember = asyncHandler(async (req, res) => {
  const { characterId, targetCharacterId } = req.body;
  const guild = await Guild.findById(req.params.id);

  if (!guild) {
    res.status(404);
    throw new Error('Guild not found');
  }

  // Check permissions
  if (!guild.hasPermission(characterId)) {
    res.status(403);
    throw new Error('Not authorized to kick members');
  }

  // Can't kick yourself
  if (characterId === targetCharacterId) {
    res.status(400);
    throw new Error('Cannot kick yourself');
  }

  // Can't kick the leader
  if (guild.isLeader(targetCharacterId)) {
    res.status(400);
    throw new Error('Cannot kick the guild leader');
  }

  // Remove from guild
  await guild.removeMember(targetCharacterId);
  
  // Update target character
  const targetCharacter = await Character.findById(targetCharacterId);
  targetCharacter.guildId = undefined;
  await targetCharacter.save();

  res.status(200).json({
    success: true,
    data: guild
  });
});

// @desc    Promote/demote member
// @route   PUT /api/guilds/:id/members/:memberId/role
// @access  Private
export const changeMemberRole = asyncHandler(async (req, res) => {
  const { characterId, newRole } = req.body;
  const guild = await Guild.findById(req.params.id);

  if (!guild) {
    res.status(404);
    throw new Error('Guild not found');
  }

  // Only leader can change roles
  if (!guild.isLeader(characterId)) {
    res.status(403);
    throw new Error('Only the guild leader can change member roles');
  }

  // Can't change leader role
  if (guild.isLeader(req.params.memberId)) {
    res.status(400);
    throw new Error('Cannot change the leader role');
  }

  await guild.changeMemberRole(req.params.memberId, newRole);

  res.status(200).json({
    success: true,
    data: guild
  });
});

// @desc    Disband guild
// @route   DELETE /api/guilds/:id
// @access  Private
export const disbandGuild = asyncHandler(async (req, res) => {
  const { characterId } = req.body;
  const guild = await Guild.findById(req.params.id);

  if (!guild) {
    res.status(404);
    throw new Error('Guild not found');
  }

  // Only leader can disband
  if (!guild.isLeader(characterId)) {
    res.status(403);
    throw new Error('Only the guild leader can disband the guild');
  }

  // Update all member characters
  await Character.updateMany(
    { guildId: guild._id },
    { $unset: { guildId: "" } }
  );

  await guild.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});