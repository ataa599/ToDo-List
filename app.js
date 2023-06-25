//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")
mongoose.connect("mongodb+srv://listItem:listItem@cluster0.d4lnghx.mongodb.net/?retryWrites=true&w=majority")

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemSchema);

const food = new Item({
  name:"Buy Food"
});

const cook = new Item({
  name:"Cook food"
});

const eat = new Item({
  name:"Eat food"
});

const defaultArray = [food,cook,eat];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema] 
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find().then(function(result){
    if(result.length===0){
      Item.insertMany(defaultArray);
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });
});

app.get("/:postname", function(req,res){
  const customListName = _.capitalize(req.params.postname);

  
  List.findOne({name:customListName}).then(function(result){
    if(result == null){
      const list = new List({
        name: customListName,
        items: defaultArray
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }
  });
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  

  if (listName==="Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(result){
      result.items.push(item);
      result.save();
      res.redirect("/"+ listName)
    });
  }

});

app.post("/delete", function(req,res){
  const checkedBox = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    Item.findByIdAndRemove({_id:checkedBox}).then(function(result){
      console.log(result);
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedBox}}}).then(function(result){
      res.redirect("/"+listName);
    })
  }
 
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port==null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
