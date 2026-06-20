import contactModel from "../models/contactModels.js";



export const addContact=async(req,res)=>{
    try {
        const {name,mobile,email,message}=req.body;
        if(!name||!mobile||!email||!subject||!message){
            return res.status(400).json({message:"All fields are required"});
        }
        const newContact=new contactModel({
            name,
            mobile,
            email,
            message
        });
        await newContact.save()
        .then(()=>{
            return res.status(201).json({message:"Contact message saved successfully"});
        })
        .catch((error)=>{
            console.error("Error in addContact:",error);
            return  res.status(500).json({message:"Internal Server Error"});
        });

    } catch (error) {
        console.error("Error in addContact:",error);
        return  res.status(500).json({message:"Internal Server Error"});
    }
}


export const getContacts=async(req,res)=>{
    try {
        const contacts=await contactModel.find().sort({createdAt:-1});
        return res.status(200).json(contacts);
    } catch (error) {
        console.error("Error in getContacts:",error);
        return  res.status(500).json({message:"Internal Server Error"});
     }
}

export const deleteContact=async(req,res)=>{
    try {
        await contactModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({message:"Contact message deleted successfully"});
    } catch (error) {
        console.error("Error in deleteContact:",error);
        return  res.status(500).json({message:"Internal Server Error"});
    }
}