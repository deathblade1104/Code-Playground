"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getAllTodos = void 0;
let todos = [];
const getAllTodos = (req, res, next) => {
    res.status(200).json({
        message: 'Fechted all Tasks',
        todos: todos
    });
};
exports.getAllTodos = getAllTodos;
const createTodo = (req, res, next) => {
    const body = req.body;
    const newTodo = {
        id: new Date().toISOString(),
        text: body.text
    };
    todos.push(newTodo);
    res.status(201).json({ message: 'New Todo Added successfully',
        newTodo: newTodo });
};
exports.createTodo = createTodo;
const updateTodo = (req, res, next) => {
    const body = req.body;
    const tid = req.params.id;
    const todoIndex = todos.findIndex(todoItem => todoItem.id === tid);
    if (todoIndex > -1) {
        todos[todoIndex].text = body.text;
        return res.status(200).json({ message: 'Successfully Altered Todo Task', todos: todos });
    }
    return res.status(404).json({ message: 'Invalid ID for Todo Task' });
};
exports.updateTodo = updateTodo;
const deleteTodo = (req, res, next) => {
    const tid = req.params.id;
    todos = todos.filter((todoItem) => todoItem.id !== tid);
    res.status(200).json({ message: 'Deleted Todo Task', todos: todos });
};
exports.deleteTodo = deleteTodo;
