import categoryModel from "../models/categoryModel.js";

export const createcategory = async (req, res) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const image = req.file ? `/uploads/category/${req.file.filename}` : null;

        const newcategory = new categoryModel({
            name,
            slug,
            image
        });

        await newcategory.save();

        res.status(201).json({ message: "Category added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
        console.log(categories);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        await categoryModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.id);
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getCategoryBySlug = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateCategory = async (req, res) => {
    try {
        const updateData = req.body;

        if (req.file) {
            updateData.image = `/uploads/category/${req.file.filename}`;
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
