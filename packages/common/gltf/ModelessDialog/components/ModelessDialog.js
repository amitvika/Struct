import React from 'react'
import PropTypes from 'prop-types'

const defaultDialogStyle = {
	position: 'fixed',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	zIndex: 9999,
	background: 'rgba(255, 255, 255, 1)'
}

const defaultBackdropStyle = {
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	zIndex: 9998,
	background: 'rgba(0, 0, 0, 0.3)'
}

class ModelessDialog extends React.Component {
	constructor(props) {
		super(props)

		this.close = this.close.bind(this)
	}

	close(e) {
		e.preventDefault()

		if (this.props.onClose) {
			this.props.onClose()
		}
	}

	render() {
		const {
			children,
			isOpen,
			className, containerClassName, style,
			noBackdrop, clickBackdropToClose, backdropClassName, backdropStyle
		} = this.props

		if (isOpen === false) {
			return null
		}

		const finalDialogStyle = Object.assign({}, defaultDialogStyle, style)
		const finalBackdropStyle = Object.assign({}, defaultBackdropStyle, backdropStyle)

		return (
			<div className={containerClassName}>
				<div className={className} style={finalDialogStyle}>
					{children}
				</div>
				{!noBackdrop &&
					<div className={backdropClassName} style={finalBackdropStyle}
						onClick={clickBackdropToClose && this.close} />}
			</div>
		)
	}
}

ModelessDialog.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element.isRequired),
	]).isRequired,

	isOpen: PropTypes.bool,
	onClose: PropTypes.func,

	className: PropTypes.string,
	containerClassName: PropTypes.string,
	style: PropTypes.object,

	noBackdrop: PropTypes.bool,
	clickBackdropToClose: PropTypes.bool,
	backdropClassName: PropTypes.string,
	backdropStyle: PropTypes.object
}

ModelessDialog.defaultProps = {
	isOpen: false,
	style: {},
	noBackdrop: true,
	clickBackdropToClose: true,
	backdropStyle: {}
}

export default ModelessDialog
