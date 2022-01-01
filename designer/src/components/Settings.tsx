import SizeSelect from './SizeSelect';
import OrientationSelect from './OrientationSelect';
import BorderSizes from './BorderSizes';
import BorderColor from './BorderColor';
import ImageScaler from './ImageScaler';
import ImageControls from './ImageControls';
import ImageUploadArea from './ImageUploadArea';
import ClearPosterModal from './ClearPosterModal';
import SavePosterModal from './SavePosterModal';

function Settings() {
    return (
        <div className="flex flex-col gap-2 max-w-sm">
            <h2 className="font-bold text-lg">Settings</h2>

            <SizeSelect></SizeSelect>
            <OrientationSelect></OrientationSelect>

            <BorderSizes></BorderSizes>
            <BorderColor></BorderColor>

            <ImageScaler></ImageScaler>
            <ImageControls></ImageControls>
            <ImageUploadArea></ImageUploadArea>

            <div className="flex justify-items-end justify-around">
                <ClearPosterModal></ClearPosterModal>
                <SavePosterModal></SavePosterModal>
            </div>
        </div>
    );
}

export default Settings;