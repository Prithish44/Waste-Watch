import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

const DragDrop = ({ onUpload }) => {
  const [preview, setPreview] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleUpload(file);
  };

  const handleUpload = (file) => {
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onUpload(file); // Send file to parent (HomePage.js)
  };

  const resetUpload = () => {
    setPreview(null);
    onUpload(null);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: "2px dashed white",
        borderRadius: "10px",
        width: "90vw",
        maxWidth: "500px",
        height: "300px",
        backgroundColor: "rgba(0,0,0,0.2)",
        margin: "0 auto 1rem auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        textAlign: "center",
        position: "relative",
      }}
    >
      {!preview ? (
        <>
          <FaCloudUploadAlt size={50} style={{ marginBottom: "1rem" }} />
          <p>Drag & drop a plant image here</p>
          <label
            htmlFor="fileUpload"
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#ffffff",
              color: "#000000",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Browse Image
          </label>
          <input
            id="fileUpload"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </>
      ) : (
        <>
          <img
            src={preview}
            alt="Uploaded Preview"
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              borderRadius: "10px",
              objectFit: "cover",
            }}
          />
          <button
            onClick={resetUpload}
            style={{
              position: "absolute",
              bottom: "10px",
              padding: "6px 12px",
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Re-upload
          </button>
        </>
      )}
    </div>
  );
};

export default DragDrop;
