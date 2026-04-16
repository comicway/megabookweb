import { Link } from "react-router-dom";

const ToolBar = () => {
    return (
        <>
            <div className="fixed bottom-0 w-full shadow-toolbar">
                <div className="container-fluid mx-auto">
                    <div className="grid grid-cols-3 bg-primary h-[74px] place-items-center">
                        <Link to="/">
                            <button className=" text-white-b font-nsbold font-extrabold text-xs items-center flex flex-col justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 -960 960 960"
                                    className="h-[26px] w-[29px] fill-white-b"
                                >
                                    <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
                                </svg>
                                <span>Home</span>
                            </button>
                        </Link>
                        <Link to="/registerbook">
                            <button className=" text-white-b font-nsbold font-extrabold text-xs items-center flex flex-col justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 -960 960 960"
                                    className="h-[29px] w-[29px] fill-white-b"
                                >
                                    <path d="M160-80v-80h640v80H160Zm200-160v-280H200l280-360 280 360H600v280H360Zm80-80h80v-280h76L480-750 364-600h76v280Zm40-280Z" />
                                </svg>
                                <span>Agrega libro</span>
                            </button>
                        </Link>
                        <Link to="/confighabit">
                            <button className=" text-white-b font-nsbold font-extrabold text-xs items-center flex flex-col justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 -960 960 960"
                                    className="h-[29px] w-[29px] fill-white-b"
                                >
                                    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                                </svg>
                                <span>Hábito</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ToolBar;