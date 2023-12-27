const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password){
    return res.status(404).json({message: "Please provide the Username and Password"});
  }
  const doesUsersExist  = (username)=>{
    let userWithSameName = users.filter((user)=>{
      return user.username === username;
    });
    if(userWithSameName.length > 0){
      return true;
    }else{
      return false;
    }
  }
  if(doesUsersExist(username)){
    return res.status(404).json({message :"User already Exist"});
  }
  users.push({"username":username, "password": password});
  return res.status(200).send("User Registered");
});

// Get the book list available in the shop
public_users.get('/',async function(req, res) {
  const getBooks = async()=>{
    return new Promise((resolve)=>{
      resolve(books)
    });
  }
  const allBooks = await getBooks();
  return res.status(200).send(JSON.stringify(allBooks));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  const filteredBook = await books[isbn];
  if(filteredBook){
    return res.status(200).send(JSON.stringify(filteredBook));
  }
  return res.status(404).json({message: "Book not found"});

 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  function filterBooksByAuthor(books, author) {
    return new Promise((resolve) => {
      const filteredBooks = {};
      for (const key in books) {
        if (books.hasOwnProperty(key) && books[key].author === author) {
          filteredBooks[key] = books[key];
        }
      }
      resolve(filteredBooks);
    });
  }
  const filteredBooks =  await filterBooksByAuthor(books, author);
  return res.status(200).send(JSON.stringify(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  function filterBooksByTitle(books, title) {
    return new Promise((resolve) => {
      const filteredBooks = {};
      for (const key in books) {
        if (books.hasOwnProperty(key) && books[key].title === title) {
          filteredBooks[key] = books[key];
        }
      }
      resolve(filteredBooks);
    });
  }
  const filteredBooks = filterBooksByTitle(books, title);
  return res.status(200).send(JSON.stringify(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn =  req.params.isbn;
  if(books[isbn]){
    return res.status(200).send("Review added");
  }
  return res.status(404).json({message :'Not Found'});
});

module.exports.general = public_users;
