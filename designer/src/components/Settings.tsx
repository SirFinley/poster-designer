import SizeSelect from './SizeSelect';
import OrientationSelect from './OrientationSelect';
import BorderSizes from './BorderSizes';
import BorderColor from './BorderColor';
import ImageScaler from './ImageScaler';
import ImageControls from './ImageControls';
import ImageUploadArea from './ImageUploadArea';
import ClearPosterModal from './ClearPosterModal';
import SavePosterModal from './SavePosterModal';
import './Settings.css';

function Settings() {
    return (
        <div className="settings flex flex-col gap-2 max-w-sm" >
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
            {/* empty space for mobile */}
            <div className="p-10"></div>
        </div>
    );
}

export default Settings;