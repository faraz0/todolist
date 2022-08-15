const express = require("express");
const mongoose = require("mongoose");
const bp = require('body-parser');
var _ = require('lodash');
const app = express();

mongoose.connect("mongodb+srv://admin:tabassum99@todocluster.zmi4cxq.mongodb.net/toDoDB", {
  useNewUrlParser: true
});

const itemSchema = new mongoose.Schema({
  item: String
});

const listSchema = {
  name: String,
  list: [itemSchema]
};


const ItemModel = mongoose.model("item", itemSchema);
const ListModel = mongoose.model("list",listSchema);

app.use(express.static('public'));

app.use(bp.urlencoded({
  extended: true
}));

app.set("view engine", 'ejs');

const tip1 = new ItemModel({
  item: "Welcome to easy todo app"
});
const tip2 = new ItemModel({
  item: "Enter item below"
});
const tip3 = new ItemModel({
  item: "click the + button to add item"

});

const defaultItem = [tip1, tip2, tip3];

app.post("/", function(req, res) {
  console.log(req.body)
  var additem = req.body.txt;
  const pageTitle = req.body.list;
  const list = new ItemModel({
    item: additem
  });
  if(pageTitle==="Today"){
    list.save();
    res.redirect("/");
  }
  else{
      ListModel.findOne({name:pageTitle}, function(err, listArr){
        listArr.list.push(list);
        listArr.save();
        res.redirect("/"+pageTitle);
    });
  }
});

app.get("/", function(req, res) {
  ItemModel.find({},function(err, foundItems){
    if(foundItems.length===0){
      ItemModel.insertMany(defaultItem, function(err){
        if(err) console.log(err);
        else console.log("Deafult item added to the database.")
      });
      res.redirect("/");
    }
    else {
      res.render("list", {
        listTitle: "Today",
        add: foundItems
      });
    }
  });
});


app.get("/:page", function(req, res) {
  //name of page
  const pageName=_.capitalize(req.params.page);
  ListModel.findOne({name:pageName}, function(err, foundlists){
    if(!err){
      if(!foundlists){
        const list = new ListModel({
          name: pageName,
          list: defaultItem
        });
        list.save();
        res.redirect("/"+pageName);
      }
      else{
        res.render("list", {
          listTitle: foundlists.name,
          add: foundlists.list
        });
      }
    }
  });
});


app.post("/delete", function(req,res){
  console.log(req.body);
  const getId= req.body.chkbx;
  const listName = req.body.hidden;
  if(listName==="Today"){
    ItemModel.deleteOne({_id:getId}, function(err){
      if (err) console,log(err);
      else{ console.log("Deleted checked item from database");
      res.redirect("/");
    }
  });
}
  else{
    ListModel.findOneAndUpdate({name: listName}, {$pull:{list:{_id:getId}}}, function(err){
      if(!err) console.log("Deleted item from custom list")
    });
    res.redirect("/"+listName);
  }
  });



  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 3000;
  }


app.listen(port, function() {
  console.log("ToDo server starting at port 3000...");
});
