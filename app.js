require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const {
  Schema
} = mongoose
const _ = require("lodash");
mongoose.set('strictQuery', false);
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
const url=process.env.URL;
mongoose.connect(url);
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
const ITEM = mongoose.model("ITEM", itemsSchema);
const item1 = new ITEM({
  name: "Welcome to your to-do list"
});
const item2 = new ITEM({
  name: "Hit the + button to add a new item"
});
const item3 = new ITEM({
  name: "<-- Hit this to delete an item"
});
const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  items: [itemsSchema]
});
const day = date.getDate();
const List = mongoose.model("List", listSchema);
app.get("/", function(req, res) {
  ITEM.find(function(err, items) {
    if (err) {
      console.log("Error encountered")
    } else {
      if (items.length == 0) {
        ITEM.insertMany([item1, item2, item3], function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully inserted items");
          }
        });
      }
    }
    res.render("list", {
      listTitle: day,
      newListItems: items
    });
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newlist = _.capitalize(req.body.listName);
  const item = new ITEM({
    name: itemName
  });
  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === day) {
    ITEM.deleteOne({
      _id: checkedItemId
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted the item");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
});
app.get("/:topic", function(req, res) {
  const ListName = _.capitalize(req.params.topic);
  List.findOne({
    name: ListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: ListName,
          items: [item1, item2, item3]
        });
        list.save();
        res.redirect("/" + ListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});
app.post("/post",function(req,res){
  const listName = _.capitalize(req.body.listName);
  res.redirect("/"+listName);
});
app.get("/about", function(req, res) {
  res.render("about");
});
const port = 3000 || process.env.PORT;
app.listen(port, function() {
  console.log("Server started on port "+port);
});
