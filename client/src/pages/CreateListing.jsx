import React from 'react';

export default function CreateListing() {
  return (
    <main className="bg-gray-100 p-6 sm:p-10 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Create Listing</h1>
      <form className="flex flex-col sm:flex-row gap-8 bg-white p-6 rounded-lg shadow-lg">
        {/* Left Column */}
        <div className="flex flex-col gap-6 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
            id="name"
            maxLength={62}
            minLength={5}
            required
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
            id="description"
            required
          />
          <input
            type="text"
            placeholder="Address"
            className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
            id="address"
            required
          />
          {/* Checkboxes */}
          <div className="flex gap-6 flex-wrap">
            {["Sell", "Rent", "Parking Spot", "Furnished", "Offer"].map((label) => (
              <div key={label} className="flex items-center gap-2">
                <input type="checkbox" id={label.toLowerCase()} className="w-5 h-5 accent-green-500" />
                <label htmlFor={label.toLowerCase()} className="text-gray-700">
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
                  className="border border-gray-300 p-3 w-24 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                />
                <label htmlFor={id} className="text-sm text-gray-600">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <p className="font-semibold text-gray-800">Images:</p>
            <p className="text-sm text-gray-600">The first image will be the cover (max 6)</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300 w-full"
              type="file"
              id="images"
              accept="images/*"
              multiple
            />
            <button
              type="button"
              className="p-3 bg-green-600 text-white rounded-lg uppercase hover:bg-green-700 focus:ring focus:ring-green-300 disabled:opacity-70"
            >
              Upload
            </button>
          </div>
          <button
          type="submit"
          className="bg-green-600 text-white p-4 rounded-lg uppercase hover:bg-green-700 focus:ring focus:ring-green-300">
            Create Listing
          </button>
        </div>
        
      </form>
    </main>
  );
}
