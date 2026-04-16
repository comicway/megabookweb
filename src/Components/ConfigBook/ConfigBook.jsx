import { Link } from "react-router-dom";

const ConfigBook = () => {
    return (
        <>
            <div className="container mx-auto px-2 mt-[20px]">
                <div className="grid grid-cols-1">
                    <div>
                        <Link to="/readbook">
                            <button className="w-full bg-secundary h-14 text-black-a font-nsbold font-bold rounded-full text-btn flex justify-center items-center gap-2 shadow-general">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 -960 960 960"
                                    className="h-8 w-8 fill-black-a"
                                >
                                    <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
                                </svg>
                                <span>Comenzar a leer</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ConfigBook;