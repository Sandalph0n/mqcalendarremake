'use client';

import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import LightLogo from "../public/logo-light.png";
import DarkLogo from "../public/logo-dark.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Menu, Route, X } from 'lucide-react';
import { Button } from './ui/button';
import { FileBracesCorner } from "lucide-react"
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ModeToggle } from './ModeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction, CardFooter } from './ui/card';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
	CustomNavigationMenuTrigger,
	customNavigationMenuTriggerStyle,
	CustomNavigationMenuLink

} from "@/components/ui/navigation-menu"


interface INavigation {
	name: string,
	description?: string,
	href: string,
	childen?: INavigation[]
}

const navigation: INavigation[] = [
	{
		name: "Home", href: "/",
		childen: [
			{
				name: "How To Use",
				href: "/user-manual",
				description: "Quick 6-step guide to set the term, add units, view the heatmap, and save locally.",
			},
			{
				name: "Document",
				href: "/doc",
				description: "Detailed docs on milestones, editing assessments, and common fixes.",
			},
			{
				name: "About",
				href: "/about",
				description: "Meet the student team, core values, and how the app keeps your data transparent.",
			},
		]
	},

	{ name: "Subject Planner", href: "/subject-planner" },
	{ name: "Calendar", href: "/calendar" },

]


const MobileNavigation = [
	{ name: "Home", href: "/" },
	{ name: "How To Use", href: "/user-manual" },
	{ name: "Subject Planner", href: "/subject-planner" },
	{ name: "Calendar", href: "/calendar" },
	{ name: "About", href: "/about" },
	{ name: "Document", href: "/doc" },
	{ name: "Data Manager", href: "/data-manager"}

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
							{/* <span className='text-xl font-bold'>AssessmentPlanner</span> */}
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
									<CardTitle>Assessment planner</CardTitle>
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
									{MobileNavigation.map((item) => (
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

								<hr className='mt-2' />
							</CardContent>
							<CardFooter className='flex justify-between gap-2.5 flex-col'>
								<div className='flex items-center justify-between gap-2.5 w-full'>
									<div>
										<p>Toggle theme</p>
									</div>
									<div>
										<ModeToggle />
									</div>

								</div>


								


							</CardFooter>
						</Card>
					</div>

				</div>


				{/* Navigation div, show when large */}
				<div className='hidden lg:flex gap-x-8'>
					<NavigationMenu>
						<NavigationMenuList>
							{navigation.map((item) => {
								// <Link
								// 	key={item.href}
								// 	href={item.href}
								// 	className={cn(
								// 		"text-md font-semibold leading-6 transition-colors hover:text-primary",
								// 		pathName === item.href ? "text-primary" : "text-foreground"
								// 	)}
								// >
								// 	{item.name}
								// </Link>

								if (!item.childen) { // no children
									return (
										<NavigationMenuItem>
											<CustomNavigationMenuLink
												asChild
												className={cn(customNavigationMenuTriggerStyle(), // this function is edited to achieve custom style  
													"text-md font-semibold leading-6 transition-colors",
													pathName === item.href ? "text-primary" : "text-foreground")}
												key={item.href + "menulink"}
											>
												<Link key={item.href + "link"} href={item.href}>{item.name}</Link>
											</CustomNavigationMenuLink>
										</NavigationMenuItem>
									)
								}

								else { // has children
									// return null
									return (
										<NavigationMenuItem>
											<CustomNavigationMenuTrigger
												className={cn(
													"text-md font-semibold leading-6 transition-colors ",
													pathName === item.href ? "text-primary" : "text-foreground")}
											>
												<Link href={item.href} >
													{item.name}
												</Link>
											</CustomNavigationMenuTrigger>

											<NavigationMenuContent>
												<ul
													className={cn(
														"grid w-100 gap-2 ",
														// "md:w-125 lg:w-150"
													)
													}>
													{item.childen.map((component) => (
														<ListItem
															key={component.name}
															title={component.name}
															href={component.href}
														>
															{component.description}
														</ListItem>
													))}

												</ul>

											</NavigationMenuContent>

										</NavigationMenuItem>
									)


								}

							})}
						</NavigationMenuList>
					</NavigationMenu>



				</div>

				<div className='hidden lg:flex items-center justify-center gap-2'>
					<ModeToggle />

					<Button asChild variant={'outline'}>
						<Link href={"/data-manager"}><FileBracesCorner /> Data</Link>
					</Button>
				</div>
			</nav>
		</header>
	)
}

function ListItem({
	title,
	children,
	href,
	...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
	return (
		<li {...props}>
			<NavigationMenuLink asChild>
				<Link href={href} className='group'>
					<div className="flex flex-col gap-1 text-sm">
						<div className="leading-none font-medium">{title}</div>
						<div className="text-muted-foreground line-clamp-2 group-hover:text-accent-foreground">{children}</div>
					</div>
				</Link>
			</NavigationMenuLink>
		</li>
	)
}


export default SiteHeader
