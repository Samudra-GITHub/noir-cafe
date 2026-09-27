import type { Table } from "../index";
import { brewing } from "./brewing";
import { common } from "./common";
import { home } from "./home";
import { locations } from "./locations";
import { menu } from "./menu";
import { order } from "./order";
import { reservation } from "./reservation";
import { shop } from "./shop";
import { story } from "./story";
import { studio } from "./studio";

export const TABLES: readonly Table[] = [common, home, menu, story, brewing, reservation, locations, shop, order, studio];
