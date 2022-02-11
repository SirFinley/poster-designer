import { Fragment, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Dialog, Transition } from '@headlessui/react';
import axios from "axios";
import PosterExporter from '../class/PosterExporter';
import { observer } from 'mobx-react-lite';
import { usePoster } from '../util/hooks';
import { postMessage } from '../util';

const API_PATH = "save-poster";

interface SavePosterResponse {
    id: string,
    thumbnailUrl: string,
};

const AddToCartButton = observer(() => {
    const poster = usePoster();
    const [saveStatus, setSaveStatus] = useState<'none'|'saving'|'saved'>('none');

    const cancelButtonRef = useRef(null)
    const disabled = poster.image.uploadStatus !== 'uploaded';

    function onSave() {
        setSaveStatus('saving');
        upload();
    }

    function addToCart(id: string, thumbnailUrl: string) {
        const sides = poster.settings.size.split('x');
        const size = `${sides[0]}"x${sides[1]}"`;
        postMessage({
            type: "poster.addToCart",
            data: {
                posterId: id,
                thumbnailUrl,
                options: [
                    {name: 'Size', value: size},
                    {name: 'Orientation', value: poster.settings.orientation},
                ]
            }
        });
    }

    async function upload() {
        const data = await getPostData();
        const response = await axios.post<SavePosterResponse>(API_PATH, data, {
            method: 'POST',
        })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    console.error('Fetch aborted')
                } else {
                    console.error('Error while saving poster: ', err)
                    throw err;
                }
            });

        if (response) {
            const id = response.data.id;
            const thumbnailUrl = response.data.thumbnailUrl;
            addToCart(id, thumbnailUrl);
            setSaveStatus('saved');
        }
    }

    async function getPostData() {
        return await new PosterExporter().getSaveData(poster.settings, poster.settings.canvas, poster.image, 'guid');
    }

    return (
        <>
            <button className="w-full p-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition font-bold
                    disabled:opacity-30 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
                disabled={disabled}
                onClick={onSave}
                title="hi there"
            >
                <FontAwesomeIcon icon={faShoppingCart} ></FontAwesomeIcon>
                Add To Cart {poster.image.uploadStatus === 'uploading' ? '(uploading...)' : null }
            </button>

            <Transition.Root show={saveStatus === 'saving'} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={()=>undefined}>
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
                                <div className="bg-white px-4 pt-5 pb-4">
                                    <div className="sm:items-start">
                                        <div className="mt-3 text-center sm:p-4">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                Adding to cart
                                            </Dialog.Title>
                                            <div className="mt-4"></div>
                                            <FontAwesomeIcon icon={faSpinner} size="2x" spin></FontAwesomeIcon>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
});

export default AddToCartButton;


