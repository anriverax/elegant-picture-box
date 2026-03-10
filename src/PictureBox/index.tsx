import * as React from 'react';

interface PictureBoxProps {
	src?: string;
	alt?: string;
}

const PictureBox: React.FC<PictureBoxProps> = ({ src, alt }) => {
	return (
		<div>
			{src ? <img src={src} alt={alt || ''} /> : <span>No image provided</span>}
		</div>
	);
};

export default PictureBox;
