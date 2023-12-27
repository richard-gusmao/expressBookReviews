const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  if(username.length >= 4){
    return true;
  }else{
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validUsers = users.filter((user)=>{
    return (user.username === username && user.password === password)  
  });
  if(validUsers.length > 0 ){
    return true;
  }else{
    return false;
  }
}
const secretKey = "access";


//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user  = users.filter((u)=>u.username === username && u.password === password);
  if(!user.length==1){
    return res.status(401).json({message:"Invalid Credentials"});
  }
  const token = jwt.sign({username: username, password:password, user: user}, secretKey, {expiresIn : 60 * 60 * 60});
  if(token){
    req.session.authorization = {token, username};
    return res.status(200).send("Logged in");
  }else{
    return res.status(404).json({message:"Error Loggin in"});
  }
  res.json({token});


});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.query.review;
  if(!review){
    return res.status(404).json({message:"Review can not be empty"});
  }
  if(!books[isbn].reviews[username]){
    books[isbn].reviews[username] = {'review': review};
  }else{
    books[isbn].reviews[username] = {'review':review};
  }

  return res.status(200).send(JSON.stringify(books[isbn]));
});

regd_users.delete("/auth/review/:isbn", (req, res)=>{
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if(books[isbn].reviews[username]){
    delete books[isbn].reviews[username];
    return res.status(200).json({message:"Review Deleted"});
  }
  return res.status(404).json({message:"Nothing to delete"});
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
