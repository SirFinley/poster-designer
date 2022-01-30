/* This example requires Tailwind CSS v2.0+ */
import { ChangeEvent, Fragment, useContext, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { Dialog, Transition } from '@headlessui/react';
import DropArea from './DropArea';
import { observer } from 'mobx-react-lite';
import { PosterContext } from '../util/Context';

const ClearPosterModal = observer(() => {
    const poster = useContext(PosterContext);
    const [open, setOpen] = useState(true)
    const emptyRef = useRef(null);

    function onDrop(files: FileList) {
        poster.image.uploadFile(files);
        setOpen(false);
    }

    function onFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files) {
            onDrop(files);
        }
    }

    function onClose() {
        setOpen(false);
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen} initialFocus={emptyRef}>
                <span ref={emptyRef}> {/* empty ref so initial focus is not on the close button */} </span>
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
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <div className="mt-2">
                                        <DropArea onDrop={onDrop}>
                                            <div className="text-center" >
                                                <label className="block p-4">
                                                    <FontAwesomeIcon icon={faUpload} className='text-blue-500 fa-5x mt-8' ></FontAwesomeIcon>
                                                    <div className="p-4">
                                                        <p className="w-full"> Tap here to choose and upload your image </p>
                                                    </div>
                                                    <input type="file" accept="image/*"
                                                        className="hidden"
                                                        onChange={onFileSelect}
                                                    >
                                                    </input>
                                                </label>
                                            </div>
                                        </DropArea>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
});

export default ClearPosterModal;
