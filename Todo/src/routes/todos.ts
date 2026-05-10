import {Router} from 'express';
import {createTodo, getAllTodos, deleteTodo , updateTodo} from '../controllers/todos'
import { appendFile } from 'fs';

const router = Router();

router.get('/', getAllTodos);

router.post('/newTodo', createTodo);

router.put('/updateTodo/:id', updateTodo);

router.delete('/deleteTodo/:id', deleteTodo);

export default router;