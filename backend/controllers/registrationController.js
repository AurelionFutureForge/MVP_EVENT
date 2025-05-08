// controllers/registrationController.js
const Event = require('../models/Event');
const RegisteredUser = require('../models/RegisteredUser');

const registerUser = async (req, res) => {
  const { eventId, formData } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2. Get selected role from formData
    const selectedRoleName = formData.role;
    const selectedRole = event.eventRoles.find(role => role.roleName === selectedRoleName);
    if (!selectedRole) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // 3. Save user with registration fields + role + privileges
    const newUser = new RegisteredUser({
      eventId: event._id,
      companyName: event.companyName,
      role: selectedRole.roleName,
      privileges: selectedRole.privileges,
      registrationData: formData
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
};

module.exports = { registerUser };
