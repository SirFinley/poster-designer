import SizeSelect from "./SizeSelect";
import OrientationSelect from "./OrientationSelect";
import BorderSizes from "./BorderSizes";
import BorderColor from "./BorderColor";
import ImageScaler from "./ImageScaler";
import ImageControls from "./ImageControls";
import ImageUploadArea from "./ImageUploadArea";
import SavePosterModal from "./SavePosterModal";
import "./Settings.css";
import { useContext } from "react";
import { PosterContext } from "../util/Context";
import AddToCartButton from "./AddToCartButton";

function Settings() {
  const poster = useContext(PosterContext);

  return (
    <div className="settings flex flex-col gap-2 md:w-[24rem] lg:min-w-[28rem] p-1">
      <SizeSelect></SizeSelect>
      <OrientationSelect></OrientationSelect>

      <BorderSizes></BorderSizes>
      <BorderColor></BorderColor>

      <ImageScaler></ImageScaler>
      <ImageControls></ImageControls>
      <ImageUploadArea></ImageUploadArea>

      {poster.shopify ? (
        <AddToCartButton></AddToCartButton>
      ) : (
        <SavePosterModal></SavePosterModal>
      )}
      {/* empty space for mobile */}
      <div className="p-5"></div>
    </div>
  );
}

export default Settings;
