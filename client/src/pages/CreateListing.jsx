import React, { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Camera, Home, Bed, Bath, DollarSign, Upload, Trash2 } from 'lucide-react';
import app from '../firebase';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 500,
    discountPrice: 0,
  });

  const handleChange = (e) => {
    if (e.target.id === 'sell' || e.target.id === 'rent') {
      setFormData({ ...formData, type: e.target.value });
    }
    if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }
    if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
      setUploading(true);
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((e) => {
          setImageUploadError("Image upload failed (2mb max per image)");
          setUploading(false);
        });
    } else if (files.length === 0) {
      setImageUploadError("Please select at least one image");
    } else {
      setImageUploadError("Maximum 6 images allowed");
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const filename = new Date().getTime() + file.name;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.imageUrls.length === 0) {
        setLoading(false);
        setError("Please upload at least one image");
        return;
      }
      if (+formData.regularPrice < +formData.discountPrice) {
        setLoading(false);
        setError("Discount price should be less than regular price");
        return;
      }
      
      formData.userRef = currentUser?._id;
      const res = await fetch('/api/listing/create', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Create Your Listing
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-xl p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Home className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Property Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    id="name"
                    maxLength={62}
                    minLength={5}
                    required
                    onChange={handleChange}
                    value={formData.name}
                  />
                </div>

                <textarea
                  placeholder="Description"
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition min-h-32"
                  id="description"
                  required
                  onChange={handleChange}
                  value={formData.description}
                />

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    id="address"
                    required
                    onChange={handleChange}
                    value={formData.address}
                  />
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'sell', label: 'For Sale' },
                  { id: 'rent', label: 'For Rent' },
                  { id: 'parking', label: 'Parking' },
                  { id: 'furnished', label: 'Furnished' },
                  { id: 'offer', label: 'Special Offer' }
                ].map((feature) => (
                  <label key={feature.id} className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-gray-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      id={feature.id}
                      className="w-5 h-5 accent-blue-500"
                      onChange={handleChange}
                      checked={
                        feature.id === 'sell' || feature.id === 'rent'
                          ? formData.type === feature.id
                          : formData[feature.id]
                      }
                      value={feature.id}
                    />
                    <span className="text-gray-700 font-medium">{feature.label}</span>
                  </label>
                ))}
              </div>

              {/* Numbers Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-gray-700">
                    <Bed size={20} />
                    <span>Bedrooms</span>
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    required
                    onChange={handleChange}
                    value={formData.bedrooms}
                    min={1}
                    max={10}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-gray-700">
                    <Bath size={20} />
                    <span>Bathrooms</span>
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    required
                    onChange={handleChange}
                    value={formData.bathrooms}
                    min={1}
                    max={10}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-gray-700">
                    <DollarSign size={20} />
                    <span>Regular Price</span>
                  </label>
                  <input
                    type="number"
                    id="regularPrice"
                    required
                    onChange={handleChange}
                    value={formData.regularPrice}
                    min={500}
                    max={10000}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                {formData.offer && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-gray-700">
                      <DollarSign size={20} />
                      <span>Discounted Price</span>
                    </label>
                    <input
                      type="number"
                      id="discountPrice"
                      required
                      onChange={handleChange}
                      value={formData.discountPrice}
                      min={0}
                      max={5000}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Property Images</h3>
                <p className="text-sm text-gray-500">
                  Upload up to 6 images. The first image will be the cover.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    type="file"
                    onChange={(e) => setFiles(e.target.files)}
                    id="images"
                    accept="image/*"
                    multiple
                  />
                  <Camera className="absolute left-3 top-3 text-gray-400" size={20} />
                </div>
                <button
                  type="button"
                  onClick={handleImageSubmit}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50"
                >
                  <Upload size={20} />
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>

              {imageUploadError && (
                <p className="text-red-500 text-sm">{imageUploadError}</p>
              )}

              <div className="space-y-4">
                {formData.imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="flex items-center justify-between p-4 border rounded-xl bg-gray-50"
                  >
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            disabled={loading || uploading}
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </div>
    </main>
  );
}