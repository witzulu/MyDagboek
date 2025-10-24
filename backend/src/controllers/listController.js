const List = require('../models/List');
const Board = require('../models/Board');

// @desc    Create a new list
// @route   POST /api/boards/:boardId/lists
// @access  Private
exports.createList = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { boardId } = req.params;

    const board = await Board.findOne({ _id: boardId, user: req.user.id });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or user not authorized' });
    }

    // Get the highest position in the current lists and add 1
    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    const newPosition = lastList ? lastList.position + 1 : 0;

    const list = await List.create({
      name,
      board: boardId,
      position: newPosition,
    });

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a list (e.g., rename)
// @route   PUT /api/lists/:listId
// @access  Private
exports.updateList = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { listId } = req.params;

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findOne({ _id: list.board, user: req.user.id });

    if (!board) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    list.name = name;
    await list.save();

    res.status(200).json(list);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a list
// @route   DELETE /api/lists/:listId
// @access  Private
exports.deleteList = async (req, res, next) => {
  try {
    const { listId } = req.params;

    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findOne({ _id: list.board, user: req.user.id });

    if (!board) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Note: In the future, we might need to handle tasks within the list before deleting.
    // For now, we'll just remove the list.
    await list.remove();

    res.status(200).json({ message: 'List removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update the order of lists in a board
// @route   PUT /api/boards/:boardId/lists/reorder
// @access  Private
exports.reorderLists = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { orderedListIds } = req.body; // Expecting an array of list IDs

    const board = await Board.findOne({ _id: boardId, user: req.user.id });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or user not authorized' });
    }

    if (!Array.isArray(orderedListIds)) {
      return res.status(400).json({ message: 'orderedListIds must be an array' });
    }

    const bulkOps = orderedListIds.map((listId, index) => ({
      updateOne: {
        filter: { _id: listId, board: boardId },
        update: { position: index },
      },
    }));

    await List.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Lists reordered successfully' });
  } catch (error) {
    next(error);
  }
};
