'use client';

import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import LightLogo from "../public/logo-light.png";
import DarkLogo from "../public/logo-dark.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";



import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';




const navigation = [
	{name: "Home", href: "/"},
	{name: "How To Use", href: "/user-manual"},
	{name: "Subject Planner", href: "/subject-planner"},
	{name: "Calendar", href: "/calendar"},
	{name: "About", href: "/about"},
	{name: "Document", href: "/doc"},





]
{/* <img 
	src="https://cap-theme-prod-ap-southeast-2.s3.ap-southeast-2.amazonaws.com/mq/MQ_Int_HoriztonalLogo.svg" 
	alt="logo"
	className="header-mqlogo"    
/> */}


const SiteHeader = () => {
	const pathName = usePathname()
	const { theme, resolvedTheme } = useTheme();

  const current = resolvedTheme || theme; // handles 'system'
  const logo = current === "dark" ? DarkLogo : LightLogo;

	// useEffect(()=>{
	// 	console.log("theme: ", theme);
	// 	console.log("resolvedTheme: ", resolvedTheme);
	// },[theme, resolvedTheme]);

	// const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), []);
  // if (!mounted) return null; // stop render if not yet mounted, avoid mismatch


	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95'>
			<nav className='mx-auto flex max-w-7xl items-center justify-between lg:px-8 '>
				{/* Logo div */}
				<div>
					<Link href="/">
						<div className='flex items-center'>
							<Image 
								src={logo} 
								alt = "Macquarie logo" 
								className='w-auto h-15 my-3'
								loading='eager'
							/>
							{/* <span className='text-xl font-bold'>AssignmentPlanner</span> */}
						</div>
					</Link>
				</div>

				{/* Mobile user div, hidden when large */}
				<div className='flex lg:hidden'>


				</div>

				{/* Navigation div, show when large */}
				<div className='hidden lg:flex gap-x-8'>
					{navigation.map((item) => (
						<Link
							key={item.href} 
							href={item.href}
							className={cn(
								"text-md font-semibold leading-6 transition-colors hover:text-primary",
								pathName === item.href ? "text-primary" : "text-foreground"
							)}
						>
							{item.name}
						</Link>
					))}
				</div>
				
				<div className='hidden lg:flex'>
					<ModeToggle/>

				</div>



			</nav>
		</header>
	)
}

export default SiteHeader