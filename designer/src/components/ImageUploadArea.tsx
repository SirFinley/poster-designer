import React, { useEffect, useRef, ChangeEvent, useCallback } from "react";
import { fabric } from "fabric";

import DropArea from "./DropArea";
import ImageUploader from "../class/imageUploader";
import { usePoster } from "../util/hooks";
import { observer } from "mobx-react-lite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

const ImageUploadArea = observer(() => {
  const poster = usePoster();
  const previewImgRef = useRef<HTMLImageElement>(null);
  const percentage = poster.image.uploadProgress;

  const handleFile = useCallback(
    (file: File) => {
      poster.image.uploadProgress = 0;

      poster.image.fileName = file.name;
      poster.image.renderStatus = "none";
      poster.image.uploadStatus = "none";
      // TODO: if new image selected while current still uploading, cancel current upload before new one starts
      const imageUploader = new ImageUploader(poster.settings, {
        onProgress: (progress) => (poster.image.uploadProgress = progress),
        onComplete: (key) => {
          poster.settings.originalImageKey = key;
          poster.image.uploadStatus = "uploaded";
        },
        onCancelled: () => (poster.image.uploadStatus = "none"),
      });
      poster.image.uploadStatus = "uploading";
      imageUploader.start(file);

      // not an image
      if (!/image\//.test(file.type)) {
        return;
      }

      poster.image.isSvg = /image\/svg/.test(file.type);

      const reader = new FileReader();

      reader.onload = (event) => {
        const src = event.target!.result as string;

        const imgElem = previewImgRef.current!;
        imgElem.src = src;
        imgElem.onload = () => {
          const image = new fabric.Image(imgElem);
          poster.image.setNewImage(image);
        };
        poster.image.imgElem = imgElem;

        poster.image.renderStatus = "rendering";
      };

      reader.readAsDataURL(file);
    },
    [poster.image, poster.settings]
  );

  const handleDrop = useCallback(
    (files: FileList) => {
      handleFile(files[0]);
    },
    [handleFile]
  );

  useEffect(() => {
    poster.image.uploadFile = handleDrop;
  }, [previewImgRef, handleDrop, poster.image]);

  function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files![0];
    handleFile(file);
  }

  const uploadComplete = percentage === 100;
  const filePresent = !!poster.image.image;
  const rendering = poster.image.renderStatus === "rendering";

  const chooseImageButton = (
    <label>
      <div className="w-full p-2 border-2 rounded transition font-bold bg-gray-100 hover:bg-slate-200 cursor-pointer text-center flex">
        <FontAwesomeIcon icon={faUpload} className="text-xl"></FontAwesomeIcon>
        <span className="w-full">
          {poster.hasImage ? "Choose New Image" : "Choose Image"}
        </span>
      </div>
      <input type="file" className="hidden" onChange={onFileSelect} />
    </label>
  );

  const uploads = (
    <DropArea onDrop={handleDrop} unstyled={true}>
      <div>
        <label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          ></input>
        </label>

        <div
          className={`flex items-center justify-center p-2 ${
            !filePresent && "hidden"
          }`}
        >
          <img
            ref={previewImgRef}
            alt=""
            className={`w-20 h-20 object-scale-down ${rendering && "hidden"}`}
          ></img>
          <div
            className={`flex justify-centeritems-center ${
              !rendering && "hidden"
            }`}
          ></div>
          <div className="pl-4 pr-0 w-full">
            <div className="flex justify-between">
              <div>{poster.image.fileName}</div>
              <span className="text-base font-medium">
                {uploadComplete ? "Uploaded!" : "Uploading..."}
              </span>
              {!uploadComplete && (
                <span className="text-sm font-medium">{percentage}%</span>
              )}
            </div>
            <div className="w-full my-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-gray-600 h-4 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            {chooseImageButton}
          </div>
        </div>
      </div>
    </DropArea>
  );

  return poster.hasImage ? uploads : chooseImageButton;
});

export default ImageUploadArea;
