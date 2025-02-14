import React, { useEffect, useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import app from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Trash2, Upload, Building, BedDouble, Bath, DollarSign, Car, Sofa, Tag, Edit } from 'lucide-react';

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const params = useParams();
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

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(error.message);
        return;
      }
      setFormData(data);
    };
    fetchListing();
  }, []);

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
    if (files.length !== 0 && files.length + formData.imageUrls.length <= 6) {
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
          setImageUploadError("Image upload failed (2MB max per image)");
          setUploading(false);
        });
    } else if (files.length === 0) {
      setImageUploadError("Please select at least one image");
    } else {
      setImageUploadError("Max 6 images allowed");
    }
  };

  const storeImage = (file) => {
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
        (e) => {
          reject(e);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.imageUrls.length === 0) {
        setLoading(false);
        setError("Please upload at least one image here");
        return;
      }
      if (+formData.regularPrice < +formData.discountPrice) {
        setLoading(false);
        setError("Discount price should be less than regular price");
        return;
      }
      formData.userRef = currentUser?._id;
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Update Your Property
          </h1>
          <p className="text-gray-600 mt-2">Make your listing stand out with detailed information</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Property Images</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    type="file"
                    onChange={(e) => setFiles(e.target.files)}
                    id="images"
                    accept="images/*"
                    multiple
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImageSubmit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  disabled={uploading}
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              
              {imageUploadError && (
                <p className="text-red-500 text-sm flex items-center gap-2">
                  ⚠️ {imageUploadError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative rounded-lg overflow-hidden shadow-md"
                  >
                    <img
                      src={url}
                      alt="listing"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>

              <input
                type="text"
                placeholder="Property Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                id="name"
                value={formData.name}
                onChange={handleChange}
              />

              <textarea
                placeholder="Property Description"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32"
                id="description"
                value={formData.description}
                onChange={handleChange}
              />

              <input
                type="text"
                placeholder="Address"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                id="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Property Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="sell"
                    className="w-5 h-5 accent-blue-500"
                    onChange={handleChange}
                    checked={formData.type === "sell"}
                    value="sell"
                  />
                  <label htmlFor="sell">For Sale</label>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="rent"
                    className="w-5 h-5 accent-blue-500"
                    onChange={handleChange}
                    checked={formData.type === "rent"}
                    value="rent"
                  />
                  <label htmlFor="rent">For Rent</label>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="parking"
                    className="w-5 h-5 accent-blue-500"
                    onChange={handleChange}
                    checked={formData.parking}
                  />
                  <Car className="w-5 h-5 text-gray-600" />
                  <label htmlFor="parking">Parking</label>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="furnished"
                    className="w-5 h-5 accent-blue-500"
                    onChange={handleChange}
                    checked={formData.furnished}
                  />
                  <Sofa className="w-5 h-5 text-gray-600" />
                  <label htmlFor="furnished">Furnished</label>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <BedDouble className="w-4 h-4" /> Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min={1}
                    max={10}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Bath className="w-4 h-4" /> Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min={1}
                    max={10}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Regular Price
                  </label>
                  <input
                    type="number"
                    id="regularPrice"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.regularPrice}
                    onChange={handleChange}
                    min={500}
                    max={10000}
                  />
                </div>

                {formData.offer && (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Discount Price
                    </label>
                    <input
                      type="number"
                      id="discountPrice"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.discountPrice}
                      onChange={handleChange}
                      min={0}
                      max={5000}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              disabled={loading || uploading}
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Edit className="w-5 h-5" />
              {loading ? "Updating..." : "Update Listing"}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-center flex items-center justify-center gap-2">
              ⚠️ {error}
            </p>
          )}
        </motion.form>
      </div>
    </main>
  );
}