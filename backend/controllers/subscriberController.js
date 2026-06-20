import subscriberModel from "../models/subscriberModel.js";





export const addsubscriber = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const existingSubscriber = await subscriberModel.findOne({ email });
        if (existingSubscriber) {
            return res.status(409).json({ message: "Email is already subscribed" });
        }
        const newSubscriber = new subscriberModel({ email });
        await newSubscriber.save();
        return res.status(201).json({ message: "Subscriber added successfully" });
    } catch (error) {
        console.error("Error in addsubscriber:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await subscriberModel.find().sort({ createdAt: -1 });
        return res.status(200).json(subscribers);
    }
    catch (error) {
        console.error("Error in getSubscribers:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}



export const deleteSubscriber = async (req, res) => {
    try {
        await subscriberModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Subscriber deleted successfully" });
    } catch (error) {
        console.error("Error in deleteSubscriber:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}