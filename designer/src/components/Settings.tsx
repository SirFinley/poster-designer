import SizeSelect from './SizeSelect';
import OrientationSelect from './OrientationSelect';
import BorderSizes from './BorderSizes';
import BorderColor from './BorderColor';
import ImageScaler from './ImageScaler';
import ImageControls from './ImageControls';
import ImageUploadArea from './ImageUploadArea';

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

            {/* <!-- clear and save buttons --> */}
            <div className="flex justify-items-end justify-around">
                <button className="w-40 p-2 rounded text-white bg-red-500 hover:bg-red-600 transition font-bold">Clear Poster</button>
                <button className="w-40 p-2 rounded text-white bg-green-500 hover:bg-green-600 transition font-bold
                     disabled:opacity-30 disabled:hover:bg-green-500 disabled:cursor-not-allowed" disabled>Save Poster</button>
            </div>
        </div>
    );
}

export default Settings;