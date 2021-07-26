const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _= require("lodash");

const date = require(__dirname+"/date.js");


const app=express();


app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser : true, useUnifiedTopology: true });

const ItemsSchema = {
    name : String
};

const Item = mongoose.model("Item",ItemsSchema); 

const item1 = new Item({
    name : "Welcome to ToDo List "
})

const item2 = new Item({
    name : "Hello "
})

const item3 = new Item({
    name : "Continue  "
})

const defaultItems = [item1,item2,item3];

const listSchema = {
    name : String,
    items: [ItemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){

    Item.find({}, function(err, foundItems){ 
        
        if(foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully saved ");
            }
        });
        res.redirect("/");
    } else {
        let day = date ;
        res.render("list", { listoftitle: "Today", newlistitems : foundItems});
            }
    });
});

app.post("/",function(req,res){
    var itemName =req.body.newItem;
    var listName =req.body.list;

    const item = new Item({
        name : itemName
    });

    if(listName == "Today"){
        item.save();
        res.redirect("/");
    } else{
            List.findOne({name : listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

});

app.post("/delete", function(req,res){
    const checkeditem = req.body.deletedItems;
    const listName = req.body.listName;

    if(listName=== "Today"){
        Item.findByIdAndRemove(checkeditem, function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully deleted");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkeditem}}}, function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
  

});

app.get("/:topic", function(req,res){
    const topic =_.capitalize(req.params.topic);
    List.findOne({name: topic}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: topic,
                    items : defaultItems
                });
            
                list.save();
                res.redirect("/"+topic);
            }
            else{
                res.render("list",{ listoftitle: foundList.name, newlistitems : foundList.items});
            }
        }
    });



})

app.listen(3000,function(req,res){
    console.log("Server is started at port 3000");
});




