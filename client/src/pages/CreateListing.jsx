import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  // Redux & Router
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Cloudinary config
  const CLOUD_NAME = "dzl3lrrdm";
  const UPLOAD_PRESET = "Dream Home Preset"; // unsigned preset

  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    type: "rent", // sale or rent
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    imageUrls: [], // {id, url, name, uploadedAt}
  });

  // Generate unique file ID
  const makeFileId = (file) =>
    `${file.name}_${file.size}_${file.lastModified}`;

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);

    if (selected.length + formData.imageUrls.length > 6) {
      setImageUploadError("You can only upload up to 6 images.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    const validFiles = selected.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_SIZE
    );

    if (validFiles.length < selected.length) {
      setImageUploadError("Some files were invalid (not image or > 5MB).");
    } else {
      setImageUploadError("");
    }

    const withIds = validFiles.map((f) => ({
      id: makeFileId(f),
      file: f,
      name: f.name,
    }));
    setFiles((prev) => [...prev, ...withIds]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove before upload
  const handleRemoveSelectedFile = (id) => {
    setFiles((prev) => prev.filter((p) => p.id !== id));
    setUploadProgress((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Upload single file to Cloudinary
  const uploadSingle = (entry) =>
    new Promise((resolve, reject) => {
      const { id, file, name } = entry;
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);

      xhr.open("POST", url);

      xhr.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) {
          const pct = Math.round((ev.loaded * 100) / ev.total);
          setUploadProgress((prev) => ({ ...prev, [id]: pct }));
        }
      });

      xhr.onload = () => {
        let responseText = xhr.responseText || "";
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(responseText);
            resolve({
              id,
              url: res.secure_url || "",
              name,
              uploadedAt: new Date().toISOString(),
            });
          } catch {
            reject(new Error("Upload succeeded but parsing failed"));
          }
        } else {
          try {
            const resErr = JSON.parse(responseText);
            reject(
              new Error(resErr.error?.message || "Upload failed")
            );
          } catch {
            reject(new Error("Upload failed"));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network or CORS error"));
      xhr.send(fd);
    });

  // Upload all selected files
  const handleImageUpload = async () => {
    if (files.length === 0) {
      setImageUploadError("Please choose images first.");
      return;
    }
    if (files.length + formData.imageUrls.length > 6) {
      setImageUploadError("You can only upload a maximum of 6 images.");
      return;
    }

    setUploading(true);
    setImageUploadError("");
    setUploadProgress({});

    const uploaded = [];
    try {
      for (const entry of files) {
        const result = await uploadSingle(entry);
        uploaded.push(result);
      }

      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploaded],
      }));
      setFiles([]);
      setUploadProgress({});
    } catch (err) {
      setImageUploadError(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // Form input changes
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    if (id === "sale" || id === "rent") {
      setFormData((p) => ({ ...p, type: id }));
    } else if (
      id === "parking" ||
      id === "furnished" ||
      id === "offer"
    ) {
      setFormData((p) => ({ ...p, [id]: checked }));
    } else if (type === "number") {
      setFormData((p) => ({ ...p, [id]: Number(value) }));
    } else {
      setFormData((p) => ({ ...p, [id]: value }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length < 1) {
      return setError("You must upload at least one image");
    }
    if (formData.regularPrice < formData.discountPrice) {
      return setError("Discount price must be lower than regular price");
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      } else {
        navigate(`/listing/${data._id}`);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        {/* LEFT */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          {/* Checkboxes */}
          <div className="flex gap-6 flex-wrap">
            {["sale", "rent", "parking", "furnished", "offer"].map((id) => (
              <div className="flex gap-2" key={id}>
                <input
                  type="checkbox"
                  id={id}
                  checked={
                    id === "sale"
                      ? formData.type === "sale"
                      : id === "rent"
                      ? formData.type === "rent"
                      : formData[id]
                  }
                  onChange={handleChange}
                  className="w-5"
                />
                <span>{id.charAt(0).toUpperCase() + id.slice(1)}</span>
              </div>
            ))}
          </div>

          {/* Numbers */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="p-3 border rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                {formData.type === "rent" && (
                  <span className="text-xs">($ / month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  {formData.type === "rent" && (
                    <span className="text-xs">($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              First image will be cover (max 6)
            </span>
          </p>

          {/* File input */}
          <div className="flex gap-4">
            <input
              ref={fileInputRef}
              onChange={handleFileChange}
              className="p-3 border rounded w-full"
              type="file"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading || files.length === 0}
              className="p-3 text-green-700 border rounded uppercase hover:shadow-lg disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Selected files before upload */}
          {files.map((f) => (
            <div
              key={f.id}
              className="flex justify-between items-center text-sm"
            >
              <div>
                <div>{f.name}</div>
                <div className="text-xs text-gray-500">
                  Progress: {uploadProgress[f.id] || 0}%
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSelectedFile(f.id)}
                className="text-red-600"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Error */}
          {imageUploadError && (
            <p className="text-red-700 text-sm">{imageUploadError}</p>
          )}

          {/* Uploaded previews */}
          {formData.imageUrls.map((img, index) => (
            <div
              key={img.id}
              className="flex justify-between p-3 border items-center"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
              >
                Delete
              </button>
            </div>
          ))}

          {/* Submit */}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Creating..." : "Create listing"}
          </button>

          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
