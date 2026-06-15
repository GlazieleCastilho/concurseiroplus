"use client";

import {Separator} from "@/components/ui/separator";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import {
    BookOpen,
    BookUp2,
    Brain,
    ChartArea,
    MessageCircle,
    Trophy,
    Users,
    Calendar1,
    FileClock,
    CalendarCheck,
    Headset,
    SquarePen,
    Newspaper,
    MessageCircleHeart,
    ChartLine,
    House,
} from "lucide-react";
import Link from "next/link";

type NavItem = {
    label:string;
    path:string;
    icon: React.ElementType;
};

export const NavItems =() => {
    const {user} = useUser();

    const isAdmin = user?.publicMetadata?.role === "admin" || user?.publicMetadata?.role === "super_admin";
    const navItems: NavItem[] = [
        {
            label:"Inicio",
            path:"/dashboard",
            icon:House,
        },
        {
            label:"Simulados",
            path: "/simulados",
            icon: FileClock,
        },
        {
            label:"Redacao IA",
            path:"/redacao",
            icon:SquarePen,
        },
        {
            label:"Skills",
            path:"/skills",
            icon:Brain,
        },
        {
            label:"Material de Estudos",
            path: "/material-estudos",
            icon: BookUp2,
        },
        {
            label:"Ranking",
            path:"/ranking",
            icon:Trophy,
        },
        {
            label:"Planner",
            path:"/planner",
            icon:Calendar1,
        },
        {
            label:"Concursos",
            path:"/concursos",
            icon:CalendarCheck,
        },
        {
            label:"Feed",
            path:"/feed",
            icon:Newspaper,
        },
        {
            label:"Social",
            path:"/social",
            icon:MessageCircleHeart,
        },
        {
            label:"Estatisticas",
            path:"/estatisticas",
            icon:ChartLine,
        },
        {
            label:"Suporte",
            path:"/suportes",
            icon:Headset,
        },
    ];
    const adminNavItems: NavItem[] = [
        {
            label:"Estatísticas",
            path:"/admin",
            icon: ChartArea,
        },
        {
            label:"Gerenciar Questoes",
            path: "/admin/questions",
            icon: BookOpen,
        },
        {
            label: "Gerenciar Usuarios",
            path:"/admin/users",
            icon:Users,

        },
        {
            label:"Gerenciar Comentários",
            path:"/admin/comments",
            icon:MessageCircle,
        },
    ];
    const renderNavItems = (items: NavItem[]) => {
        return items.map((item) => (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.path}>
                    <item.icon className="text-primary group-data-[collapsible=icon]:text-white hover:text-primary transition-all"/>
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ));
    };
    return (
        <SidebarGroup>
            <SidebarMenu>
                {renderNavItems(navItems)}

                {isAdmin && (
                    <>
                        <Separator className="my-2"/>
                        {renderNavItems(adminNavItems)}
                    </>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
    
};
