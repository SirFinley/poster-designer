import { Fragment, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Dialog, Transition } from '@headlessui/react';
import axios from "axios";
import PosterExporter from '../class/PosterExporter';
import Tooltip from './Tooltip';
import { observer } from 'mobx-react-lite';
import { usePoster} from '../util/hooks';

const API_PATH = "save-poster";

interface SavePosterResponse {
    id: string,
    thumbnailUrl: string,
};

const SavePosterModal = observer(() => {
    const poster = usePoster();
    const [open, setOpen] = useState(false)
    const [saved, setSaved] = useState(true);
    const [posterId, setPosterId] = useState('AAAGGGH');
    const [etsyUrl, setEtsyUrl] = useState('https://etsy.com/');
    const [copiedId, setCopiedId] = useState(false);

    const cancelButtonRef = useRef(null)
    const disabled = poster.image.uploadStatus !== 'uploaded';

    function onSave() {
        setOpen(true);
        setSaved(false);
        upload();
    }

    function onIdClick() {
        copyId();
    }

    async function upload() {
        const data = await getPostData();
        const response = await axios.post<SavePosterResponse>(API_PATH, data, {
            method: 'POST',
            params: {
                posterId: poster.posterId,
            },
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
            setSaved(true);
            const id = response.data.id;
            poster.posterId = id;
            setPosterId(id);
            setEtsyUrl(getEtsyUrl());
        }
    }

    function getEtsyUrl() {
        return poster.settings.getEtsyUrl();
    }

    async function getPostData() {
        return await new PosterExporter().getSaveData(poster.settings, poster.settings.canvas, poster.image, 'autoinc');
    }

    function copyId() {
        navigator.clipboard.writeText(posterId);
        setCopiedId(true);
    }

    return (
        <Fragment>
            <button className="w-full p-2 rounded text-white bg-vipurple hover:bg-vipurplelight transition font-bold
                    disabled:opacity-30 disabled:hover:bg-vipurple disabled:cursor-not-allowed"
                disabled={disabled}
                onClick={onSave}
            >
                Save Poster {poster.image.uploadStatus === 'uploading' ? '(uploading...)' : null }
            </button>


            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpen}>
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                {
                                                    saved ?
                                                        'Poster Saved!' :
                                                        'Saving Poster...'
                                                }
                                            </Dialog.Title>
                                            {
                                                saved ?
                                                    <div className="mt-4">
                                                        Poster Id:
                                                        <span><i className="fa fa-spinner fa-spin fa-1x fa-fw text-lg"></i></span>
                                                        <Tooltip text={copiedId ? 'Copied!' : 'Copy to clipboard'} >

                                                            <span className="text-xl font-bold bg-gray-200 p-2 hover:cursor-pointer"
                                                                onClick={onIdClick}
                                                                onMouseEnter={() => setCopiedId(false)}
                                                            >
                                                                {posterId}
                                                            </span>
                                                        </Tooltip>

                                                        <p id="save-modal-instructions" className="pt-4">
                                                            Copy your poster Id above and paste it in the personalization field back in the 
                                                            <a href={etsyUrl} target="_blank" rel="noreferrer noopener" 
                                                                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                                                            > Etsy listing here.</a>
                                                        </p>
                                                    </div>
                                                    :
                                                    <FontAwesomeIcon icon={faSpinner} size="lg" spin></FontAwesomeIcon>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setOpen(false)}
                                        ref={cancelButtonRef}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </Fragment>
    )
});

export default SavePosterModal;


