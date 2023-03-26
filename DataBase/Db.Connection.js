
const mongoose = require("mongoose");

mongoose.set('strictQuery' , false);


mongoose.connect("mongodb+srv://Ahsanmushtaq:3102007KPH0740@cluster0.soidj2b.mongodb.net/?retryWrites=true&w=majority" , { useNewUrlParser: true, useUnifiedTopology : true})
mongoose.connection.on("connected", () => {
  console.log("mongoose connected sucessfully");
})
mongoose.connection.on("disconnected", () => {
  console.log("mongoose not connected sucessfully");
  process.exit(1);
})
