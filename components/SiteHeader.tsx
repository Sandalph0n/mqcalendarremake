'use client';

import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import LightLogo from "../public/logo-light.png";
import DarkLogo from "../public/logo-dark.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction, CardFooter } from './ui/card';




const navigation = [
	{ name: "Home", href: "/" },
	{ name: "How To Use", href: "/user-manual" },
	{ name: "Subject Planner", href: "/subject-planner" },
	{ name: "Calendar", href: "/calendar" },
	{ name: "About", href: "/about" },
	{ name: "Document", href: "/doc" },
]
{/* <img 
	src="https://cap-theme-prod-ap-southeast-2.s3.ap-southeast-2.amazonaws.com/mq/MQ_Int_HoriztonalLogo.svg" 
	alt="logo"
	className="header-mqlogo"    
/> */}


const SiteHeader = () => {
	const pathName = usePathname()
	const { theme, resolvedTheme } = useTheme();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
			<nav className='mx-auto flex max-w-7xl items-center justify-between lg:px-8 px-3'>
				{/* Logo div */}
				<div>
					<Link href="/">
						<div className='flex items-center'>
							<Image
								src={logo}
								alt="Macquarie logo"
								className='w-auto h-15 my-3'
								loading='eager'
							/>
							{/* <span className='text-xl font-bold'>AssignmentPlanner</span> */}
						</div>
					</Link>
				</div>

				{/* Mobile user div, hidden when large. button + frame*/}
				<div className='flex lg:hidden'>
					<Button
						variant="ghost"
						className="inline-flex items-center justify-center rounded-md p-2.5"
						onClick={() => setMobileMenuOpen(true)}
					>
						<Menu className="h-6 w-6" aria-hidden="true" />
					</Button>
				</div>

				<div
					className={cn(
						"lg:hidden",
						mobileMenuOpen ? "fixed inset-0 z-50" : "hidden"
					)}
				>
					<div
						className='fixed h-fit top-0 right-0 overflow-y-auto'
					>
						<Card className='w-80 rounded-none sm:ring-1 sm:ring-gray-900/20'>
							<CardHeader>
								<div>
									<CardTitle>Assignment planner</CardTitle>
									<CardDescription>
										Planner for student by student
									</CardDescription>
								</div>

								<CardAction>
									<Button
										variant="ghost"
										className="h-10 w-10"
										onClick={() => setMobileMenuOpen(false)}
									>
										<X />
									</Button>
								</CardAction>
							</CardHeader>

							<CardContent>
								<div
									className='flow-root'
								>
									{navigation.map((item) => (
										<Link
											key={item.name}
											href={item.href}
											className={cn(
												"-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7",
												pathName === item.href
													? "bg-primary/10 text-primary"
													: "text-foreground hover:bg-muted"
											)}
											onClick={() => setMobileMenuOpen(false)}
										>
											{item.name}
										</Link>
									))}
								</div>

							<hr className='mt-2'/>
							</CardContent>
							<CardFooter className='flex justify-between'>
								<div>
									<p>Toggle theme</p>
								</div>
								<div>
									<ModeToggle />
								</div>
							</CardFooter>
						</Card>
					</div>

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
					<ModeToggle />
				</div>
			</nav>
		</header>
	)
}

export default SiteHeader