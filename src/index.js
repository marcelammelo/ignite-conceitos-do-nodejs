const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'To do not found!' });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/users', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  let todoAux = {};

  const newTodos = user.todos.map((todo, index, array) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
      todoAux = todo;
    }

    return todo;
  });

  user.todos = newTodos;

  /* 
    Eu poderia ter feito apenas um find no array de todos e atualizar os valores dele
    diretamente que o JS teria "entendido" qual posição precisava ser alterada
  */

  return response.status(201).json(todoAux);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todoAux = {};

  const newTodos = user.todos.map((todo, index, array) => {
    if (todo.id === id) {
      todo.done = true;
      todoAux = todo;
    }

    return todo;
  });

  user.todos = newTodos;

  /*
    Eu poderia ter feito apenas um find no array de todos e atualizar os valores dele
    diretamente que o JS teria "entendido" qual posição precisava ser alterada
  */

  return response.json(todoAux);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todo) => todo.id === id);

  user.todos.splice(index, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;