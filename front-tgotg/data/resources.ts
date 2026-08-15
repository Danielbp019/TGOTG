import { Coins, TreePine, Mountain, Pickaxe, Wheat } from "lucide-react"
import type { Resource, ResourceKey } from "@/types"

export const resources: Record<ResourceKey, Omit<Resource, "amount" | "perHour">> = {
  gold: { key: "gold", label: "Oro", icon: Coins },
  wood: { key: "wood", label: "Madera", icon: TreePine },
  stone: { key: "stone", label: "Piedra", icon: Mountain },
  iron: { key: "iron", label: "Hierro", icon: Pickaxe },
  food: { key: "food", label: "Comida", icon: Wheat },
}

export const resourceAmounts: Record<ResourceKey, number> = {
  gold: 12450,
  wood: 8300,
  stone: 6200,
  iron: 4100,
  food: 9700,
}

export const resourcePerHour: Record<ResourceKey, number> = {
  gold: 120,
  wood: 85,
  stone: 60,
  iron: 35,
  food: 95,
}
