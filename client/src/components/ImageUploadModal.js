import React from 'react';


export default function ImageUploadModal({
	isModalOpened,
	toggleModal
}) {

	const [file, setfile] = useState(initialState);
	const handleChange = (event) => {
		setfile(URL.createObjectURL(event.target.files[0]))
	}

	return (
		<>
		
			<Modal isOpen={isModalOpened} toggle={toggleModal}>
				<ModalHeader toggle={isModalOpened}>Upload Logo</ModalHeader>
				<ModalBody>
					<div>
						<input type="file" onChange={this.handleChange} />
						<img src={file} />
					</div>
				</ModalBody>
			</Modal>
		</>
	)
}
