import React, { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import app from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 

export default function CreateListing() {
  const {currentUser} = useSelector((state) => state.user);
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
  // console.log(formData);
  
  const handleChange = (e) => {
    if(e.target.id==='sell'|| e.target.id==='rent'){
      setFormData({...formData,type:e.target.value});
    }
    if(e.target.id==='parking' || e.target.id==='furnished' || e.target.id==='offer'){
      setFormData({...formData,[e.target.id]:e.target.checked});
    }
    if(e.target.type==='number'|| e.target.type==='text'|| e.target.type==='textarea'){
      setFormData({...formData,[e.target.id]:e.target.value});
    }
  }

  const handleImageSubmit = () => {
    if(files.length!=0 && files.length+ formData.imageUrls.length<=6){
      setUploading(true);
      
      const promises = [];
      for(let i=0;i<files.length;i++){
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises).then((urls)=>{
        setFormData({...formData,imageUrls:formData.imageUrls.concat(urls)});
        setImageUploadError(false);
        setUploading(false);
      }).catch((e)=>{
        setImageUploadError("image upload failed(2mb max per image)");
        setUploading(false);
      })
  }
  else if(files.length===0) setImageUploadError("Please select atleast one image");  
  else setImageUploadError("max 6 images allowed");
}
  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage= getStorage(app);
      const filename=new Date().getTime()+ file.name;
      const storageRef= ref(storage,filename);
      const uploadTask = uploadBytesResumable(storageRef,file);
      uploadTask.on('state_changed',
        (snapshot)=>{
          const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
          console.log('Upload is ' + progress + '% done');
        },
        (e)=>{
        reject(e);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
          resolve(downloadURL);
        }) 
      }
    )
    });
  }
  const handleRemoveImage = (index) => {
    setFormData({...formData,imageUrls:formData.imageUrls.filter((_,i)=>i!==index)});
  }
  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // console.log(formData);
      
      if(formData.imageUrls.length===0){
        setLoading(false);
        setError("Please upload at least one image here");
        return ;
      }
      if(+formData.regularPrice<+formData.discountPrice){
        setLoading(false);
        setError("Discount price should be less than regular price");
        return ; 
      }
      // console.log(currentUser);
      formData.userRef=currentUser?._id;
      const res= await fetch('/api/listing/create',{
        method:"POST",
        headers:{
          'content-Type':'application/json',
        },
        body:JSON.stringify(formData),
      });

      const data=await res.json();
      // console.log(data);
      if(data.success===false){
        setError(data.message);
        setLoading(false);
        return;
      }
      
      setLoading(false);
      navigate(`/listings/${data._id}`);
      
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 sm:p-10 min-h-screen">
  <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
    Create Listing
  </h1>
  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-8 bg-white p-8 rounded-xl shadow-2xl">
    {/* Left Column */}
    <div className="flex flex-col gap-6 flex-1">
      <input
        type="text"
        placeholder="Name"
        className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
        id="name"
        maxLength={62}
        minLength={5}
        required
        onChange={handleChange}
        value={formData.name}
      />
      <textarea
        type="text"
        placeholder="Description"
        className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
        id="description"
        required
        onChange={handleChange}
        value={formData.description}
      />
      <input
        type="text"
        placeholder="Address"
        className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
        id="address"
        required
        onChange={handleChange}
        value={formData.address}
      />
      
      <div className="flex gap-6 flex-wrap">
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="sell"
      className="w-5 h-5 accent-blue-500"
      onChange={handleChange}
      checked={formData.type === "sell"}
      value="sell"
    />
    <label htmlFor="sell" className="text-gray-700 font-medium">
      Sell
    </label>
  </div>
  
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="rent"
      className="w-5 h-5 accent-blue-500"
      onChange={handleChange}
      checked={formData.type === "rent"}
      value="rent"
    />
    <label htmlFor="rent" className="text-gray-700 font-medium">
      Rent
    </label>
  </div>
  
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="parking"
      className="w-5 h-5 accent-blue-500"
      onChange={handleChange}
      checked={formData.parking}
      value="parking"
    />
    <label htmlFor="parking" className="text-gray-700 font-medium">
      Parking
    </label>
  </div>
  
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="furnished"
      className="w-5 h-5 accent-blue-500"
      onChange={handleChange}
      checked={formData.furnished}
      value="Furnished"
    />
    <label htmlFor="furnished" className="text-gray-700 font-medium">
      Furnished
    </label>
  </div>
  
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id="offer"
      className="w-5 h-5 accent-blue-500"
      onChange={handleChange}
      checked={formData.offer}
      value="Offer"
    />
    <label htmlFor="offer" className="text-gray-700 font-medium">
      Offer
    </label>
  </div>
</div>

      {/* Number Inputs */}
      <div className="flex gap-6 flex-wrap">
  <div className="flex flex-col items-start">
    <input
      type="number"
      id="bedrooms"
      required
      onChange={handleChange}
      value={formData.bedrooms}
      min={1}
      max={10}
      className="border border-gray-300 p-3 w-24 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
    />
    <label htmlFor="bedrooms" className="text-sm text-gray-600 font-medium">
      Beds
    </label>
  </div>

  <div className="flex flex-col items-start">
    <input
      type="number"
      id="bathrooms"
      required
      onChange={handleChange}
      value={formData.bathrooms}
      min={1}
      max={10}
      className="border border-gray-300 p-3 w-24 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
    />
    <label htmlFor="bathrooms" className="text-sm text-gray-600 font-medium">
      Baths
    </label>
  </div>

  <div className="flex flex-col items-start">
    <input
      type="number"
      id="regularPrice"
      required
      onChange={handleChange}
      value={formData.regularPrice}
      min={500}
      max={10000}
      className="border border-gray-300 p-3 w-24 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
    />
    <label
      htmlFor="regularPrice"
      className="text-sm text-gray-600 font-medium"
    >
      Regular Price ($ / Month)
    </label>
  </div>

  {formData.offer && (
    <div className="flex flex-col items-start">
    <input
      type="number"
      id="discountPrice"
      required
      onChange={handleChange}
      value={formData.discountPrice}
      min={0}
      max={5000}
      className="border border-gray-300 p-3 w-24 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
    />
    <label
      htmlFor="discountPrice"
      className="text-sm text-gray-600 font-medium"
    >
      Discount Price ($ / Month)
    </label>
  </div>
  )}
</div>

    </div>
    {/* Right Column */}
    <div className="flex flex-col gap-6 flex-1">
      <div>
        <p className="font-semibold text-gray-800 text-lg">Images:</p>
        <p className="text-sm text-gray-600">
          The first image will be the cover (max 6)
        </p>
      </div>
      <div className="flex items-center gap-4">
        <input
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg w-full"
          type="file"
          onChange={(e) => setFiles(e.target.files)}
          id="images"
          accept="images/*"
          multiple
        />
        <button
          type="button"
          onClick={handleImageSubmit}
          className="p-3 bg-green-600 text-white rounded-lg uppercase font-semibold hover:bg-green-700 focus:ring focus:ring-blue-300 transition duration-300" disabled={uploading}
        >
          {uploading ? "uploading..." : "Upload"}
        </button>
      </div>
      {imageUploadError && (
        <p className="text-red-600 text-sm font-medium">{imageUploadError}</p>
      )}
      {formData.imageUrls.length > 0 &&
        formData.imageUrls.map((url,index) => (
          <div 
            className="flex justify-between gap-4 p-3 border rounded-lg shadow-md items-center"
            key={url}
          >
            <img
              src={url}
              alt="listing image"
              className="w-20 h-20 object-contain rounded-lg"
            />
            <button
            onClick={()=>handleRemoveImage(index)}
              type="button"
              className="uppercase text-red-700 font-bold rounded-lg hover:opacity-80 transition duration-300"
            >
              Delete
            </button>
          </div>
        ))}
      <button 
      disabled={loading || uploading}
        type="submit"
        className="bg-green-600 text-white py-4 rounded-lg uppercase font-bold hover:bg-green-700 focus:ring focus:ring-blue-300 transition duration-300 shadow-lg"
      >
        {loading ? "Loading..." :"Create Listing"}
      </button>
      {error && <p className='text-red-700 text-sm' >{error}</p>}
    </div>
  </form>
</main>

  );
}
