import React from 'react'

export default function Layout(props) {
	return (
		<div style={{ marginLeft: '7%', marginRight: '7%' }}>
			{props.children}
		</div>
	)
}
