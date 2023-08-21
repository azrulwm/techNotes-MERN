const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();

  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }

  // Add username to each note before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { id, title, text } = req.body;

  // Confirm data
  if (!id || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for user
  const user = await User.findById(id).lean().exec();

  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  // Create and store new note
  const noteObject = { user, title, text };

  const note = await Note.create(noteObject);

  if (note) {
    res
      .status(201)
      .json({ message: `New note for user ${user.username} created` });
  } else {
    res.status(400).json({ message: "Invalid note data received" });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, title, text, completed, ticket } = req.body;

  // Confirm data
  if (!id || !title || !text || typeof completed !== "boolean" || !ticket) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for notes
  const note = await Note.findOne({ _id: id }).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json({
    message: `Ticket no ${updatedNote.ticket} has already been updated`,
  });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Note ID Required" });
  }

  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();

  const reply = `Note with ticket number ${result.ticket} is deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
