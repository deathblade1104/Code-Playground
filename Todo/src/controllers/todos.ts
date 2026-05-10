import {RequestHandler} from 'express';
import {Todo} from '../models/todos'

type Requestbody = {
  text : string
}

let todos : Array<Todo>=[];

export const getAllTodos : RequestHandler = (req,res,next) => {
  res.status(200).json({
    message : 'Fechted all Tasks',
    todos: todos
   });
};

export const createTodo  : RequestHandler = (req,res,next) => {
  const body = req.body as Requestbody;
  const newTodo : Todo = {
    id : new Date().toISOString(),
    text : body.text
  };
  todos.push(newTodo);

  res.status(201).json({message : 'New Todo Added successfully' ,
  newTodo: newTodo});
};

export const updateTodo : RequestHandler<{id : string}> = (req,res,next) => {
  const body = req.body as  Requestbody;
  const tid = req.params.id;
  const todoIndex = todos.findIndex(todoItem  => todoItem.id === tid);
  if(todoIndex > -1)
  {
    todos[todoIndex].text = body.text;
    return res.status(200).json({message : 'Successfully Altered Todo Task', todos : todos});
  }
  return res.status(404).json({message : 'Invalid ID for Todo Task'});
};

export const deleteTodo : RequestHandler<{id : string}> = (req,res,next) => {
  const tid = req.params.id;
  todos = todos.filter((todoItem) => todoItem.id !== tid);
  res.status(200).json({message : 'Deleted Todo Task', todos : todos});
};