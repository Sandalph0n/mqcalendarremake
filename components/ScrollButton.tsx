'use client';

import { Button } from "./ui/button";

import React from 'react'

type Props = {
	targetId: string
	children: React.ReactNode
	className?: string 
} & React.ComponentProps<typeof Button>;

const ScrollButton = ({targetId, children, className, ...rest}:Props) => {
	const handleClick = () => {
		document.getElementById(targetId)?.scrollIntoView({behavior: "smooth"})

	}
	return (
		<Button className={className} onClick={handleClick } {...rest}>
			{children}
		</Button> 
	)
}

export default ScrollButton