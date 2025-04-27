import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Character from '../models/Character.js';
import Item from '../models/Item.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user and create initial character
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, characterName, characterClass } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with that email or username');
  }

  // Check if character name is taken
  const characterExists = await Character.findOne({ name: characterName });
  if (characterExists) {
    res.status(400);
    throw new Error('Character name is already taken');
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password
  });

  // Find starter items for the character's class
  let starterWeapon, starterArmor;
  const healthPotions = await Item.findOne({ name: 'Health Potion' });

  switch (characterClass) {
    case 'warrior':
      starterWeapon = await Item.findOne({ name: 'Rusty Sword' });
      starterArmor = await Item.findOne({ name: 'Leather Armor' });
      break;
    case 'mage':
      starterWeapon = await Item.findOne({ name: 'Wooden Staff' });
      starterArmor = await Item.findOne({ name: 'Cloth Robe' });
      break;
    case 'rogue':
      starterWeapon = await Item.findOne({ name: 'Rusty Dagger' });
      starterArmor = await Item.findOne({ name: 'Leather Armor' });
      break;
    case 'healer':
      starterWeapon = await Item.findOne({ name: 'Wooden Staff' });
      starterArmor = await Item.findOne({ name: 'Cloth Robe' });
      break;
    default:
      starterWeapon = await Item.findOne({ name: 'Rusty Sword' });
      starterArmor = await Item.findOne({ name: 'Leather Armor' });
  }

  // Create default character
  const character = await Character.create({
    user: user._id,
    name: characterName,
    class: characterClass || 'warrior',
    // Starting stats
    stats: {
      strength: characterClass === 'warrior' ? 12 : 10,
      intelligence: characterClass === 'mage' ? 12 : 10,
      dexterity: characterClass === 'rogue' ? 12 : 10,
      vitality: characterClass === 'healer' ? 12 : 10
    },
    // Starting gold
    gold: 100,
    // Starting equipment
    equipment: {
      weapon: starterWeapon ? starterWeapon._id : null,
      armor: starterArmor ? starterArmor._id : null
    },
    // Starting inventory
    inventory: healthPotions ? [
      { item: healthPotions._id, quantity: 5 }
    ] : []
  });

  // Add character to user's characters array
  user.characters.push(character._id);
  await user.save();

  // Create token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    character: {
      id: character._id,
      name: character.name,
      class: character.class,
      level: character.level
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide an email and password');
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Create token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('characters');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    email: req.body.email,
    username: req.body.username
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error('Password is incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token
  });
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // In a real implementation, you might want to blacklist the token here
  res.status(200).json({
    success: true,
    data: {}
  });
});