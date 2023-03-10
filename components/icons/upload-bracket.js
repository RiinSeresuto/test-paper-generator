const UploadBracket = ({ size, color }) => {
    return (
        <>
            <svg
                fill={color ? color : "#000000"}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M23,13v8a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V13a1,1,0,0,1,2,0v7H21V13a1,1,0,0,1,2,0ZM12,18a1,1,0,0,0,1-1V5.414l2.293,2.293a1,1,0,0,0,1.414-1.414l-4-4a1,1,0,0,0-1.414,0l-4,4A1,1,0,1,0,8.707,7.707L11,5.414V17A1,1,0,0,0,12,18Z" />
            </svg>
        </>
    );
};

export default UploadBracket;
