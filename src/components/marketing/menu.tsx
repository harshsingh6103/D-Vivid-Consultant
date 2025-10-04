"use client"

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { CalendarRangeIcon, CircleHelp, HashIcon, Newspaper, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Icons from "../global/icons";

interface Props {
    title: string;
    href: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const Menu = () => {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Home
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                        Test
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px] xl:w-[500px]">
                            <Item title="IELTS Test" href="/test/ielts" icon={<CalendarRangeIcon className="w-5 h-5" />}>
                                Prepare for IELTS exam with our comprehensive test materials.
                            </Item>
                            <Item title="Study Abroad Assessment" href="#psychometric-test" icon={<HashIcon className="w-5 h-5" />}>
                                Complete our comprehensive 54-question readiness assessment.
                            </Item>
                            <Item title="Aptitude Test" href="/test/aptitude" icon={<UsersIcon className="w-5 h-5" />}>
                                Assess your logical reasoning and problem-solving skills.
                            </Item>
                            <Item title="Mock Interviews" href="/test/interviews" icon={<CircleHelp className="w-5 h-5" />}>
                                Practice university admission interviews with experts.
                            </Item>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            const element = document.getElementById('psychometric-test');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Services
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            const element = document.getElementById('perks');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Perks
                    </button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <button 
                        onClick={() => {
                            const element = document.getElementById('testimonials');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-none cursor-pointer"
                    >
                        Testimonials
                    </button>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
};

const Item = ({ title, href, children, icon, ...props }: Props) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    passHref
                    href={href}
                    {...props}
                    className="grid grid-cols-[.15fr_1fr] select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                >
                    <div className="flex items-center mt-1 justify-center p-1 w-8 h-8 rounded-md border border-border/80">
                        {icon}
                    </div>
                    <div className="text-start ml-3">
                        <span className="text-sm group-hover:text-foreground font-normal leading-none">
                            {title}
                        </span>
                        <p className="text-sm mt-0.5 line-clamp-2 text-muted-foreground">
                            {children}
                        </p>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    )
};

Item.displayName = "Item";

export default Menu
