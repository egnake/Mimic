import { IKeyProfilePlugin } from "./types";
import { SchlageCPlugin } from "./profiles/schlage-c";
import { KwiksetKW1Plugin } from "./profiles/kwikset-kw1";
import { YaleY1Plugin } from "./profiles/yale-y1";
import { MasterM1Plugin } from "./profiles/master-m1";
import { KaleDimplePlugin } from "./profiles/kale-dimple";

export const ProfileRegistry: Record<string, IKeyProfilePlugin> = {
  "schlage-c": SchlageCPlugin,
  "kwikset-kw1": KwiksetKW1Plugin,
  "yale-y1": YaleY1Plugin,
  "master-m1": MasterM1Plugin,
  "kale-dimple": KaleDimplePlugin,
};

export function getPlugin(id: string): IKeyProfilePlugin | undefined {
  return ProfileRegistry[id];
}

export function getAllPlugins(): IKeyProfilePlugin[] {
  return Object.values(ProfileRegistry);
}
