import {
	BriefcaseMedicalIcon,
	CarIcon,
	ChefHatIcon,
	CroissantIcon,
	DrillIcon,
	FlameIcon,
	FuelIcon,
	HamburgerIcon,
	PackageIcon,
	SchoolIcon,
	SquareParkingIcon,
	StoreIcon,
} from "@lucide/svelte";
import type { Component } from "svelte";

export const POIIcons: Record<string, Component> = {
	"amenity=school": SchoolIcon,
	"amenity=doctors": BriefcaseMedicalIcon,
	"amenity=parking": SquareParkingIcon,
	"shop=doityourself": DrillIcon,
	"shop=car": CarIcon,
	"amenity=fuel": FuelIcon,
	"shop=supermarket": StoreIcon,
	"amenity=parcel_locker": PackageIcon,
	"amenity=fire_station": FlameIcon,
	"shop=kiosk": StoreIcon,
	"amenity=restaurant": ChefHatIcon,
	"amenity=fast_food": HamburgerIcon,
	"shop=bakery": CroissantIcon,
};
