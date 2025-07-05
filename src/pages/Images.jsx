// src/pages/Images.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import * as imagesApi from "../api/images";

export default function Images() {
  const token = useSelector((state) => state.auth.token);
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  const fetchImages = async () => {
    const res = await imagesApi.getAllImages(token);
    setImages(res.results || res);
    console.log(res,"images response");
  };

  useEffect(() => {
    if (token) fetchImages();
    // eslint-disable-next-line
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setMessage("");
    const res = await imagesApi.uploadAndAnalyzeImage(token, file);
    if (res.success) {
      setMessage("Image uploaded and analyzed");
      fetchImages();
    } else {
      setMessage(res.detail || "Upload failed");
    }
  };

  const handleDelete = async (id) => {
    await imagesApi.deleteImage(token, id);
    fetchImages();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Your Images</h2>
      <form onSubmit={handleUpload} className="flex gap-2 mb-6">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded">
          Upload & Analyze
        </button>
      </form>
      {message && <div className="text-green-600 mb-4">{message}</div>}
      <div className="grid gap-4">
        {images && images.length > 0 ? (
          images.map((img) => (
            <div
              key={img.id}
              className="border rounded p-4 flex gap-4 items-center"
            >
              <img
                src={img.file_url}
                alt={img.original_filename}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-bold">{img.original_filename}</div>
                {img.analysis && (
                  <div className="text-sm text-gray-700">
                    <div>Food: {img.analysis.is_food ? "Yes" : "No"}</div>
                    <div>Calories: {img.analysis.calories}</div>
                    <div>Items: {img.analysis.food_items?.join(", ")}</div>
                    <div>Description: {img.analysis.description}</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(img.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div>No images found.</div>
        )}
      </div>
    </div>
  );
}
