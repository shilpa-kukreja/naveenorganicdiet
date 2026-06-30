"use client";

import { useState, useRef, useEffect, Suspense} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

import dynamic from 'next/dynamic';
import axios from "axios";

const CKEditor = dynamic(() => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading editor...</p>
    </div>
  </div>
});

// Import the editor build directly (not as dynamic)
let ClassicEditor;
if (typeof window !== 'undefined') {
  ClassicEditor = require('@ckeditor/ckeditor5-build-classic');
}

const AdminAddBlogContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isEditMode = searchParams.get("id");
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    blogName: "",
    blogDetail: "",
    blogSlug: "",
    blogDate: new Date().toISOString().split("T")[0],
    blogImg: null,
    metaTitle: "",
    metaDescription: "",
    metatag: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditorLoaded(true);
    if (isEditMode) fetchBlogDetails();
  }, [isEditMode]);

  const fetchBlogDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/blog/${id}`);
      const blog = res.data;
      
      const formattedDate = blog.blogDate
        ? new Date(blog.blogDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormData({
        blogName: blog.blogName || "",
        blogDetail: blog.blogDetail || "",
        blogSlug: blog.blogSlug || "",
        blogDate: formattedDate,
        blogImg: null,
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        metatag: blog.metatag || "",
      });

      setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${blog.blogImg}` || "");
    } catch (error) {
      toast.error("Failed to fetch blog details.");
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "blogImg") {
      const file = files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast.error("Please select an image file");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }

        setFormData((prev) => ({ ...prev, blogImg: file }));
        setImagePreview(URL.createObjectURL(file));
      }
    } else if (name === "blogName") {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setFormData((prev) => ({
        ...prev,
        blogName: value,
        blogSlug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditorChange = (event, editor, field) => {
    const data = editor.getData();
    setFormData(prev => ({
      ...prev,
      [field]: data
    }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, blogImg: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.blogName.trim()) {
      toast.error("Please enter a blog title");
      return;
    }

    if (!formData.blogDetail.trim()) {
      toast.error("Please add blog content");
      return;
    }

    if (!formData.blogImg && !imagePreview) {
      toast.error("Please select a blog image.");
      return;
    }

    const payload = new FormData();
    payload.append("blogName", formData.blogName.trim());
    payload.append("blogDetail", formData.blogDetail);
    payload.append("blogSlug", formData.blogSlug);
    payload.append("blogDate", formData.blogDate);
    payload.append("metaTitle", formData.metaTitle);
    payload.append("metaDescription", formData.metaDescription);
    payload.append("metatag", formData.metatag);
    if (formData.blogImg) {
      payload.append("blogImg", formData.blogImg);
    }

    try {
      setLoading(true);

      const url = isEditMode ? `${process.env.NEXT_PUBLIC_API_URL}/api/blog/blog/${id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/blog/blog`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: payload,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save blog");
      }

      const data = await res.json();

      toast.success(data.message || "Blog saved successfully!");

      if (!isEditMode) {
        setFormData({
          blogName: "",
          blogDetail: "",
          blogSlug: "",
          blogDate: new Date().toISOString().split("T")[0],
          blogImg: null,
          metaTitle: "",
          metaDescription: "",
          metatag: "",
        });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        router.push("/admin/list-blog");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred while saving blog.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEditMode ? "Update your blog content" : "Write and publish a new blog article"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => router.push("/admin/list-blogs")}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blogs
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("content")}
                className={`py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === "content" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab("seo")}
                className={`py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === "seo" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                SEO Settings
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6" encType="multipart/form-data">
            {activeTab === "content" && (
              <div className="space-y-8">
                {/* Blog Title + Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Blog Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="blogName"
                      value={formData.blogName}
                      onChange={handleChange}
                      required
                      placeholder="Enter an engaging blog title"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      URL Slug
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-3 text-gray-500">/blog/</span>
                      <input
                        type="text"
                        name="blogSlug"
                        value={formData.blogSlug}
                        onChange={handleChange}
                        placeholder="auto-generated-slug"
                        className="w-full border border-gray-300 rounded-r-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used in the blog URL
                    </p>
                  </div>
                </div>

                {/* Blog Content */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Blog Content <span className="text-red-500">*</span>
                  </label>
                  {typeof window !== 'undefined' && ClassicEditor && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.blogDetail}
                        onChange={(event, editor) => handleEditorChange(event, editor, "blogDetail")}
                        config={{
                          toolbar: [
                            'heading', '|', 'bold', 'italic', 'link', 'bulletedList',
                            'numberedList', 'blockQuote', 'insertTable', 'mediaEmbed',
                            'undo', 'redo', 'outdent', 'indent', 'codeBlock', 'code',
                            'subscript', 'superscript', 'fontColor', 'fontBackgroundColor',
                            'fontSize', 'fontFamily', 'removeFormat', 'specialCharacters',
                            'horizontalLine', 'pageBreak', 'findAndReplace', 'highlight',
                            'alignment', 'underline', 'strikethrough'
                          ],
                          placeholder: "Write your blog content here..."
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Blog Date and Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Publish Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="blogDate"
                      value={formData.blogDate}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Featured Image <span className="text-red-500">*</span>
                    </label>

                    {!imagePreview ? (
                      <div
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
                      >
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 font-medium">Upload Image</p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                        <button
                          type="button"
                          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Select file
                        </button>
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={removeImage}
                            className="bg-white text-red-600 rounded-full p-2 hover:bg-red-50 transition-colors shadow-lg m-1"
                            title="Remove image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="bg-white text-blue-600 rounded-full p-2 hover:bg-blue-50 transition-colors shadow-lg m-1"
                            title="Change image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      name="blogImg"
                      accept="image/*"
                      onChange={handleChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    SEO Optimization
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">Improve your blog's visibility in search engines</p>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="Title for search engines (50-60 characters)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Description for search engines (150-160 characters)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Meta Tags
                  </label>
                  <input
                    type="text"
                    name="metatag"
                    value={formData.metatag}
                    onChange={handleChange}
                    placeholder="Comma-separated tags (e.g., marketing, seo, content)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-3 px-10 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition disabled:opacity-60 flex items-center justify-center shadow-md"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {isEditMode ? "Update Blog Post" : "Publish Blog Post"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminAddBlog = () => (
  <Suspense
    fallback={
      
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-3 text-gray-600">Loading...</p>
          </div>
        </div>
    }
  >
    <AdminAddBlogContent />
  </Suspense>
);

export default AdminAddBlogContent;