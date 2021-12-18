/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Dialog, Transition } from '@headlessui/react';
import '@themesberg/flowbite'
import eventHub from '../class/posterEventHub';
import poster from '../class/poster';
import axios from "axios";
import PosterExporter from '../class/PosterExporter';

const API_PATH = "save-poster";

interface SavePosterResponse {
    id: string,
};

export default function SavePosterModal() {
    const [open, setOpen] = useState(false)
    const [disabled, setDisabled] = useState(true);
    const [saved, setSaved] = useState(true);
    const [posterId, setPosterId] = useState('<AAAGGGH>');
    const [etsyUrl, setEtsyUrl] = useState('');
    const [copiedId, setCopiedId] = useState(false);

    const cancelButtonRef = useRef(null)

    useEffect(() => {
        const onImageUploaded = eventHub.subscribe('imageUploaded', () => setDisabled(false));
        const onImageCleared = eventHub.subscribe('imageCleared', () => setDisabled(true));
        return () => {
            onImageUploaded.unsubscribe();
            onImageCleared.unsubscribe();
        }
    })

    function onSave() {
        setOpen(true);
        setSaved(false);
        upload();
    }

    function onIdClick() {
        copyId();
        console.log('copied');
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
            setSaved(true);
            const id = response.data.id
            setPosterId(id);
            setEtsyUrl(getEtsyUrl());
            console.log('poster saved with id ' + id);
        }
    }

    function getEtsyUrl() {
        // TODO: get etsy url
        return '#';
    }

    async function getPostData() {
        return await new PosterExporter().getSaveData(poster.settings, poster.settings.canvas, poster.image);
    }

    function copyId() {
        navigator.clipboard.writeText(posterId);
        setCopiedId(true);
    }

    return (
        <Fragment>
            <button className="w-40 p-2 rounded text-white bg-green-500 hover:bg-green-600 transition font-bold
                    disabled:opacity-30 disabled:hover:bg-green-500 disabled:cursor-not-allowed" disabled={disabled}
                onClick={onSave}>Save Poster</button>


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
                                        {/* <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                                        </div> */}
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
                                                        <span className="text-xl font-bold bg-gray-200 p-2 hover:cursor-pointer"
                                                            data-tooltip-target="copy-tooltip" data-tooltip-trigger="hover"
                                                            onClick={onIdClick}
                                                            onDragEnter={() => setCopiedId(false)}
                                                        >
                                                            {posterId}
                                                        </span>

                                                        <div id="copy-tooltip" role="tooltip"
                                                            className="tooltip absolute z-10 inline-block bg-gray-900 font-medium shadow-sm text-white py-2 px-3 text-sm rounded-lg opacity-0 duration-300 transition-opacity invisible"
                                                            style={{ position: 'absolute', inset: 'auto auto 0px 0px', margin: '0px', transform: 'translate(597px, -293px)' }}
                                                            data-popper-placement="top">
                                                            {
                                                                copiedId ?
                                                                    'Copied!' :
                                                                    'Copy to clipboard'
                                                            }
                                                            <div className="tooltip-arrow" data-popper-arrow></div>
                                                        </div>
                                                        <p id="save-modal-instructions" className="pt-4">
                                                            <a href="#" className="underline" onClick={onIdClick}>Copy</a>
                                                            <span> </span>your poster Id above and paste it in the personalization field back in the <a href={etsyUrl}>Etsy listing</a>
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
}


