import React, { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import app from '../firebase';

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  console.log(formData);

  
  const handelImageSubmit = () => {
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
  const handelRemoveImage = (index) => {
    setFormData({...formData,imageUrls:formData.imageUrls.filter((_,i)=>i!==index)});
  }

  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 sm:p-10 min-h-screen">
  <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
    Create Listing
  </h1>
  <form className="flex flex-col sm:flex-row gap-8 bg-white p-8 rounded-xl shadow-2xl">
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
      />
      <textarea
        type="text"
        placeholder="Description"
        className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
        id="description"
        required
      />
      <input
        type="text"
        placeholder="Address"
        className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
        id="address"
        required
      />
      {/* Checkboxes */}
      <div className="flex gap-6 flex-wrap">
        {["Sell", "Rent", "Parking Spot", "Furnished", "Offer"].map((label) => (
          <div key={label} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={label.toLowerCase()}
              className="w-5 h-5 accent-blue-500"
            />
            <label
              htmlFor={label.toLowerCase()}
              className="text-gray-700 font-medium"
            >
              {label}
            </label>
          </div>
        ))}
      </div>
      {/* Number Inputs */}
      <div className="flex gap-6 flex-wrap">
        {[
          { id: "bedrooms", label: "Beds" },
          { id: "bathrooms", label: "Baths" },
          { id: "regularPrice", label: "Regular Price ($ / Month)" },
          { id: "discountPrice", label: "Discount Price ($ / Month)" },
        ].map(({ id, label }) => (
          <div key={id} className="flex flex-col items-start">
            <input
              type="number"
              id={id}
              required
              className="border border-gray-300 p-3 w-24 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 transition duration-300 shadow-sm hover:shadow-lg"
            />
            <label
              htmlFor={id}
              className="text-sm text-gray-600 font-medium"
            >
              {label}
            </label>
          </div>
        ))}
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
          onClick={handelImageSubmit}
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
            onClick={()=>handelRemoveImage(index)}
              type="button"
              className="uppercase text-red-700 font-bold rounded-lg hover:opacity-80 transition duration-300"
            >
              Delete
            </button>
          </div>
        ))}
      <button
        type="submit"
        className="bg-green-600 text-white py-4 rounded-lg uppercase font-bold hover:bg-green-700 focus:ring focus:ring-blue-300 transition duration-300 shadow-lg"
      >
        Create Listing
      </button>
    </div>
  </form>
</main>

  );
}
