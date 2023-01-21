//jshint esversion:6

const _ = require("lodash")
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static("public"));
mongoose.connect("mongodb+srv://deepaknegi:15124117@cluster0.8zw396s.mongodb.net/todolistDB", { useNewUrlParser: true }, function () {

  console.log("connected")
})

const itemsechma = {
  name: String
}
const Item = mongoose.model("item", itemsechma)

const item1 = new Item({
  name: "Welcome to your todolist!"
})
const item2 = new Item({
  name: "Hit the + button to add a new item."
})
const item3 = new Item({
  name: "<--- Hit this to delete an item"
})
const defaultItem = [ item1, item2, item3 ]

const listSchema = {
  name: String,
  items: [ itemsechma ]
}

const List = mongoose.model("list", listSchema)

// -------------------------------------------------- { 

// const defaultItem = [item1,item2,item3]

//   Item.insertMany(defaultItem,function(err){
//     if(err){
//     console.log(err)
//   }
//   else{
//     console.log("items are inserted")
//   }
// })

// -------------------------------------------------- }


app.get("/", function (req, res) {

  Item.find({}, function (err, FoundItems) {
    if (FoundItems.length === 0) {


      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err)
        }
        else {
          console.log("items are inserted")
        }
      })
      res.redirect('/')
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: FoundItems });
    }
    // console.log(foundItems)
  })

});

app.post("/custom", function (req, res) {
  const custom = req.body.customlist
  // console.log(custom)
  res.redirect("/" + custom)
})


app.get("/:customListName", function (req, res) {
  // app.get("/:" + , function (req, res) { 
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({ name: customListName }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        // doesn't exist
        const list = new List({
          name: customListName,
          items: defaultItem
        })
        list.save()
        res.redirect("/" + customListName)

      } else {
        // exist
        res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });

      }
    }
  })

})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })
  if (listName === "Today") {
    item.save()
    res.redirect('/')
  }
  else {
    List.findOne({ name: listName }, function (err, foundlist) {
      foundlist.items.push(item)
      foundlist.save()
      res.redirect("/" + listName)
    })
  }
});





app.post('/delete', function (req, res) {
  const checkedItemid = req.body.checkbox
  const listName = req.body.listName
  if (listName === "Today") {
    // console.log(listName)
    Item.findByIdAndRemove(checkedItemid, function (err) {
      if (err) {
        console.log(err)
      }
      else {
        console.log("deleted succesfully!")
        res.redirect('/')
      }
    })
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemid } } }, function (err, foundlist) {
      if (!err) {
        res.redirect("/" + listName)
      }
    })
  }
})



const port = '3000';
app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});
