import Testimonial from "../models/testimonialModel.js";


export const createTestimonial = async (req, res) => {
  try {
    const { name, position, rating, content, avatar } = req.body;

    const testimonial = await Testimonial.create({
      name,
      position,
      rating,
      content,
      avatar
    });

    res.status(201).json({
      success: true,
      testimonial,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      testimonials,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID missing" });
    }

    const deleted = await Testimonial.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    return res.json({ success: true, message: "Testimonial deleted successfully" });

  } catch (err) {
    console.log("Delete Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, rating, content, avatar } = req.body;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    testimonial.name = name;
    testimonial.position = position;
    testimonial.rating = rating;
    testimonial.content = content;
    testimonial.avatar = avatar;

    await testimonial.save();

    res.status(200).json({ success: true, message: "Testimonial updated successfully" });;
    } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
