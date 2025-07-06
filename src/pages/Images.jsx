// src/pages/Images.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import * as imagesApi from "../api/images";

export default function Images() {
  const token = useSelector((state) => state.auth.token);
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await imagesApi.getAllImages(token);
      // Handle both possible response structures
      setImages(res.images || res.results || res);
      console.log(res, "images response");
    } catch (error) {
      console.error("Error fetching images:", error);
      setMessage("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first");
      return;
    }
    
    try {
      setUploading(true);
      setMessage("");
      const res = await imagesApi.uploadAndAnalyzeImage(token, file);
      
      if (res.success) {
        setMessage("Image uploaded and analyzed successfully!");
        setFile(null); // Clear the file input
        // Reset the file input
        e.target.reset();
        fetchImages();
      } else {
        setMessage(res.detail || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await imagesApi.deleteImage(token, id);
      fetchImages();
      setMessage("Image deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Failed to delete image");
    }
  };

  const formatNutrients = (nutrients) => {
    if (!nutrients) return "N/A";
    return `Protein: ${nutrients.protein}g, Carbs: ${nutrients.carbs}g, Fat: ${nutrients.fat}g, Sugar: ${nutrients.sugar}g`;
  };

  const formatExercise = (exercise) => {
    if (!exercise) return "N/A";
    return `${exercise.steps} steps (${exercise.walking_km}km walk)`;
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Your Food Images</h2>
      
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="flex gap-2 mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded flex-1"
          disabled={uploading}
        />
        <button 
          type="submit" 
          disabled={uploading || !file}
          className="bg-blue-600 text-white px-4 rounded disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </form>

      {/* Messages */}
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes("success") || message.includes("uploaded") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading images...</div>
        </div>
      )}

      {/* Images Grid */}
      <div className="grid gap-4">
        {images && images.length > 0 ? (
          images.map((img) => (
            <div
              key={img.id}
              className="border rounded-lg p-4 flex gap-4 items-start bg-gray-50"
            >
              <img
                src={img.file_url}
                alt={img.original_filename}
                className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <div className="font-bold text-lg mb-2">{img.original_filename}</div>
                {img.analysis ? (
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        img.analysis.is_food ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {img.analysis.is_food ? 'Food Item' : 'Not Food'}
                      </span>
                      {img.analysis.is_food && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {img.analysis.calories} calories
                        </span>
                      )}
                    </div>
                    
                    {img.analysis.food_items && img.analysis.food_items.length > 0 && (
                      <div>
                        <strong>Items:</strong> {img.analysis.food_items.join(", ")}
                      </div>
                    )}
                    
                    {img.analysis.description && (
                      <div>
                        <strong>Description:</strong> {img.analysis.description}
                      </div>
                    )}
                    
                    {img.analysis.nutrients && (
                      <div>
                        <strong>Nutrients:</strong> {formatNutrients(img.analysis.nutrients)}
                      </div>
                    )}
                    
                    {img.analysis.exercise_recommendations && (
                      <div>
                        <strong>Exercise to burn:</strong> {formatExercise(img.analysis.exercise_recommendations)}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Confidence: {(img.analysis.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Analysis not available</div>
                )}
              </div>
              <button
                onClick={() => handleDelete(img.id)}
                className="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-300 hover:border-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          !loading && (
            <div className="text-center py-8 text-gray-500">
              No images found. Upload your first food image to get started!
            </div>
          )
        )}
      </div>
    </div>
  );
}